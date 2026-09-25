'use client'

import { useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Link2, UserPlus } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
import { isTagColor, tagFill, tagStroke, type TagColor } from '@/lib/palette'
import { t } from '@/i18n'
import { createRelationship } from '@/server/actions/relationship'
import { movePerson } from '@/server/actions/person'
import type { MapPerson, MapRelationship } from '@/server/queries/graph'
import { PersonNode, type PersonNodeData } from './PersonNode'
import { MeNode } from './MeNode'
import { RelationshipEdge, type RelationshipEdgeData } from './RelationshipEdge'

// Syntetisk id. «Meg» er ingen databaserad, så den kan ikke kollidere med
// en cuid fra Person.
const ME_ID = 'me'

const nodeTypes = { person: PersonNode, me: MeNode }
const edgeTypes = { relationship: RelationshipEdge }

type Props = {
  persons: MapPerson[]
  relationships: MapRelationship[]
  onAddPerson: () => void
  onAddLog: (personId: string) => void
  onAddRelationship: () => void
}

export function VennekartCanvas({ persons, relationships, onAddPerson, onAddLog, onAddRelationship }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Noder bygges fra serverdataene. Etter en handling friskes siden opp, og
  // nye props bygger kartet på nytt — ingen lokal kopi å holde i synk.
  useEffect(() => {
    const personNodes: Node[] = persons.map((p) => ({
      id: p.id,
      type: 'person',
      position: { x: p.positionX, y: p.positionY },
      data: {
        id: p.id,
        name: p.name,
        tint: p.tint,
        photoUrl: p.photoUrl,
        onAddLog,
        onViewProfile: (id: string) => router.push(`/person/${id}`),
      } satisfies PersonNodeData,
    }))

    // «Meg» står i tyngdepunktet av personene, så noden faktisk er midt i
    // kartet uansett hvor de er dratt hen.
    const center = persons.length
      ? {
          x: persons.reduce((sum, p) => sum + p.positionX, 0) / persons.length,
          y: persons.reduce((sum, p) => sum + p.positionY, 0) / persons.length,
        }
      : { x: 0, y: 0 }

    const meNode: Node = {
      id: ME_ID,
      type: 'me',
      position: center,
      // Noden har ingen lagret posisjon, så den skal ikke kunne dras ut av midten.
      draggable: false,
      selectable: false,
      data: { name: session?.user?.name ?? t.common.you, image: session?.user?.image ?? null },
    }

    setNodes(persons.length ? [meNode, ...personNodes] : personNodes)
  }, [persons, session, onAddLog, router, setNodes])

  // Kanter: én stråle fra deg til hver person, og relasjonene mellom dem.
  useEffect(() => {
    const spokes: Edge[] = persons.map((p) => ({
      id: `me:${p.id}`,
      source: ME_ID,
      target: p.id,
      targetHandle: 'center',
      type: 'relationship',
      data: { type: p.type, variant: 'spoke' } satisfies RelationshipEdgeData,
    }))

    const between: Edge[] = relationships.map((r) => ({
      id: r.id,
      source: r.fromPersonId,
      target: r.toPersonId,
      // Fest alltid i sentrum av ikonene, ikke i dra-knotten.
      sourceHandle: 'center',
      targetHandle: 'center',
      type: 'relationship',
      data: {
        type: r.type,
        variant: 'between',
        label: r.label,
        historical: r.until !== null,
      } satisfies RelationshipEdgeData,
    }))

    setEdges(persons.length ? [...spokes, ...between] : between)
  }, [persons, relationships, setEdges])

  // Dra fra knotten under én person til en annen for å lage en relasjon.
  // Typen settes til venn; den kan endres fra profilen.
  const onConnect = async (connection: Connection) => {
    if (!connection.source || !connection.target) return
    if (connection.source === connection.target) return
    await createRelationship({
      fromPersonId: connection.source,
      toPersonId: connection.target,
      type: 'FRIEND',
    })
  }

  const onNodeDragStop = (_event: React.MouseEvent, node: Node) => {
    if (node.id === ME_ID) return
    void movePerson(node.id, node.position.x, node.position.y)
  }

  // Forklaringen viser hovedtaggene som faktisk er i bruk.
  const legend = useMemo(() => {
    const seen = new Map<string, { name: string; color: TagColor }>()
    for (const p of persons) {
      if (p.primaryTag && isTagColor(p.primaryTag.color) && !seen.has(p.primaryTag.id)) {
        seen.set(p.primaryTag.id, { name: p.primaryTag.name, color: p.primaryTag.color })
      }
    }
    return [...seen.entries()].sort(([, a], [, b]) => a.name.localeCompare(b.name, 'nb'))
  }, [persons])

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

      {legend.length > 0 && (
        <ul
          aria-label={t.map.legend}
          className="absolute bottom-5 left-5 z-10 hidden max-w-48 flex-col gap-1.5 rounded-[10px] border border-rule bg-paper-raised/90 px-3 py-2.5 sm:flex"
        >
          {legend.map(([id, tag]) => (
            <li key={id} className="flex items-center gap-2 text-[12px] text-ink-muted">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-full"
                // Samme fyll som nodene, med taggens strekfarge som ring:
                // fyllet alene er for lyst til å skille taggene i så liten størrelse.
                style={{ background: tagFill(tag.color), boxShadow: `inset 0 0 0 1.5px ${tagStroke(tag.color)}` }}
              />
              <span className="truncate">{tag.name}</span>
            </li>
          ))}
        </ul>
      )}

      {persons.length === 0 && (
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
