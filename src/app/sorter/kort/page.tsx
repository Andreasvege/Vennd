import { requireUserId } from '@/server/session'
import { getSortingData } from '@/server/queries/sorting'
import { CardDeck } from '@/components/sort/CardDeck'

type Props = { searchParams: Promise<{ ids?: string }> }

/** Kortstokken. Med `?ids=` bare de valgte (fra Venter-bunken). */
export default async function DeckPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const [data, { ids }] = await Promise.all([getSortingData(userId), searchParams])
  return <CardDeck data={data} only={ids?.split(',').filter(Boolean)} />
}
