import { MapScreen } from '@/components/MapScreen'
import { requireUserId } from '@/server/session'
import { getGraph } from '@/server/queries/graph'
import { getTags } from '@/server/queries/tags'

export default async function MapPage() {
  const userId = await requireUserId()
  const [graph, tags] = await Promise.all([getGraph(userId), getTags(userId)])
  // På mobil: skjermen minus header (64) og fanelinje (72 + safe area).
  return (
    <div className="h-[calc(100dvh-136px-env(safe-area-inset-bottom))] desk:h-full">
      <MapScreen graph={graph} tags={tags} />
    </div>
  )
}
