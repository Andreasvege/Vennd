'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type FinalConnectionState,
  type NodeChange,
  type Node,
} from '@xyflow/react'
import { useSession } from 'next-auth/react'
import { fadeFor } from '@/domain/freshness'
import { easeInOut, interpolate } from '@/domain/interpolate'
import type { MapMode } from '@/domain/mapMode'
import type { Point } from '@/domain/layouts/types'
import { movePerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import { t } from '@/i18n'
import { PersonNode, type PersonNodeData } from './PersonNode'
import { MeNode } from './MeNode'
import { RelationshipEdge, type RelationshipEdgeData } from './RelationshipEdge'
import { BundledEdge, type BundledEdgeData } from './BundledEdge'
import { DerivedEdge, type DerivedEdgeData } from './DerivedEdge'
import { MapBackdrop } from './MapBackdrop'
import type { useMapModel } from './useMapModel'
import type { ConnectRequest } from './ConnectCard'

// Syntetisk id. «Meg» er ingen databaserad, så den kan ikke kollidere med en cuid.
const ME_ID = 'me'
const TRANSITION_MS = 450
// Avstand fra nodens topp til midten av avataren: layoutene regner i
// avatarens sentrum, React Flow plasserer etter toppen.
const PERSON_TOP = 28
const ME_TOP = 36

const nodeTypes = { person: PersonNode, me: MeNode }
const edgeTypes = { relationship: RelationshipEdge, bundled: BundledEdge, derived: DerivedEdge }

const pairKey = (a: string, b: string) => [a, b].sort().join('|')
// Slipper du en person nærmere enn dette fra en annen, er det «koble», ikke «flytt».
const DROP_ON = 40

// På en mobilskjerm er «vis alt» med mange personer bare prikker. Der starter
// kartet på en lesbar zoom rundt midten (deg); knappen «vis alt» viser alt.
const NARROW = '(max-width: 640px)'
const fitFor = (narrow: boolean) => ({ padding: 0.2, ...(narrow && { minZoom: 0.55 }) })
function useNarrow() {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(NARROW)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  )
}

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (fn) => {
      const mq = window.matchMedia(reducedMotionQuery)
      mq.addEventListener('change', fn)
      return () => mq.removeEventListener('change', fn)
    },
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  )
}

type Props = {
  model: ReturnType<typeof useMapModel>
  mode: MapMode
  /** En sti å vise (fra «Se stien»): personer i rekkefølge. */
  highlight: string[]
  /** Hvem som er valgt. På PC styres det av adressen (profilen i panelet). */
  selectedId: string | null
  onSelect: (personId: string | null) => void
  onDerivedClick: (a: string, b: string) => void
  /** Et drag som skal bli en kobling: kortet åpnes der du slapp. */
  onConnectRequest: (request: ConnectRequest) => void
  /** Musen over en person (for hintet om å dra). */
  onHoverPerson?: (hovering: boolean) => void
  onError: (message: string) => void
  /** Øk for å tilpasse utsnittet når nodene har glidd på plass (f.eks. etter «Rydd opp»). */
  refit?: number
}

/**
 * Selve kartet: samme personer og relasjoner i tre syn. Synet bestemmer
 * bare hvor folk står; når det byttes, glir de til nye plasser, så du ser
 * at det er det samme kartet fra en annen vinkel.
 */
