import { requireUserId } from '@/server/session'
import { getEnrichData } from '@/server/queries/enrich'
import { EnrichDeck } from '@/components/sort/EnrichDeck'

type Props = { searchParams: Promise<{ ids?: string; miljo?: string; aldri?: string }> }

/**
 * «Fyll inn kartet»: kortstokken for dem som allerede står på kartet. Med
 * `?ids=` bare de valgte (fra Innsikt eller en profil), med `?miljo=` bare
 * ett miljø, med `?aldri=1` bare dem uten logget kontakt.
 */
export default async function EnrichPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const { ids, miljo, aldri } = await searchParams
  const data = await getEnrichData(userId, {
    only: ids?.split(',').filter(Boolean),
    tagId: miljo,
    neverLogged: aldri === '1',
  })
  const group = miljo ? data.tags.find((tag) => tag.id === miljo)?.name : undefined
  return <EnrichDeck data={data} title={group} />
}
