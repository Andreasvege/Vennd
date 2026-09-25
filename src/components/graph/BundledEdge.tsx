'use client'

import { BaseEdge, type EdgeProps } from '@xyflow/react'
import { edgeStroke, type RelationshipEdgeData } from './RelationshipEdge'

export type BundledEdgeData = RelationshipEdgeData & { route: string; visible: boolean }

/**
 * En kant i Kretser: tegnes langs den buntede banen gruppene deler, ikke
 * rett mellom personene. Tones inn når personene har kommet på plass.
 */
export function BundledEdge({ id, data }: EdgeProps) {
  const edge = data as BundledEdgeData
  return (
    <BaseEdge
      id={id}
      path={edge.route}
      style={{
        ...edgeStroke(edge),
        fill: 'none',
        strokeLinecap: 'round',
        opacity: edge.visible ? 1 : 0,
        transition: 'opacity 250ms ease-out',
      }}
    />
  )
}
