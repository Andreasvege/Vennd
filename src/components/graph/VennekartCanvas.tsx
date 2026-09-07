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
import { RELATIONSHIP_COLORS, RELATIONSHIP_LABELS } from '@/lib/relationship-colors'
import type { Person, Relationship } from '@/types'

// Syntetisk id. «Meg» er ingen databaserad, så den kan ikke kollidere med
// en cuid fra Person.
const ME_ID = 'me'

const initialsOf = (name: string) =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

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
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    async function fetchData() {
      const [personsRes, relationshipsRes] = await Promise.all([
        fetch('/api/persons'),
        fetch('/api/relationships'),
      ])
      if (!personsRes.ok || !relationshipsRes.ok) return
      const [personsData, relData] = await Promise.all([
        personsRes.json() as Promise<Person[]>,
        relationshipsRes.json() as Promise<Relationship[]>,
      ])
      setPersons(personsData)
      setRelationships(relData)
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
        color: p.color,
        initials: initialsOf(p.name),
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

    const meName = session?.user?.name ?? 'Meg'
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
        initials: initialsOf(meName),
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
      type: 'relationship',
      data: { color: RELATIONSHIP_COLORS[p.type], label: undefined, variant: 'spoke' },
    }))

    const between: Edge[] = relationships.map((r: Relationship) => ({
      id: r.id,
      source: r.fromPersonId,
      target: r.toPersonId,
      type: 'relationship',
      data: { color: r.color, label: undefined, variant: 'between' },
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

  return (
    <div className="relative flex-1 h-full">
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
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.3)"
        />
        <Controls className="!bg-Glass !border-GlassBorder !rounded-xl !shadow-lg" />
      </ReactFlow>

      {/* Floating action buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={onAddRelationship}
          className="glass-card px-4 py-2 text-sm font-medium text-Text/80 hover:text-Text transition-colors flex items-center gap-2"
          title="Legg til relasjon"
        >
          <span className="text-Accent">⟷</span> Relasjon
        </button>
        <button
          onClick={onAddPerson}
          className="bg-Accent text-Primary px-5 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-Accent/30 hover:opacity-90 transition-opacity"
          title="Legg til person"
        >
          +
        </button>
      </div>

      {/* Fargeforklaring — viser bare typene du faktisk har på kartet */}
      {persons.length > 0 && (
        <div className="absolute bottom-6 left-6 z-10 glass-card px-3 py-2 flex flex-col gap-1">
          {[...new Set(persons.map((p) => p.type))].map((t) => (
            <div key={t} className="flex items-center gap-2">
              <span
                className="w-4 h-0.5 rounded-full shrink-0"
                style={{ backgroundColor: RELATIONSHIP_COLORS[t] }}
              />
              <span className="text-[10px] text-Text/50">{RELATIONSHIP_LABELS[t]}</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {persons.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <p className="text-Text/40 text-lg">Vennekartet ditt er tomt</p>
          <p className="text-Text/30 text-sm">Trykk + for å legge til din første person</p>
        </div>
      )}
    </div>
  )
}
