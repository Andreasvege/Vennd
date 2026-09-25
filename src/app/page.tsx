import { Landing } from '@/components/Landing'
import { HomeClient } from '@/components/HomeClient'
import { getUserId } from '@/server/session'
import { getGraph } from '@/server/queries/graph'
import { getReminders } from '@/server/queries/reminders'
import { getRecentLogs } from '@/server/queries/log'
import { getTags } from '@/server/queries/tags'

export default async function HomePage() {
  const userId = await getUserId()
  if (!userId) return <Landing />

  // Alt forsiden trenger, i parallell: én rundtur til databasen i stedet
  // for fire klientkall etter at siden har lastet.
  const [graph, reminders, logs, tags] = await Promise.all([
    getGraph(userId),
    getReminders(userId),
    getRecentLogs(userId),
    getTags(userId),
  ])

  return <HomeClient graph={graph} reminders={reminders} logs={logs} tags={tags} />
}
