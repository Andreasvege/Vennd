'use client'

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'
import { tagStroke } from '@/lib/palette'
import type { RelationshipType } from '@/types'

export type RelationshipEdgeData = {
  type: RelationshipType
  label?: string | null
  // 'spoke' er deg → person: blekkstrek, tydeligst.
  // 'between' er person ↔ person: tynnere og dempet.
  variant: 'spoke' | 'between'
  /** Relasjonen er over (until er satt): tegnes som en svak prikkelinje. */
  historical?: boolean
  /** Del av en sti som vises: rødblyant. */
  path?: boolean
  /** En sti vises, og denne er ikke med: tones ned. */
  dimmed?: boolean
}

function strokeFor(edge: RelationshipEdgeData): React.CSSProperties {
  if (edge.path) return { stroke: 'var(--redpencil)', strokeWidth: 2.6 }
  const base = baseStroke(edge)
  return edge.dimmed ? { ...base, strokeOpacity: 0.18 } : base
}

function baseStroke({ type, variant, historical }: RelationshipEdgeData): React.CSSProperties {
  // Romantiske bånd mellom andre er den ene relasjonen som får farge —
  // det er informasjonen du oftest leter etter i en vennekrets.
  const romantic = variant === 'between' && type === 'ROMANTIC'
  if (historical) {
    return {
      stroke: romantic ? tagStroke('rose') : 'var(--ink-muted)',
      strokeWidth: 1,
      strokeOpacity: 0.55,
      strokeDasharray: '1 5',
    }
  }
  if (romantic) return { stroke: tagStroke('rose'), strokeWidth: 1.4, strokeDasharray: '6 4' }
  if (variant === 'between') return { stroke: 'var(--ink-muted)', strokeWidth: 1, strokeOpacity: 0.6 }
  return { stroke: 'var(--ink)', strokeWidth: 1.5, strokeOpacity: 0.5 }
}

export function RelationshipEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const edge = data as RelationshipEdgeData
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY })

  return (
    <>
      <BaseEdge id={id} path={path} style={{ ...strokeFor(edge), strokeLinecap: 'round' }} />
      {edge.label && (
        <EdgeLabelRenderer>
          <span
            className="ink-halo absolute font-display text-[13px] italic text-ink-muted"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
          >
            {edge.label}
          </span>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
