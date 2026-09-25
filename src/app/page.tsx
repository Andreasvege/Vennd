import { Landing } from '@/components/Landing'
import { MapScreen } from '@/components/MapScreen'
import { TodayView } from '@/components/today/TodayView'
import { getUserId } from '@/server/session'
import { getGraph } from '@/server/queries/graph'
import { getTags } from '@/server/queries/tags'
import { getToday } from '@/server/queries/today'
import { parsePath } from './kart/sti'

// Forsiden er «I dag» på mobil og kartet på PC (der «I dag» står i
// panelet ved siden av). Samme rute; bredden avgjør hva som vises.
type Props = { searchParams: Promise<{ sti?: string }> }

export default async function HomePage({ searchParams }: Props) {
  const userId = await getUserId()
  if (!userId) return <Landing />

  const [graph, tags, today, { sti }] = await Promise.all([
    getGraph(userId),
    getTags(userId),
    getToday(userId),
    searchParams,
  ])
  const highlight = parsePath(sti, graph.persons)

  return (
    <>
      <div className="desk:hidden">
        <TodayView data={today} />
      </div>
      <div className="hidden h-full desk:block">
        <MapScreen graph={graph} tags={tags} highlight={highlight} />
      </div>
    </>
  )
}
