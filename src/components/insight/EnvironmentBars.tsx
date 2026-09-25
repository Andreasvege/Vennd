import { tagFill, tagStroke } from '@/lib/palette'
import type { Insight } from '@/server/queries/insight'
import { t } from '@/i18n'

/**
 * Hvor mange logger hvert miljø var med i, som blyantskraverte søyler i
 * taggens farge. Lengden er relativ til det største miljøet.
 */
export function EnvironmentBars({ environments }: { environments: Insight['environments'] }) {
  const max = Math.max(1, ...environments.map((e) => e.count))
  return (
    <figure className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2.5">
        {environments.map((e) => (
          <li key={e.id ?? 'none'} className="grid grid-cols-[minmax(0,8.5rem)_1fr_2rem] items-center gap-3 text-[14px]">
            <span className="truncate text-ink">{e.name ?? t.insight.untagged}</span>
            <span className="h-4">
              <span
                className="block h-full rounded-[3px] border"
                style={{
                  width: `${Math.max(4, (e.count / max) * 100)}%`,
                  borderColor: tagStroke(e.color),
                  // Skravering som med blyant, over en lys vask i samme farge.
                  background: `repeating-linear-gradient(-50deg, ${tagStroke(e.color)} 0 1px, transparent 1px 5px), ${tagFill(e.color)}`,
                }}
              />
            </span>
            <span className="text-right tabular-nums text-ink-muted">{e.count}</span>
          </li>
        ))}
      </ul>
      {environments.length > 1 && <figcaption className="text-[12px] text-ink-muted">{t.insight.overlapNote}</figcaption>}
    </figure>
  )
}
