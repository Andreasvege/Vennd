import { BackLink } from '@/components/person/BackLink'
import { EmptyState } from '@/components/ui'
import { LinkSuggestionList } from '@/components/links/LinkSuggestionList'
import { requireUserId } from '@/server/session'
import { getLinkSuggestions } from '@/server/queries/links'
import { isClaudeEnabled } from '@/server/claude/client'
import { AskClaude } from '@/components/links/AskClaude'
import { prisma } from '@/lib/prisma'
import { t } from '@/i18n'

/** Alle forslag til forbindelser, sterkest først, med «Legg til alle». */
export default async function LinksPage() {
  const userId = await requireUserId()
  const [items, user] = await Promise.all([
    getLinkSuggestions(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { linksAssessedAt: true } }),
  ])
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
      <BackLink href="/sorter">{t.sort.back}</BackLink>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.links.title}</h1>
        <p className="text-[15px] text-ink-muted">{t.links.way.body}</p>
      </div>
      {isClaudeEnabled() && <AskClaude lastAt={user?.linksAssessedAt ?? null} />}
      {items.length === 0 ? <EmptyState title={t.links.empty} className="py-8" /> : <LinkSuggestionList items={items} bulk />}
    </div>
  )
}
