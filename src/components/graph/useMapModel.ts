'use client'

import { useMemo } from 'react'
import { freshness } from '@/domain/freshness'
import { isEdgeVisible, isPersonVisible, type MapFilter } from '@/domain/mapFilter'
import type { MapMode } from '@/domain/mapMode'
import { circles, arcPath } from '@/domain/layouts/circles'
import { hull } from '@/domain/layouts/hulls'
import { relax } from '@/domain/layouts/relax'
import { nearness, nearnessRings, NEARNESS_DEFAULTS } from '@/domain/layouts/nearness'
import type { Point } from '@/domain/layouts/types'
import type { Graph } from '@/server/queries/graph'
import type { TagColor } from '@/lib/palette'
import { t } from '@/i18n'

export const CIRCLE_R = 420
/** Minste avstand mellom to personer i beregnede syn: en avatar pluss litt luft. */
const NODE_GAP = 84

export type Backdrop =
  | { kind: 'rings'; rings: { r: number; label: string }[] }
  | { kind: 'hulls'; hulls: { id: string; path: string; label: string; labelAt: Point; color: TagColor }[] }
  | { kind: 'arcs'; arcs: { id: string; path: string; labelPath: string; label: string; color: TagColor | null }[] }

/**
 * Fra data, syn og filter til det kartet tegner: hvem som vises, med hvilken
 * ferskhet, hvor de står (sentrum av avataren) og hva som ligger bak.
 */
export function useMapModel(graph: Graph, mode: MapMode, filter: MapFilter, now: Date) {
  return useMemo(() => {
    const visible = graph.persons.filter((p) => isPersonVisible(p, filter))
    const visibleIds = new Set(visible.map((p) => p.id))
    const relationships = graph.relationships.filter((r) =>
      isEdgeVisible(r, visibleIds, r.fromPersonId, r.toPersonId, filter),
    )
    const derived = graph.derived.filter((d) =>
      isEdgeVisible({ type: 'FRIEND', until: null, derived: true }, visibleIds, d.a, d.b, filter),
    )

    const fresh = new Map(visible.map((p) => [p.id, freshness(p.lastContact ? new Date(p.lastContact) : null, p.cadenceWeeks, now)]))
    const groups = graph.tags.map((tag) => ({ id: tag.id as string | null, name: tag.name }))
    const layoutPersons = visible.map((p) => ({
      id: p.id,
      name: p.name,
      groupId: p.primaryTag?.id ?? null,
      freshness: fresh.get(p.id) ?? 0,
    }))
    const tagById = new Map(graph.tags.map((tag) => [tag.id, tag]))

    let targets: Map<string, Point>
    let backdrop: Backdrop
    let edgePath: ((from: string, to: string) => string | null) | null = null

    if (mode === 'nearness') {
      // Ferske i samme gruppe havner tett på den innerste ringen; et lite
      // frastøtingspass hindrer at de legger seg oppå hverandre.
      targets = relax(nearness(layoutPersons, groups), NODE_GAP)
      backdrop = {
        kind: 'rings',
        rings: nearnessRings(NEARNESS_DEFAULTS).map((ring) => ({ r: ring.r, label: t.map.rings[ring.label] })),
      }
    } else if (mode === 'circles') {
      const c = circles(layoutPersons, groups, { r: CIRCLE_R })
      targets = c.positions
      edgePath = c.edgePath
      backdrop = {
        kind: 'arcs',
        arcs: c.arcs.map((arc) => {
          const tag = arc.groupId ? tagById.get(arc.groupId) : null
          return {
            id: arc.groupId ?? 'untagged',
            path: arcPath(CIRCLE_R + 28, arc.start + 0.01, arc.end - 0.01),
            labelPath: arcPath(CIRCLE_R + 40, arc.start, arc.end, true),
            label: tag?.name ?? t.map.untagged,
            color: tag?.color ?? null,
          }
        }),
      }
    } else {
      // Nettverk: der du selv har plassert folk. Gruppene tegnes som omriss.
      targets = new Map(visible.map((p) => [p.id, { x: p.positionX, y: p.positionY }]))
      const members = new Map<string, Point[]>()
      for (const p of visible) {
        if (!p.primaryTag) continue
        members.set(p.primaryTag.id, [...(members.get(p.primaryTag.id) ?? []), targets.get(p.id)!])
      }
      backdrop = {
        kind: 'hulls',
        hulls: [...members].flatMap(([tagId, pts]) => {
          const path = hull(pts, 56)
          const tag = tagById.get(tagId)
          if (!path || !tag) return []
          const top = Math.min(...pts.map((p) => p.y))
          const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
          return [{ id: tagId, path, label: tag.name, labelAt: { x: cx, y: top - 66 }, color: tag.color }]
        }),
      }
    }

    return { visible, relationships, derived, fresh, targets, backdrop, edgePath }
  }, [graph, mode, filter, now])
}
