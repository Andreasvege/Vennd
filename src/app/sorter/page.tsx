import Link from 'next/link'
import { ArrowRight, Inbox, Layers, Users } from 'lucide-react'
import { requireUserId } from '@/server/session'
import { getSortingData } from '@/server/queries/sorting'
import { t } from '@/i18n'

const WAYS = [
  { href: '/sorter/kort', icon: Layers, ...t.sort.ways.deck },
  { href: '/sorter/miljo', icon: Users, ...t.sort.ways.group },
  { href: '/sorter/venter', icon: Inbox, ...t.sort.ways.waiting },
] as const

/** «Bygg kartet ditt»: tre måter å gi folk en plass, samme sted. */
export default async function SortPage() {
  const userId = await requireUserId()
  const data = await getSortingData(userId)
  const n = data.unsorted.length

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.sort.title}</h1>
        <p className="text-[17px] text-ink">{t.sort.waiting(n)}</p>
        <p className="text-[14px] text-ink-muted">
          {t.sort.mapSummary(data.sorted.length, data.tags.filter((tag) => tag.count > 0).length, data.pairs.length)}
        </p>
      </div>

      <ul className="flex flex-col gap-3">
        {WAYS.map(({ href, icon: Icon, title, body }, i) => (
          <li key={href}>
            <Link
              href={href}
              className={[
                'group flex items-center gap-4 rounded-[16px] border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pen',
                // Kortstokken er hovedinngangen: den står først og tydeligst.
                i === 0 ? 'border-ink bg-ink text-paper hover:bg-ink/90' : 'border-rule bg-paper-raised hover:border-ink-muted',
              ].join(' ')}
            >
              <Icon aria-hidden size={22} strokeWidth={1.5} className="shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[20px] leading-tight">{title}</span>
                <span className={`text-[14px] ${i === 0 ? 'text-paper/75' : 'text-ink-muted'}`}>{body}</span>
              </span>
              <ArrowRight aria-hidden size={18} strokeWidth={1.75} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
