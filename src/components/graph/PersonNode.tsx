'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { PenLine, UserRound } from 'lucide-react'
import { Avatar } from '@/components/ui'
import type { TagColor } from '@/lib/palette'
import { t } from '@/i18n'

export type PersonNodeData = {
  id: string
  name: string
  tint: TagColor
  photoUrl: string | null
  onAddLog: (personId: string) => void
  onViewProfile: (personId: string) => void
}

// Midtpunktsankeret: dekker hele sirkelen, så React Flow regner midten som
// feste for strekene. Uten pointer-events, ellers kan ikke noden flyttes.
const centerHandle =
  'w-full! h-full! rounded-full! border-0! bg-transparent! left-0! top-0! transform-none! pointer-events-none!'

const quickAction =
  'nodrag inline-flex min-h-11 desk:min-h-8 items-center gap-1.5 rounded-full border border-rule bg-paper-raised px-3 text-[12px] text-ink shadow-float transition-colors hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-pen'

export function PersonNode({ data, selected }: NodeProps) {
  const d = data as PersonNodeData

  return (
    <div className="group/node relative flex select-none flex-col items-center gap-2">
      <div
        className="relative rounded-full transition-transform duration-150 ease-out group-hover/node:scale-[1.04]"
        style={selected ? { outline: '1.5px solid var(--pen)', outlineOffset: 5 } : undefined}
      >
        <Handle id="center" type="target" position={Position.Top} isConnectableStart={false} className={centerHandle} />
        <Handle id="center" type="source" position={Position.Top} isConnectableStart={false} className={centerHandle} />
        <Avatar name={d.name} tint={d.tint} src={d.photoUrl} size="lg" />
        {/* Selve dra-punktet. Kun herfra kan en relasjon starte. */}
        <Handle
          id="knob"
          type="source"
          position={Position.Bottom}
          className="-bottom-1! size-3! border-2! border-paper! bg-pen! opacity-0 transition-opacity group-hover/node:opacity-100"
        />
      </div>

      {/* Tekst rett på papiret, med glorie så den er lesbar over streker. */}
      <span
        className="ink-halo max-w-[128px] truncate font-display text-[14px] leading-tight text-ink"
      >
        {d.name}
      </span>

      {selected && (
        <div className="absolute top-full mt-1 flex gap-1.5">
          <button type="button" onClick={() => d.onAddLog(d.id)} className={quickAction}>
            <PenLine aria-hidden size={14} strokeWidth={1.75} />
            {t.map.logContact}
          </button>
          <button type="button" onClick={() => d.onViewProfile(d.id)} className={quickAction}>
            <UserRound aria-hidden size={14} strokeWidth={1.75} />
            {t.map.viewProfile}
          </button>
        </div>
      )}
    </div>
  )
}
