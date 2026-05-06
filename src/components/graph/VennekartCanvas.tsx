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
  BackgroundVariant,
} from '@xyflow/react'
import { useRouter } from 'next/navigation'
import { PersonNode } from './PersonNode'
import { RelationshipEdge } from './RelationshipEdge'
import type { Person, Relationship } from '@/types'

const nodeTypes = { person: PersonNode }
const edgeTypes = { relationship: RelationshipEdge }

type Props = {
  onAddPerson: () => void
  onAddLog: (personId: string) => void
  onAddRelationship: () => void
  refreshKey: number
}

export function VennekartCanvas({ onAddPerson, onAddLog, onAddRelationship, refreshKey }: Props) {
  const router = useRouter()
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

  // Convert persons → React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = persons.map((p: Person) => ({
      id: p.id,
      type: 'person',
      position: { x: p.positionX, y: p.positionY },
      data: {
        id: p.id,
        name: p.name,
        color: p.color,
        initials: p.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
        onAddLog,
        onViewProfile: (id: string) => router.push(`/person/${id}`),
      },
    }))
    setNodes(newNodes)
  }, [persons, onAddLog, router, setNodes])

  // Convert relationships → React Flow edges
  useEffect(() => {
    const newEdges: Edge[] = relationships.map((r: Relationship) => ({
      id: r.id,
      source: r.fromPersonId,
      target: r.toPersonId,
      type: 'relationship',
      data: { color: r.color, label: undefined },
    }))
    setEdges(newEdges)
  }, [relationships, setEdges])

  // Save node position when dragging stops
  const onNodeDragStop = async (_event: React.MouseEvent, node: Node) => {
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
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.3 }}
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
