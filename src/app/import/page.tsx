import { ImportFlow } from '@/components/import/ImportFlow'
import { BackLink } from '@/components/person/BackLink'
import { requireUserId } from '@/server/session'
import { getImportContext } from '@/server/queries/import'
import { t } from '@/i18n'

/** Hent inn folk fra kontaktene og treff fra kalenderen, fra filer. */
export default async function ImportPage() {
  const userId = await requireUserId()
  const { persons, tags, logs, plans } = await getImportContext(userId)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-10">
      <div className="flex flex-col gap-2">
        <BackLink href="/settings">{t.settings.title}</BackLink>
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.import.title}</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">{t.import.lead}</p>
      </div>
      <ImportFlow persons={persons} tags={tags} existing={{ logs, plans }} />
    </div>
  )
}
