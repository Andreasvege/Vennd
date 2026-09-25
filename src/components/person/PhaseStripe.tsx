import { ROMANCE_ORDER } from '@/domain/romance'
import { formatDate } from '@/domain/format'
import type { PersonProfileData } from '@/server/queries/person'
import { t } from '@/i18n'

/**
 * Hvor dere er, som en stripe av steg. Stegene dere har vært gjennom er
 * fylt; datoen står under. Avsluttet vises som egen merknad.
 */
export function PhaseStripe({ phases, current }: { phases: PersonProfileData['phases']; current: PersonProfileData['phase'] }) {
  const reachedAt = new Map(phases.map((p) => [p.phase, p.at]))
  const currentIndex = current ? ROMANCE_ORDER.indexOf(current) : -1

  return (
    <div className="flex flex-col gap-2" aria-label={t.phase.label}>
      <ol className="grid grid-cols-4 gap-1.5">
        {ROMANCE_ORDER.map((phase, i) => {
          const done = current === 'ENDED' ? reachedAt.has(phase) : i <= currentIndex
          const at = reachedAt.get(phase)
          return (
            <li key={phase} className="flex flex-col gap-1.5" aria-current={phase === current ? 'step' : undefined}>
              <span
                aria-hidden
                className="h-1 rounded-full"
                style={{ background: done ? 'var(--tag-rose-stroke)' : 'var(--rule)' }}
              />
              <span className={`text-[12px] leading-tight ${phase === current ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-ink-muted'}`}>
                {t.phase[phase]}
                {at && <span className="block text-ink-muted">{formatDate(new Date(at))}</span>}
              </span>
            </li>
          )
        })}
      </ol>
      {current === 'ENDED' && <p className="text-[13px] text-ink-muted">{t.phase.ENDED}</p>}
    </div>
  )
}
