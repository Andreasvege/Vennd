'use client'

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'

type RelationshipEdgeData = {
  label?: string
  color: string
  // Person↔person-kanter dempes så strålene ut fra «meg» dominerer bildet.
  dimmed?: boolean
}

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeData = data as RelationshipEdgeData
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeData?.color ?? '#6c63ff',
          strokeWidth: edgeData?.dimmed ? 1.5 : 2.5,
          strokeOpacity: edgeData?.dimmed ? 0.25 : 0.85,
          strokeDasharray: edgeData?.dimmed ? '4 4' : undefined,
        }}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="text-[10px] text-white/70 bg-Primary/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/10"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
