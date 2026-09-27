'use client'

import { Handle, Position, useConnection, type NodeProps } from '@xyflow/react'
import { Avatar } from '@/components/ui'
import type { TagColor } from '@/lib/palette'
import { t } from '@/i18n'

export type PersonNodeData = {
  id: string
  name: string
  tint: TagColor
  photoUrl: string | null
  /** 0,35–1: kontakt som er lenge siden, falmer. */
  fade: number
  /** Personen står fast (Nærhet, Kretser): hele avataren er dra-punktet for å koble. */
  connectFromBody: boolean
}

// Midtpunktsankeret: et usynlig punkt i sentrum av avataren. React Flow
// fester streken på kanten av håndtaket; med et punkt er kanten midten, så
// strekene går fra midten av én person til midten av en annen. Uten
// pointer-events, ellers kan ikke noden flyttes.
export const centerHandle =
  'left-1/2! top-1/2! size-px! min-h-0! min-w-0! -translate-x-1/2! -translate-y-1/2! border-0! bg-transparent! opacity-0! pointer-events-none!'

export function PersonNode({ id, data, selected }: NodeProps) {
  const d = data as PersonNodeData
  // Under et drag: er dette personen du drar fra, eller den du er over?
  const connecting = useConnection((c) => (c.inProgress ? { from: c.fromNode.id, to: c.toNode?.id ?? null } : null))
  const isTarget = connecting !== null && connecting.to === id && connecting.from !== id
  const isSource = connecting?.from === id

  return (
    <div className="group/node relative flex select-none flex-col items-center gap-2">
      {/* Falmer med hvor lenge siden det er; valgt person vises alltid fullt. */}
      <div
        className="flex flex-col items-center gap-2 transition-opacity duration-300"
        style={{ opacity: selected || isTarget || isSource ? 1 : d.fade }}
      >
        <div
          className={`relative rounded-full transition-transform duration-150 ease-out group-hover/node:scale-[1.04] ${isTarget ? 'scale-[1.12]' : ''}`}
          style={
            isTarget
              ? { outline: '2px solid var(--pen)', outlineOffset: 6 }
              : selected || isSource
                ? { outline: '1.5px solid var(--pen)', outlineOffset: 5 }
                : undefined
          }
        >
          <Handle id="center" type="target" position={Position.Top} isConnectableStart={false} className={centerHandle} />
          <Handle id="center" type="source" position={Position.Top} isConnectableStart={false} className={centerHandle} />
          <Avatar name={d.name} tint={d.tint} src={d.photoUrl} size="lg" />
          {d.connectFromBody ? (
            // Personen står fast, så hele avataren kan dras for å koble.
            <Handle
              id="knob"
              type="source"
              position={Position.Bottom}
              className="inset-0! size-full! translate-0! transform-none! cursor-crosshair! rounded-full! border-0! bg-transparent! opacity-100!"
            />
          ) : (
            // I Nettverk flytter et drag personen; prikken under er for å koble.
            <Handle
              id="knob"
              type="source"
              position={Position.Bottom}
              title={t.map.dragToConnect}
              className={`-bottom-1.5! size-3.5! cursor-crosshair! border-2! border-paper! bg-pen! transition-opacity group-hover/node:opacity-100 ${selected ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </div>

        {/* Tekst rett på papiret, med glorie så den er lesbar over streker. */}
        <span className="ink-halo max-w-[128px] truncate font-display text-[14px] leading-tight text-ink">
          {d.name}
        </span>
      </div>

    </div>
  )
}
