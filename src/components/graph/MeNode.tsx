'use client'

import { Handle, Position } from '@xyflow/react'
import Image from 'next/image'
import type { NodeProps } from '@xyflow/react'
import type { MeNodeData } from '@/types'

/**
 * Deg selv, midt i kartet. Noden finnes ikke i databasen — den bygges fra
 * sesjonen, og kantene ut fra den utledes av Person.type. Det er dét som
 * gjør kartet til *ditt*: uten denne noden viste grafen bare vennene dine
 * sine forhold til hverandre.
 */
export function MeNode({ data }: NodeProps) {
  const d = data as MeNodeData

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div className="relative w-20 h-20 rounded-full ring-2 ring-Accent/60 shadow-lg shadow-Accent/30 overflow-hidden bg-Accent flex items-center justify-center">
        {/* Ett håndtak i sentrum: alle kanter stråler ut fra midten. */}
        <Handle
          type="source"
          position={Position.Right}
          className="w-full! h-full! rounded-full! border-0! bg-transparent! left-0! top-0! transform-none! pointer-events-none!"
        />
        {d.image ? (
          <Image
            src={d.image}
            alt={d.name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-Primary font-bold text-2xl">{d.initials}</span>
        )}
      </div>
      <span className="text-xs font-bold text-Text bg-Accent/20 border border-Accent/40 px-3 py-0.5 rounded-full whitespace-nowrap">
        {d.name}
      </span>
    </div>
  )
}
