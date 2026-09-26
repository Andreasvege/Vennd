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
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { fadeFor } from '@/domain/freshness'
import { easeInOut, interpolate } from '@/domain/interpolate'
import type { MapMode } from '@/domain/mapMode'
import type { Point } from '@/domain/layouts/types'
import { createRelationship } from '@/server/actions/relationship'
import { movePerson } from '@/server/actions/person'
import { settle } from '@/server/actions/result'
import type { Proximity } from '@/server/queries/proximity'
import { t } from '@/i18n'
import { PersonNode, type PersonNodeData } from './PersonNode'
import { MeNode } from './MeNode'
import { RelationshipEdge, type RelationshipEdgeData } from './RelationshipEdge'
import { BundledEdge, type BundledEdgeData } from './BundledEdge'
import { DerivedEdge, type DerivedEdgeData } from './DerivedEdge'
import { MapBackdrop } from './MapBackdrop'
import type { useMapModel } from './useMapModel'

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
  onAddLog: (personId: string) => void
  onDerivedClick: (a: string, b: string) => void
  onProximities: (p: Proximity[]) => void
  onError: (message: string) => void
}

/**
 * Selve kartet: samme personer og relasjoner i tre syn. Synet bestemmer
 * bare hvor folk står; når det byttes, glir de til nye plasser, så du ser
 * at det er det samme kartet fra en annen vinkel.
 */
export function VennekartCanvas({ model, mode, highlight, onAddLog, onDerivedClick, onProximities, onError }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const flow = useReactFlow()
  const reducedMotion = usePrefersReducedMotion()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  // Buntede kanter i Kretser beregnes for sluttposisjonene; de tones inn
  // når overgangen til synet er ferdig. Å huske *hvilket* syn som sist
  // kom på plass gjør at de er usynlige fra første ramme etter et bytte.
  const [settledMode, setSettledMode] = useState<MapMode | null>(mode)
  const settled = settledMode === mode
  const lastMode = useRef<MapMode | null>(null)

  const { visible, targets, fresh, relationships, derived, edgePath } = model

  // Noder: plasser, data og overgangen mellom syn.
  useEffect(() => {
    const centers = [...targets.values()]
    const meCenter: Point =
      mode === 'network' && centers.length
        ? {
            x: centers.reduce((s, p) => s + p.x, 0) / centers.length,
            y: centers.reduce((s, p) => s + p.y, 0) / centers.length,
          }
        : { x: 0, y: 0 }

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
          selected: current.get(p.id)?.selected ?? false,
          data: {
            id: p.id,
            name: p.name,
            tint: p.tint,
            photoUrl: p.photoUrl,
            fade: fadeFor(fresh.get(p.id) ?? 0),
            onAddLog,
            onViewProfile: (id: string) => router.push(`/person/${id}`),
          } satisfies PersonNodeData,
        }
      }),
    ]

    const modeChanged = lastMode.current !== null && lastMode.current !== mode
    lastMode.current = mode
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
        if (modeChanged) flow.fitView({ padding: 0.2 })
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
        if (modeChanged) flow.fitView({ padding: 0.2, duration: 300 })
      }
    }
    raf = requestAnimationFrame((now) => {
      // Nye data og nye noder først (på startplassene), så beveger de seg.
      setNodes(target.map((n) => ({ ...n, position: from.get(n.id) ?? n.position })))
      step(now)
    })
    return () => cancelAnimationFrame(raf)
  }, [visible, targets, fresh, mode, session, onAddLog, router, flow, setNodes, reducedMotion])

  // Kanter: stråler fra deg (bare i Nettverk), relasjoner og «ofte sammen».
  // Vises en sti, tegnes den med rødblyant og alt annet tones ned.
  useEffect(() => {
    const onPath = new Set(highlight.slice(1).map((id, i) => pairKey(highlight[i], id)))
    const pathMode = onPath.size > 0

    const spokes: Edge[] =
      mode === 'network'
        ? visible.map((p) => ({
            id: `me:${p.id}`,
            source: ME_ID,
            target: p.id,
            targetHandle: 'center',
            type: 'relationship',
            // Hva de er for deg («fetter») står på strålen, som på kantene mellom andre.
            data: { type: p.type, variant: 'spoke', label: p.relationLabel, dimmed: pathMode } satisfies RelationshipEdgeData,
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
      data: { count: d.count, dimmed: pathMode } satisfies DerivedEdgeData,
    }))

    setEdges(visible.length ? [...spokes, ...between, ...derivedEdges] : [])
  }, [visible, relationships, derived, edgePath, mode, highlight, settled, setEdges])

  // Dra fra knotten under én person til en annen for å lage en relasjon.
  const onConnect = async (connection: Connection) => {
    const { source, target } = connection
    if (!source || !target || source === target || source === ME_ID || target === ME_ID) return
    const exists = relationships.some((r) => pairKey(r.fromPersonId, r.toPersonId) === pairKey(source, target))
    if (exists) return
    const result = await settle(createRelationship({ fromPersonId: source, toPersonId: target, type: 'FRIEND' }))
    if (!result.ok) onError(t.errors[result.error])
    else onProximities(result.data.proximities)
  }

  // Bare i Nettverk er plassen din; der lagres den (som avatarens sentrum).
  const onNodeDragStop = async (_event: React.MouseEvent, node: Node) => {
    if (node.id === ME_ID || mode !== 'network') return
    const result = await settle(movePerson(node.id, node.position.x, node.position.y + PERSON_TOP))
    if (!result.ok) onError(t.errors[result.error])
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStop={onNodeDragStop}
      onEdgeClick={(_e, edge) => {
        if (edge.type === 'derived') onDerivedClick(edge.source, edge.target)
      }}
      // Tastatur: velg en «ofte sammen»-kant og trykk Enter for å gjøre den til en relasjon.
      onKeyDown={(e) => {
        if (e.key !== 'Enter') return
        const edge = flow.getEdges().find((x) => x.selected && x.type === 'derived')
        if (edge) onDerivedClick(edge.source, edge.target)
      }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={[0.5, 0]}
      nodesDraggable={mode === 'network'}
      proOptions={{ hideAttribution: true }}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      // Målhåndtaket tar ikke pointer-events (ellers kunne man ikke dra
      // noden), så vi lar React Flow snappe geometrisk i stedet.
      connectionRadius={60}
      connectionLineStyle={{ stroke: 'var(--pen)', strokeWidth: 1.5 }}
      minZoom={0.2}
      maxZoom={2}
    >
      {/* Svak prikkstruktur, som papir med punktrutenett. */}
      <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="var(--rule)" />
      <MapBackdrop backdrop={model.backdrop} />
      <Controls showInteractive={false} position="top-right" />
    </ReactFlow>
  )
}
