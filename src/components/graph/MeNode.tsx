'use client'

import Image from 'next/image'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { centerHandle } from './PersonNode'
import { initialsOf } from '@/domain/format'
import { t } from '@/i18n'
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
    <div className="flex select-none flex-col items-center gap-2">
      <div className="relative flex size-[72px] items-center justify-center overflow-hidden rounded-full bg-ink text-paper">
        {/* Ett punkt i sentrum: alle strålene går ut fra midten av deg. */}
        <Handle type="source" position={Position.Top} className={centerHandle} />
        {d.image ? (
          <Image src={d.image} alt="" width={72} height={72} className="size-full object-cover" />
        ) : (
          <span className="font-sans text-[21px] font-semibold">{initialsOf(d.name)}</span>
        )}
      </div>
      <span
        className="ink-halo font-display text-[14px] italic text-ink"
      >
        {t.common.you}
      </span>
    </div>
  )
}
