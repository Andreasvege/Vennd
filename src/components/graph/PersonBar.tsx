'use client'

import { Link2, PenLine, UserRound, X } from 'lucide-react'
import { Button as AriaButton } from 'react-aria-components'
import { Avatar } from '@/components/ui'
import { RelativeDay } from '@/components/RelativeDay'
import type { MapPerson } from '@/server/queries/graph'
import { t } from '@/i18n'

type Props = {
  person: MapPerson
  onLog: () => void
  onProfile: () => void
  onConnect: () => void
  onClose: () => void
}

const action =
  'flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-rule bg-paper px-2 text-[13px] text-ink outline-none data-[pressed]:bg-pen-wash data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen'

/**
 * Valgt person på mobil: en linje nederst på kartet med hvem de er, når
 * dere sist hadde kontakt, og det du oftest vil gjøre. På PC åpnes
 * profilen i sidepanelet i stedet.
 */
export function PersonBar({ person, onLog, onProfile, onConnect, onClose }: Props) {
  const who = person.relationLabel || t.relationType[person.type]
  return (
    <section
      aria-label={person.name}
      className="absolute inset-x-3 bottom-3 z-20 rounded-[14px] border border-rule bg-paper-raised p-3 shadow-float desk:hidden"
    >
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={person.name} tint={person.tint} src={person.photoUrl} size="md" decorative />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[17px] leading-tight text-ink">{person.name}</p>
          <p className="truncate text-[13px] text-ink-muted">
            {who}
            {person.primaryTag && ` · ${person.primaryTag.name}`}
            {' · '}
            {person.lastContact ? <RelativeDay date={person.lastContact} /> : t.map.neverLogged}
          </p>
        </div>
        <AriaButton
          onPress={onClose}
          aria-label={t.common.close}
          className="flex size-11 items-center justify-center rounded-full text-ink-muted outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen"
        >
          <X aria-hidden size={18} strokeWidth={1.75} />
        </AriaButton>
      </div>
      <div className="flex gap-2">
        <AriaButton onPress={onLog} className={action}>
          <PenLine aria-hidden size={15} strokeWidth={1.75} />
          {t.map.logContact}
        </AriaButton>
        <AriaButton onPress={onConnect} className={action}>
          <Link2 aria-hidden size={15} strokeWidth={1.75} />
          {t.map.connectTo}
        </AriaButton>
        <AriaButton onPress={onProfile} className={action}>
          <UserRound aria-hidden size={15} strokeWidth={1.75} />
          {t.map.viewProfile}
        </AriaButton>
      </div>
    </section>
  )
}
