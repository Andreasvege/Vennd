import { Landing } from '@/components/Landing'
import { MapScreen } from '@/components/MapScreen'
import { TodayView } from '@/components/today/TodayView'
import { getUserId } from '@/server/session'
import { getGraph } from '@/server/queries/graph'
import { getTags } from '@/server/queries/tags'
import { getToday } from '@/server/queries/today'

// Forsiden er «I dag» på mobil og kartet på PC (der «I dag» står i
// panelet ved siden av). Samme rute; bredden avgjør hva som vises.
export default async function HomePage() {
  const userId = await getUserId()
  if (!userId) return <Landing />

  const [graph, tags, today] = await Promise.all([getGraph(userId), getTags(userId), getToday(userId)])

  return (
    <>
      <div className="desk:hidden">
        <TodayView data={today} />
      </div>
      <div className="hidden h-full desk:block">
        <MapScreen graph={graph} tags={tags} />
      </div>
    </>
  )
}
