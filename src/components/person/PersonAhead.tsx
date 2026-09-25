'use client'

import { CalendarPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePlanner } from '@/components/composer/ComposerProvider'
import { useIsClient } from '@/components/useIsClient'
import { whenLabel, birthdayLabel } from '@/components/today/when'
import { nextBirthday } from '@/domain/birthdays'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'

/**
 * Det som ligger foran med én person: planlagte treff, og bursdagen når
 * den nærmer seg. Regnes i nettleseren, så «lørdag» er din lørdag.
 */
export function PersonAhead({ person }: { person: PersonProfileData }) {
  const openPlanner = usePlanner()
  const client = useIsClient()
  const birthday = client && person.birthday ? nextBirthday(new Date(person.birthday)) : null

  return (
    <div className="flex flex-col gap-2">
      {birthday && birthday.inDays <= 30 && (
        <p className="text-[14px] text-ink">
          {birthday.turns !== null ? t.birthdays.turns(birthday.turns) : t.birthdays.birthday} {birthdayLabel(birthday.inDays)}
        </p>
      )}
      {person.plans.length > 0 && (
        <ul className="flex flex-col gap-1 text-[15px]">
          {person.plans.map((p) => (
            <li key={p.id}>
              <span className="text-ink-muted">{client ? whenLabel(new Date(p.at), p.hasTime) : ''}</span>
              {client && ': '}
              {p.title}
            </li>
          ))}
        </ul>
      )}
      <Button variant="quiet" size="sm" onPress={() => openPlanner({ personIds: [person.id] })} className="-ml-2.5 self-start">
        <CalendarPlus aria-hidden size={15} strokeWidth={1.75} />
        {t.plans.planWith(person.name)}
      </Button>
    </div>
  )
}
