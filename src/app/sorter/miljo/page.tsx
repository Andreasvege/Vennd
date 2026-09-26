import { BackLink } from '@/components/person/BackLink'
import { GroupFlow } from '@/components/sort/GroupFlow'
import { requireUserId } from '@/server/session'
import { getSortingData } from '@/server/queries/sorting'
import { t } from '@/i18n'

type Props = { searchParams: Promise<{ ids?: string }> }

/** Miljø for miljø. Med `?ids=` er de valgte i bunken krysset av fra start. */
export default async function GroupPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const [data, { ids }] = await Promise.all([getSortingData(userId), searchParams])
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
      <BackLink href="/sorter">{t.sort.back}</BackLink>
      <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.sort.ways.group.title}</h1>
      <GroupFlow data={data} preselect={ids?.split(',').filter(Boolean)} />
    </div>
  )
}
