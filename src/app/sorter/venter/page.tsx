import { BackLink } from '@/components/person/BackLink'
import { WaitingList } from '@/components/sort/WaitingList'
import { requireUserId } from '@/server/session'
import { getSortingData } from '@/server/queries/sorting'
import { t } from '@/i18n'

/** Venter-bunken: de usorterte, og dem du har tatt ut av kartet. */
export default async function WaitingPage() {
  const data = await getSortingData(await requireUserId())
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
      <BackLink href="/sorter">{t.sort.back}</BackLink>
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.sort.ways.waiting.title}</h1>
        <p className="text-[15px] text-ink-muted">{t.sort.waiting(data.unsorted.length)}</p>
      </div>
      <WaitingList data={data} />
    </div>
  )
}
