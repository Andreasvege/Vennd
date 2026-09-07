'use client'

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'

type RelationshipEdgeData = {
  label?: string
  color: string
  // 'spoke' er meg → person: stiplet og svak.
  // 'between' er person ↔ person: hel, men tynn og svak.
  variant?: 'spoke' | 'between'
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
          strokeWidth: edgeData?.variant === 'between' ? 1 : 2,
          strokeOpacity: edgeData?.variant === 'between' ? 0.3 : 0.45,
          strokeDasharray: edgeData?.variant === 'between' ? undefined : '5 5',
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
