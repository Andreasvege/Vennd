'use client'

import { useEffect, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  BackgroundVariant,
} from '@xyflow/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { PersonNode } from './PersonNode'
import { MeNode } from './MeNode'
import { RelationshipEdge } from './RelationshipEdge'
import { Link2, UserPlus } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { TYPE_TINT, tagFill } from '@/lib/palette'
import { t } from '@/i18n'
import type { Person, Relationship } from '@/types'

// Syntetisk id. «Meg» er ingen databaserad, så den kan ikke kollidere med
// en cuid fra Person.
const ME_ID = 'me'

const nodeTypes = { person: PersonNode, me: MeNode }
const edgeTypes = { relationship: RelationshipEdge }

type Props = {
  onAddPerson: () => void
  onAddLog: (personId: string) => void
  onAddRelationship: () => void
  refreshKey: number
}

export function VennekartCanvas({ onAddPerson, onAddLog, onAddRelationship, refreshKey }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [persons, setPersons] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  // Tom-tilstanden skal bare vises når vi *vet* at kartet er tomt — ikke
  // mens det lastes, og ikke når lastingen feilet.
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/graph')
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as { persons: Person[]; relationships: Relationship[] }
        setPersons(data.persons)
        setRelationships(data.relationships)
        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }
    fetchData()
  }, [refreshKey])

  // Convert persons → React Flow nodes, med deg selv i midten
  useEffect(() => {
    const personNodes: Node[] = persons.map((p: Person) => ({
      id: p.id,
      type: 'person',
      position: { x: p.positionX, y: p.positionY },
      data: {
        id: p.id,
        name: p.name,
        type: p.type,
        onAddLog,
        onViewProfile: (id: string) => router.push(`/person/${id}`),
      },
    }))

    // Plasser «meg» i tyngdepunktet av personene, så noden faktisk står midt
    // i kartet uansett hvor de er dratt hen.
    const center = persons.length
      ? {
          x: persons.reduce((sum, p) => sum + p.positionX, 0) / persons.length,
          y: persons.reduce((sum, p) => sum + p.positionY, 0) / persons.length,
        }
      : { x: 0, y: 0 }

    const meName = session?.user?.name ?? t.common.you
    const meNode: Node = {
      id: ME_ID,
      type: 'me',
      position: center,
      // Noden har ingen lagret posisjon, så den skal ikke kunne dras ut av midten.
      draggable: false,
      selectable: false,
      data: {
        name: meName,
        image: session?.user?.image ?? null,
      },
    }

    setNodes(persons.length ? [meNode, ...personNodes] : personNodes)
  }, [persons, session, onAddLog, router, setNodes])

  // Kanter: én stråle fra «meg» til hver person, farget etter din relasjon
  // til dem. Person↔person beholdes, men dempet — det er sekundært nå.
  useEffect(() => {
    const spokes: Edge[] = persons.map((p: Person) => ({
      id: `me:${p.id}`,
      source: ME_ID,
      target: p.id,
      targetHandle: 'center',
      type: 'relationship',
      data: { type: p.type, variant: 'spoke' },
    }))

    const between: Edge[] = relationships.map((r: Relationship) => ({
      id: r.id,
      source: r.fromPersonId,
      target: r.toPersonId,
      // Fest alltid i sentrum av ikonene, ikke i dra-knotten.
      sourceHandle: 'center',
      targetHandle: 'center',
      type: 'relationship',
      data: { type: r.type, variant: 'between' },
    }))

    setEdges(persons.length ? [...spokes, ...between] : between)
  }, [persons, relationships, setEdges])

  // Dra fra knotten under én person til en annen for å lage en relasjon.
  // Typen settes til FRIEND: Person↔Person er sekundært nå som relasjonen til
  // deg selv ligger på Person, og en typevelger her ville vært i veien.
  const onConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return
    if (connection.source === connection.target) return

    const res = await fetch('/api/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPersonId: connection.source,
        toPersonId: connection.target,
        type: 'FRIEND',
      }),
    })

    if (!res.ok) return

    const created = (await res.json()) as Relationship
    setRelationships((prev) => [...prev, created])
  }

  // Save node position when dragging stops
  const onNodeDragStop = async (_event: React.MouseEvent, node: Node) => {
    if (node.id === ME_ID) return
    await fetch(`/api/persons/${node.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionX: node.position.x, positionY: node.position.y }),
    })
  }

  // Bare typene som faktisk finnes på kartet, i fast rekkefølge.
  const typesInUse = (Object.keys(TYPE_TINT) as Person['type'][]).filter((type) =>
    persons.some((p) => p.type === type),
  )

  return (
    <div className="relative h-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        // Målhåndtaket tar ikke pointer-events (ellers kunne man ikke dra
        // noden), så vi lar React Flow snappe geometrisk i stedet.
        connectionRadius={60}
        connectionLineStyle={{ stroke: 'var(--pen)', strokeWidth: 1.5 }}
        minZoom={0.3}
        maxZoom={2}
      >
        {/* Svak prikkstruktur, som papir med punktrutenett. */}
        <Background variant={BackgroundVariant.Dots} gap={28} size={1.2} color="var(--rule)" />
        <Controls showInteractive={false} position="top-left" />
      </ReactFlow>

      <div className="absolute bottom-5 right-5 z-10 flex items-center gap-2">
        <Button variant="secondary" onPress={onAddRelationship}>
          <Link2 aria-hidden size={16} strokeWidth={1.75} />
          {t.map.newRelationship}
        </Button>
        <Button variant="primary" size="lg" onPress={onAddPerson}>
          <UserPlus aria-hidden size={18} strokeWidth={1.75} />
          {t.map.newPerson}
        </Button>
      </div>

      {typesInUse.length > 0 && (
        <ul
          aria-label={t.map.legend}
          className="absolute bottom-5 left-5 z-10 hidden flex-col gap-1.5 rounded-[10px] border border-rule bg-paper-raised/90 px-3 py-2.5 sm:flex"
        >
          {typesInUse.map((type) => (
            <li key={type} className="flex items-center gap-2 text-[12px] text-ink-muted">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: tagFill(TYPE_TINT[type]), boxShadow: 'inset 0 0 0 1px var(--ink)' }}
              />
              {t.relationType[type]}
            </li>
          ))}
        </ul>
      )}

      {status === 'error' && (
        <p role="alert" className="absolute left-1/2 top-5 z-10 -translate-x-1/2 rounded-[10px] border border-rule bg-paper-raised px-4 py-2 text-[14px] text-redpencil">
          {t.map.loadFailed}
        </p>
      )}

      {status === 'ready' && persons.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <EmptyState
            title={t.map.emptyTitle}
            body={t.map.emptyBody}
            className="pointer-events-auto"
            action={
              <Button variant="primary" size="lg" onPress={onAddPerson}>
                <UserPlus aria-hidden size={18} strokeWidth={1.75} />
                {t.map.newPerson}
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
