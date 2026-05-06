'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PersonNodeData } from '@/types'

export function PersonNode({ data, selected }: NodeProps) {
  const d = data as PersonNodeData

  const initials = d.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <Handle type="target" position={Position.Top} className="opacity-0 !w-1 !h-1" />

      <div
        className={`
          flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer
          ${selected
            ? 'ring-2 ring-white/60 scale-110'
            : 'hover:scale-105'
          }
        `}
      >
        {/* Avatar circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/40"
          style={{ backgroundColor: d.color }}
        >
          {initials}
        </div>

        {/* Name label */}
        <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis">
          {d.name}
        </span>
      </div>

      {/* Quick actions on select */}
      {selected && (
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => d.onAddLog(d.id)}
            className="text-[10px] bg-Accent/90 text-white px-2 py-0.5 rounded-full hover:bg-Accent transition-colors"
            title="Logg kontakt"
          >
            + Logg
          </button>
          <button
            onClick={() => d.onViewProfile(d.id)}
            className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors"
            title="Se profil"
          >
            Profil
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-1 !h-1" />
    </div>
  )
}
