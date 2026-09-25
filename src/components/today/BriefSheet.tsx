'use client'

import Link from 'next/link'
import { Avatar, Sheet } from '@/components/ui'
import { buttonClass } from '@/components/ui/button-styles'
import { RelativeDay } from '@/components/RelativeDay'
import type { Brief, PlanItem } from '@/server/queries/plans'
import { t } from '@/i18n'

/**
 * Rett før du går: for hver du skal treffe, hva du bør spørre om, hva
 * dere snakket om sist og det du vil huske. Tre ting, ikke hele profilen.
 */
export function BriefSheet({ plan, briefs, onClose }: { plan: PlanItem; briefs: Record<string, Brief>; onClose: () => void }) {
  return (
    <Sheet isOpen onOpenChange={(open) => !open && onClose()} title={plan.title} size="lg">
      <div className="flex flex-col gap-8">
        {plan.persons.map((p) => {
          const brief = briefs[p.id]
          if (!brief) return null
          return (
            <section key={p.id} aria-label={p.name} className="flex flex-col gap-4 border-t border-rule pt-5 first:border-0 first:pt-0">
              <div className="flex items-center gap-3">
                <Avatar name={p.name} tint={p.tint} size="md" decorative />
                <h3 className="flex-1 font-display text-[21px]">{p.name}</h3>
                <Link href={`/person/${p.id}`} onClick={onClose} className={buttonClass('quiet', 'sm')}>
                  {t.plans.openProfile}
                </Link>
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-display text-[16px] italic text-ink-muted">{t.plans.ask}</h4>
                {brief.ask.length ? (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-[16px] marker:text-ink-muted">
                    {brief.ask.map((a) => (
                      <li key={a.id}>{a.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[14px] text-ink-muted">{t.plans.nothingYet}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-display text-[16px] italic text-ink-muted">{t.plans.last}</h4>
                {brief.last ? (
                  <p className="font-display text-[16px] leading-relaxed">
                    <RelativeDay date={brief.last.date} className="mr-2 font-sans text-[13px] text-ink-muted" />
                    {brief.last.body ?? ''}
                  </p>
                ) : (
                  <p className="text-[14px] text-ink-muted">{t.plans.nothingYet}</p>
                )}
              </div>

              {brief.facts.length > 0 && (
                <div className="flex flex-col gap-1">
                  <h4 className="font-display text-[16px] italic text-ink-muted">{t.plans.remember}</h4>
                  <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {brief.facts.map((f) => (
                      <div key={f.id} className="flex gap-2 text-[15px]">
                        <dt className="text-ink-muted">{f.label}</dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </Sheet>
  )
}
