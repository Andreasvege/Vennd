import Link from 'next/link'
import { ArrowRight, Copy, Inbox, Layers, MessageCircleQuestion, NotebookPen, Sparkles, Users } from 'lucide-react'
import { requireUserId } from '@/server/session'
import { getSortingData } from '@/server/queries/sorting'
import { getGroupSuggestions } from '@/server/queries/links'
import { getDuplicates } from '@/server/queries/duplicates'
import { getEnrichData } from '@/server/queries/enrich'
import { t } from '@/i18n'

const WAYS = [
  { href: '/sorter/kort', icon: Layers, ...t.sort.ways.deck },
  { href: '/sorter/miljo', icon: Users, ...t.sort.ways.group },
  { href: '/sorter/venter', icon: Inbox, ...t.sort.ways.waiting },
  { href: '/sorter/fyll', icon: NotebookPen, ...t.enrich.way },
  { href: '/sorter/sporsmal', icon: MessageCircleQuestion, ...t.questions.way },
  { href: '/sorter/forbindelser', icon: Sparkles, ...t.links.way },
  { href: '/sorter/duplikater', icon: Copy, ...t.dupes.way },
] as const

/** «Bygg kartet ditt»: tre måter å gi folk en plass, samme sted. */
export default async function SortPage() {
  const userId = await requireUserId()
  const [data, groups, dupes, enrich] = await Promise.all([
    getSortingData(userId),
    getGroupSuggestions(userId),
    getDuplicates(userId),
    getEnrichData(userId),
  ])
  const linkGroups = groups.fromClaude.length + groups.fromRules.length
  const n = data.unsorted.length
  // Venter ingen, er det å fylle inn kartet som er neste steg, og det står først.
  const ways = n === 0 ? [WAYS[3], ...WAYS.filter((_, i) => i !== 3)] : WAYS

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
        {ways.map(({ href, icon: Icon, title, body }, i) => (
          <li key={href}>
            <Link
              href={href}
              className={[
                'group flex items-center gap-4 rounded-[16px] border p-5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-pen',
                // Hovedinngangen står først og tydeligst.
                i === 0 ? 'border-ink bg-ink text-paper hover:bg-ink/90' : 'border-rule bg-paper-raised hover:border-ink-muted',
              ].join(' ')}
            >
              <Icon aria-hidden size={22} strokeWidth={1.5} className="shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-display text-[20px] leading-tight">
                  {title}
                  {href === '/sorter/forbindelser' && linkGroups > 0 && (
                    <span className="ml-2 font-sans text-[13px] text-ink-muted">{t.links.count(linkGroups)}</span>
                  )}
                  {href === '/sorter/fyll' && enrich.withGaps > 0 && (
                    <span className="ml-2 font-sans text-[13px] text-ink-muted">{t.enrich.count(enrich.withGaps)}</span>
                  )}
                  {href === '/sorter/duplikater' && dupes.length > 0 && (
                    <span className="ml-2 font-sans text-[13px] text-ink-muted">{t.dupes.count(dupes.length)}</span>
                  )}
                </span>
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
