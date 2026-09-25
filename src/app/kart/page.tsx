import { MapScreen } from '@/components/MapScreen'
import { requireUserId } from '@/server/session'
import { getGraph } from '@/server/queries/graph'
import { getTags } from '@/server/queries/tags'
import { parsePath } from './sti'
import { getViews } from '@/server/queries/views'

type Props = { searchParams: Promise<{ sti?: string }> }

export default async function MapPage({ searchParams }: Props) {
  const userId = await requireUserId()
  const [graph, tags, { sti }] = await Promise.all([getGraph(userId), getTags(userId), searchParams])
  const views = await getViews(userId, graph.tags.map((tag) => tag.id))
  // På mobil: skjermen minus header (64) og fanelinje (72 + safe area).
  return (
    <div className="h-[calc(100dvh-136px-env(safe-area-inset-bottom))] desk:h-full">
      <MapScreen graph={graph} tags={tags} views={views} highlight={parsePath(sti, graph.persons)} />
    </div>
  )
}
