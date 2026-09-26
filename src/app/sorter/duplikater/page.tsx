import { BackLink } from '@/components/person/BackLink'
import { DuplicateList } from '@/components/sort/DuplicateList'
import { requireUserId } from '@/server/session'
import { getDuplicates } from '@/server/queries/duplicates'
import { t } from '@/i18n'

/** Mulige duplikater, typisk fra import: samme person med litt ulike navn. */
export default async function DuplicatesPage() {
  const items = await getDuplicates(await requireUserId())
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
      <BackLink href="/sorter">{t.sort.back}</BackLink>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.dupes.title}</h1>
        <p className="text-[15px] text-ink-muted">{t.dupes.lead}</p>
      </div>
      <DuplicateList items={items} />
    </div>
  )
}
