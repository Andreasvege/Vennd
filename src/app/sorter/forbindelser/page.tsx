import { BackLink } from '@/components/person/BackLink'
import { GroupSuggestions } from '@/components/links/GroupSuggestions'
import { AskClaude } from '@/components/links/AskClaude'
import { requireUserId } from '@/server/session'
import { getGroupSuggestions } from '@/server/queries/links'
import { isClaudeEnabled } from '@/server/claude/client'
import { prisma } from '@/lib/prisma'
import { t } from '@/i18n'

/** Forslag til forbindelser, i grupper: ett svar dekker mange forbindelser. */
export default async function LinksPage() {
  const userId = await requireUserId()
  const [data, user] = await Promise.all([
    getGroupSuggestions(userId),
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
      <GroupSuggestions data={data} />
    </div>
  )
}
