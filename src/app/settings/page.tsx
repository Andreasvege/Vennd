import Link from 'next/link'
import { auth } from '@/lib/auth'
import { requireUserId } from '@/server/session'
import { getTags } from '@/server/queries/tags'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TagSettings } from '@/components/TagSettings'
import { isClaudeEnabled, suggestModel } from '@/server/claude/client'
import { t } from '@/i18n'
import { prisma } from '@/lib/prisma'

const section = 'border-t border-rule pt-6'

export default async function SettingsPage() {
  const userId = await requireUserId()
  const [session, tags, unsorted] = await Promise.all([
    auth(),
    getTags(userId),
    prisma.person.count({ where: { userId, sortedAt: null, archivedAt: null } }),
  ])
  const user = session!.user

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10">
      <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.settings.title}</h1>

      <section className={section}>
        <SectionHeading>{t.settings.account}</SectionHeading>
        <div className="flex items-center gap-4">
          <Avatar name={user.name ?? t.common.you} src={user.image} size="lg" decorative />
          <div className="min-w-0">
            <p className="font-display text-[18px]">{user.name}</p>
            <p className="truncate text-[14px] text-ink-muted">{user.email}</p>
          </div>
        </div>
      </section>

      <section className={section}>
        <SectionHeading>{t.settings.tags}</SectionHeading>
        <p className="mb-2 text-[14px] text-ink-muted">{t.tags.hint}</p>
        <TagSettings tags={tags} />
      </section>

      <section className={section}>
        <SectionHeading>{t.suggestions.settings}</SectionHeading>
        <p className="text-[14px] leading-relaxed text-ink-muted">
          {isClaudeEnabled() ? t.suggestions.on(suggestModel()) : t.suggestions.off}
        </p>
      </section>

      <section className={section}>
        <SectionHeading>{t.import.title}</SectionHeading>
        <p className="mb-2 text-[14px] text-ink-muted">{t.import.settingsHint}</p>
        <div className="flex flex-col items-start gap-1">
          <Link href="/import" className="text-[15px] text-pen underline-offset-4 hover:underline">
            {t.import.link}
          </Link>
          <Link href="/sorter" className="text-[15px] text-pen underline-offset-4 hover:underline">
            {t.sort.settingsLink(unsorted)}
          </Link>
        </div>
      </section>

      <section className={section}>
        <SectionHeading>{t.exportData.title}</SectionHeading>
        <p className="mb-2 text-[14px] text-ink-muted">{t.exportData.hint}</p>
        {/* Vanlig lenke, ikke klientnavigasjon: nettleseren skal laste ned filen. */}
        <a href="/api/eksport" download className="text-[15px] text-pen underline-offset-4 hover:underline">
          {t.exportData.download}
        </a>
      </section>

      <section className={section}>
        <SectionHeading>{t.settings.appearance}</SectionHeading>
        <ThemeToggle />
      </section>
    </div>
  )
}
