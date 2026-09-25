'use client'

import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react'
import { t } from '@/i18n'

export type DerivedEdgeData = { count: number; dimmed?: boolean }

/**
 * «Ofte sammen»: to som har vært med i samme logg flere ganger, uten at en
 * relasjon er registrert. En prikkestrek; klikk gjør den til en relasjon.
 */
export function DerivedEdge({ id, sourceX, sourceY, targetX, targetY, data }: EdgeProps) {
  const edge = data as DerivedEdgeData
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  // Tilgjengelig navn settes på kanten selv (ariaLabel); tittelen er for mus.
  return (
    <g>
      <title>{`${t.map.derived(edge.count)} · ${t.map.derivedHint}`}</title>
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={16}
        style={{
          stroke: 'var(--ink-muted)',
          strokeWidth: 1.25,
          strokeDasharray: '1 5',
          strokeLinecap: 'round',
          strokeOpacity: edge.dimmed ? 0.2 : 0.8,
        }}
      />
    </g>
  )
}