export function VennekartCanvas({
  model,
  mode,
  highlight,
  selectedId,
  onSelect,
  onDerivedClick,
  onConnectRequest,
  onHoverPerson,
  onError,
  refit = 0,
}: Props) {
  const { data: session } = useSession()
  const flow = useReactFlow()
  const reducedMotion = usePrefersReducedMotion()
  const narrow = useNarrow()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  // Buntede kanter i Kretser beregnes for sluttposisjonene; de tones inn
  // når overgangen til synet er ferdig. Å huske *hvilket* syn som sist
  // kom på plass gjør at de er usynlige fra første ramme etter et bytte.
  const [settledMode, setSettledMode] = useState<MapMode | null>(mode)
  const settled = settledMode === mode
  const lastMode = useRef<MapMode | null>(null)
  const lastRefit = useRef(refit)
  // Et ønske om å se alt, som venter til nodene faktisk flytter seg: «Rydd
  // opp» ber om det før de nye plasseringene er kommet fra serveren.
  const wantFit = useRef(false)

  const { visible, targets, fresh, relationships, derived, edgePath, groupById } = model

  // Noder: plasser, data og overgangen mellom syn.
  useEffect(() => {
    // «Deg» står i origo i alle syn. I Nettverk er det der «Rydd opp» og
    // nye personer regner fra, så du blir stående når du flytter på andre.
    const meCenter: Point = { x: 0, y: 0 }

    const current = new Map(flow.getNodes().map((n) => [n.id, n]))
    const target: Node[] = [
      ...(visible.length
        ? [
            {
              id: ME_ID,
              type: 'me',
              position: { x: meCenter.x, y: meCenter.y - ME_TOP },
              draggable: false,
              selectable: false,
              data: { name: session?.user?.name ?? t.common.you, image: session?.user?.image ?? null },
            },
          ]
        : []),
      ...visible.map((p) => {
        const c = targets.get(p.id) ?? { x: 0, y: 0 }
        return {
          // Behold det React Flow vet om noden fra før (målt størrelse,
          // håndtak), så den ikke må måles på nytt.
          ...current.get(p.id),
          id: p.id,
          type: 'person',
          position: { x: c.x, y: c.y - PERSON_TOP },
          // Valget settes i en egen effekt, så et nytt valg aldri flytter noen.
          selected: current.get(p.id)?.selected ?? false,
          data: {
            id: p.id,
            name: p.name,
            tint: p.tint,
            photoUrl: p.photoUrl,
            fade: fadeFor(fresh.get(p.id) ?? 0),
            // I Nærhet og Kretser står folk fast; der betyr et drag fra personen «koble».
            connectFromBody: mode !== 'network',
          } satisfies PersonNodeData,
        }
      }),
    ]

    // Nytt syn, eller et ønske om å se alt (etter «Rydd opp»): tilpass utsnittet.
    const modeChanged = lastMode.current !== null && lastMode.current !== mode
    if (lastRefit.current !== refit) wantFit.current = true
    lastMode.current = mode
    lastRefit.current = refit
    const from = new Map([...current].map(([id, n]) => [id, n.position]))
    const to = new Map(target.map((n) => [n.id, n.position]))
    const moves = [...to].some(([id, p]) => {
      const f = from.get(id)
      return !f || Math.abs(f.x - p.x) > 0.5 || Math.abs(f.y - p.y) > 0.5
    })

    // Første tegning, redusert bevegelse, eller ingen som flytter seg (f.eks.
    // ny data etter en handling): rett på plass, uten overgang.
    if (reducedMotion || current.size === 0 || !moves) {
      const raf = requestAnimationFrame(() => {
        setNodes(target)
        setSettledMode(mode)
        if (modeChanged) flow.fitView(fitFor(narrow))
      })
      return () => cancelAnimationFrame(raf)
    }

    // Ellers glir de, fra der nodene står *nå* — også midt i en annen
    // overgang. Hver ramme endrer bare posisjonene; valg og målinger står.
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / TRANSITION_MS)
      const at = interpolate(from, to, easeInOut(progress))
      setNodes((prev) => prev.map((n) => ({ ...n, position: at.get(n.id) ?? n.position })))
      if (progress < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setSettledMode(mode)
        if (modeChanged || wantFit.current) {
          wantFit.current = false
          flow.fitView({ ...fitFor(narrow), duration: 300 })
        }
      }
    }
    raf = requestAnimationFrame((now) => {
      // Nye data og nye noder først (på startplassene), så beveger de seg.
      setNodes(target.map((n) => ({ ...n, position: from.get(n.id) ?? n.position })))
      step(now)
    })
    return () => cancelAnimationFrame(raf)
  }, [visible, targets, fresh, mode, session, flow, setNodes, reducedMotion, refit, narrow])

  // Hvem som er valgt, fra adressen eller personlinjen. Bare markeringen
  // endres; plassene står.
  useEffect(() => {
    if (nodes.every((n) => n.selected === (n.id === selectedId))) return
    setNodes((prev) => prev.map((n) => (n.selected === (n.id === selectedId) ? n : { ...n, selected: n.id === selectedId })))
  }, [selectedId, nodes, setNodes])

  // Valgt fra et annet sted (søk, en lenke) og utenfor synsfeltet: gli dit.
  // Venter til kartet har tegnet seg og tilpasset utsnittet første gang,
  // ellers overstyrer den første «vis alt» dette.
  const ready = nodes.length > 0
  useEffect(() => {
    if (!selectedId || !ready) return
    const timer = setTimeout(() => {
      const node = flow.getNode(selectedId)
      const box = document.querySelector('.react-flow')?.getBoundingClientRect()
      if (!node || !box) return
      const at = flow.flowToScreenPosition({ x: node.position.x, y: node.position.y + PERSON_TOP })
      const margin = 80
      // På mobil ligger personlinjen over den nederste delen av kartet.
      const bottom = narrow ? 220 : margin
      const inside =
        at.x > box.left + margin && at.x < box.right - margin && at.y > box.top + margin && at.y < box.bottom - bottom
      if (inside) return
      // Litt over midten på mobil, så de ikke havner bak personlinjen.
      flow.setCenter(node.position.x, node.position.y + PERSON_TOP + (narrow ? 90 / Math.max(flow.getZoom(), 0.8) : 0), {
        zoom: Math.max(flow.getZoom(), 0.8),
        duration: reducedMotion ? 0 : 400,
      })
    }, 120)
    return () => clearTimeout(timer)
  }, [selectedId, ready, flow, reducedMotion, narrow])

  // Valg går via onSelect, så PC-en kan vise profilen i panelet. React Flow
  // melder valg både fra mus og tastatur (Enter på en person).
  const handleNodesChange = (changes: NodeChange[]) => {
    for (const c of changes) {
      if (c.type === 'select' && c.selected && c.id !== ME_ID && c.id !== selectedId) onSelect(c.id)
    }
    onNodesChange(changes.filter((c) => c.type !== 'select'))
  }

  // Kanter: stråler fra deg (bare i Nettverk), relasjoner og «ofte sammen».
  // Vises en sti, tegnes den med rødblyant og alt annet tones ned.
  useEffect(() => {
    const onPath = new Set(highlight.slice(1).map((id, i) => pairKey(highlight[i], id)))
    const pathMode = onPath.size > 0
    // Nærhet og Nettverk: strekene er bakgrunn. Kretser har sin egen, buntede ro.
    const calm = mode !== 'circles'
    const focusOf = (a: string, b: string) =>
      !selectedId || pathMode ? undefined : a === selectedId || b === selectedId ? ('on' as const) : ('off' as const)
    // Mange etiketter blir et virvar: på fulle kart bare for den valgte.
    const roomForLabels = relationships.length <= 20
    const labelFor = (focus: 'on' | 'off' | undefined) => focus === 'on' || (focus === undefined && roomForLabels && !pathMode)
    // I Nettverk viser øya at to i samme miljø hører sammen; streken mellom dem er da underforstått.
    const impliedBetween = (a: string, b: string) => mode === 'network' && groupById.get(a) != null && groupById.get(a) === groupById.get(b)

    const spokes: Edge[] =
      mode === 'network'
        ? visible.map((p) => ({
            id: `me:${p.id}`,
            source: ME_ID,
            target: p.id,
            targetHandle: 'center',
            type: 'relationship',
            // Hva de er for deg («fetter») står på strålen, men bare når de er valgt.
            data: {
              type: p.type,
              variant: 'spoke',
              label: p.relationLabel,
              dimmed: pathMode,
              calm,
              weight: fresh.get(p.id) ?? 0,
              focus: focusOf(ME_ID, p.id),
              showLabel: focusOf(ME_ID, p.id) === 'on',
            } satisfies RelationshipEdgeData,
          }))
        : []

    const between: Edge[] = relationships.map((r) => {
      const inPath = onPath.has(pairKey(r.fromPersonId, r.toPersonId))
      const data: RelationshipEdgeData = {
        type: r.type,
        variant: 'between',
        // I Kretser ville etikettene midt på buntene bare lagt seg oppå hverandre.
        label: mode === 'circles' ? null : r.label,
        historical: r.until !== null,
        path: inPath,
        dimmed: pathMode && !inPath,
        calm,
        implied: impliedBetween(r.fromPersonId, r.toPersonId),
        focus: focusOf(r.fromPersonId, r.toPersonId),
        showLabel:
          labelFor(focusOf(r.fromPersonId, r.toPersonId)) &&
          (focusOf(r.fromPersonId, r.toPersonId) === 'on' || !impliedBetween(r.fromPersonId, r.toPersonId)),
      }
      const route = mode === 'circles' ? edgePath?.(r.fromPersonId, r.toPersonId) : null
      const base = {
        id: r.id,
        source: r.fromPersonId,
        target: r.toPersonId,
        sourceHandle: 'center',
        targetHandle: 'center',
      }
      return route
        ? { ...base, type: 'bundled', data: { ...data, route, visible: settled } satisfies BundledEdgeData }
        : { ...base, type: 'relationship', data }
    })

    const derivedEdges: Edge[] = derived.map((d) => ({
      id: `derived:${d.a}:${d.b}`,
      source: d.a,
      target: d.b,
      sourceHandle: 'center',
      targetHandle: 'center',
      type: 'derived',
      ariaLabel: `${t.map.derived(d.count)}. ${t.map.derivedHint}`,
      data: { count: d.count, dimmed: pathMode, focus: focusOf(d.a, d.b) } satisfies DerivedEdgeData,
    }))

    setEdges(visible.length ? [...spokes, ...between, ...derivedEdges] : [])
  }, [visible, relationships, derived, edgePath, mode, highlight, settled, setEdges, fresh, selectedId, groupById])

  // Skjermpunktet (i kartets boks) for et punkt i kartet, der kortet skal stå.
  const boxPoint = (flowPoint: Point): Point => {
    const box = document.querySelector('.react-flow')?.getBoundingClientRect()
    const screen = flow.flowToScreenPosition(flowPoint)
    return { x: screen.x - (box?.left ?? 0), y: screen.y - (box?.top ?? 0) }
  }
  const centerOf = (id: string): Point | null => {
    const n = flow.getNode(id)
    if (!n) return null
    return { x: n.position.x, y: n.position.y + PERSON_TOP }
  }

  // Et drag fra en person er slutt. Over en annen person: koble dem. Ute i
  // tomrommet: «Hvem kjenner …?», med plassen der du slapp (i Nettverk).
  const onConnectEnd = (event: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    const from = state.fromNode?.id
    if (!from || from === ME_ID) return
    const to = state.toNode?.id
    if (to && to !== ME_ID && to !== from) {
      const c = centerOf(to)
      if (c) onConnectRequest({ kind: 'pair', a: from, b: to, at: boxPoint(c) })
      return
    }
    if (to) return
    const pointer = 'changedTouches' in event ? event.changedTouches[0] : event
    const flowAt = flow.screenToFlowPosition({ x: pointer.clientX, y: pointer.clientY })
    onConnectRequest({ kind: 'new', from, at: boxPoint(flowAt), flowAt: mode === 'network' ? flowAt : null })
  }

  // Bare i Nettverk er plassen din; der lagres den (som avatarens sentrum).
  // Slippes personen oppå en annen, er det en kobling: hun glir tilbake.
  const dragFrom = useRef<Point | null>(null)
  const onNodeDragStop = async (_event: React.MouseEvent, node: Node) => {
    if (node.id === ME_ID || mode !== 'network') return
    const at = { x: node.position.x, y: node.position.y + PERSON_TOP }
    const onto = flow
      .getNodes()
      .find((n) => n.id !== node.id && n.id !== ME_ID && Math.hypot(n.position.x - node.position.x, n.position.y - node.position.y) < DROP_ON)
    if (onto && dragFrom.current) {
      const back = dragFrom.current
      setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, position: { x: back.x, y: back.y - PERSON_TOP } } : n)))
      const c = { x: onto.position.x, y: onto.position.y + PERSON_TOP }
      onConnectRequest({ kind: 'pair', a: node.id, b: onto.id, at: boxPoint(c) })
      return
    }
    const result = await settle(movePerson(node.id, at.x, at.y))
    if (!result.ok) onError(t.errors[result.error])
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onPaneClick={() => selectedId && onSelect(null)}
      onEdgesChange={onEdgesChange}
      onConnectEnd={onConnectEnd}
      // Et klikk på en person skal velge dem, ikke starte en kobling.
      connectOnClick={false}
      // Å flytte noen i Nettverk skal ikke åpne profilen deres.
      selectNodesOnDrag={false}
      onNodeDragStart={(_e, node) => {
        dragFrom.current = { x: node.position.x, y: node.position.y + PERSON_TOP }
      }}
      onNodeDragStop={onNodeDragStop}
      onNodeMouseEnter={(_e, node) => node.id !== ME_ID && onHoverPerson?.(true)}
      onNodeMouseLeave={() => onHoverPerson?.(false)}
      onEdgeClick={(e, edge) => {
        if (edge.type === 'derived') return onDerivedClick(edge.source, edge.target)
        // En strek mellom to: se og endre koblingen der du klikket.
        if (edge.source === ME_ID) return
        const box = document.querySelector('.react-flow')?.getBoundingClientRect()
        onConnectRequest({
          kind: 'pair',
          a: edge.source,
          b: edge.target,
          at: { x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) },
          relationshipId: edge.id,
        })
      }}
      // Tastatur: velg en strek og trykk Enter. «Ofte sammen» blir en
      // relasjon; en relasjon åpnes for å endres.
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return
        const edge = flow.getEdges().find((x) => x.selected)
        if (!edge || edge.source === ME_ID) return
        if (edge.type === 'derived') return onDerivedClick(edge.source, edge.target)
        const a = centerOf(edge.source)
        const b = centerOf(edge.target)
        if (a && b) {
          const at = boxPoint({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
          onConnectRequest({ kind: 'pair', a: edge.source, b: edge.target, at, relationshipId: edge.id })
        }
      }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={[0.5, 0]}
      nodesDraggable={mode === 'network'}
      proOptions={{ hideAttribution: true }}
      fitView
      fitViewOptions={fitFor(narrow)}
      // Målhåndtaket tar ikke pointer-events (ellers kunne man ikke dra
      // noden), så vi lar React Flow snappe geometrisk i stedet.
      connectionRadius={60}
      connectionLineStyle={{ stroke: 'var(--pen)', strokeWidth: 1.5 }}
      // Store nettverk på en mobilskjerm: «vis alt» skal faktisk vise alt.
      minZoom={0.1}
      maxZoom={2}
    >
      {/* Svak prikkstruktur, som papir med punktrutenett. */}
      <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="var(--rule)" />
      <MapBackdrop backdrop={model.backdrop} />
      <Controls showInteractive={false} position="top-right" />
    </ReactFlow>
  )
}
