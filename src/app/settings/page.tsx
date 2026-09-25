import { auth } from '@/lib/auth'
import { requireUserId } from '@/server/session'
import { getTags } from '@/server/queries/tags'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TagSettings } from '@/components/TagSettings'
import { t } from '@/i18n'

const section = 'border-t border-rule pt-6'

export default async function SettingsPage() {
  const userId = await requireUserId()
  const [session, tags] = await Promise.all([auth(), getTags(userId)])
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
        <SectionHeading>{t.settings.appearance}</SectionHeading>
        <ThemeToggle />
      </section>
    </div>
  )
}
