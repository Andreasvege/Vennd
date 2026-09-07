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
    <div className="flex flex-col items-center gap-1 select-none group/node">
      <div
        className={`
          flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer
          ${selected
            ? 'ring-2 ring-white/60 scale-110'
            : 'hover:scale-105'
          }
        `}
      >
        {/* Avatar circle with centered handles */}
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/40"
          style={{ backgroundColor: d.color }}
        >
          {/* Målhåndtaket dekker sirkelen, men uten pointer-events: ellers
              fanger det musetrykk på avataren og du kan ikke flytte personen.
              React Flow snapper geometrisk via connectionRadius i stedet.
              connectableStart hindrer at en kobling kan starte herfra — den
              skal bare starte fra knotten under. */}
          {/* Anker for strektegning: dekker hele sirkelen, så React Flow regner
              midtpunktet som feste. Uten pointer-events, ellers kan ikke noden
              flyttes. isConnectableStart hindrer at en kobling starter her. */}
          <Handle
            id="center"
            type="target"
            position={Position.Top}
            isConnectableStart={false}
            className="!w-full !h-full !rounded-full !border-0 !bg-transparent !left-0 !top-0 !transform-none !pointer-events-none"
          />
          <Handle
            id="center"
            type="source"
            position={Position.Top}
            isConnectableStart={false}
            className="!w-full !h-full !rounded-full !border-0 !bg-transparent !left-0 !top-0 !transform-none !pointer-events-none"
          />
          {initials}
          {/* Selve dra-punktet. Kun herfra kan en relasjon starte — dette er
              det eneste håndtaket som tar imot mus. */}
          <Handle
            id="knob"
            type="source"
            position={Position.Bottom}
            className="!w-3 !h-3 !border-2 !border-white/70 !bg-Accent !-bottom-1 opacity-0 group-hover/node:opacity-100 transition-opacity"
          />
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

    </div>
  )
}
