import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Avatar } from '@/components/ui/Avatar'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ThemeToggle } from '@/components/ThemeToggle'
import { TYPE_TINT, tagStroke } from '@/lib/palette'
import { t } from '@/i18n'
import type { RelationshipType } from '@/types'

const section = 'border-t border-rule pt-6'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const types = Object.keys(TYPE_TINT) as RelationshipType[]

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10">
      <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.settings.title}</h1>

      <section className={section}>
        <SectionHeading>{t.settings.account}</SectionHeading>
        <div className="flex items-center gap-4">
          <Avatar name={session.user.name ?? t.common.you} src={session.user.image} size="lg" decorative />
          <div className="min-w-0">
            <p className="font-display text-[18px]">{session.user.name}</p>
            <p className="truncate text-[14px] text-ink-muted">{session.user.email}</p>
          </div>
        </div>
      </section>

      <section className={section}>
        <SectionHeading>{t.settings.appearance}</SectionHeading>
        <ThemeToggle />
      </section>

      <section className={section}>
        <SectionHeading>{t.settings.relationTypes}</SectionHeading>
        <p className="mb-4 text-[14px] text-ink-muted">{t.settings.relationTypesHint}</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {types.map((type) => (
            <li key={type} className="flex items-center gap-2.5 text-[15px]">
              <span
                aria-hidden
                className="size-2.5 rounded-full"
                style={{ background: tagStroke(TYPE_TINT[type]) }}
              />
              {t.relationType[type]}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
