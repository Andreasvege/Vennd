import { getUserId } from '@/server/session'
import { getToday } from '@/server/queries/today'
import { TodayView } from './TodayView'

/**
 * «I dag» i sidepanelet på PC. På mobil er det forsiden som viser det, så
 * her skjules det under desk-bredden.
 */
export async function TodayPanel() {
  const userId = await getUserId()
  if (!userId) return null
  const data = await getToday(userId)
  return (
    <div className="hidden desk:block">
      <TodayView data={data} />
    </div>
  )
}
