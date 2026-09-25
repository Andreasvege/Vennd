import 'server-only'
import { prisma } from '@/lib/prisma'
import { normalize } from '@/domain/mapFilter'
import { isMapMode, type MapMode } from '@/domain/mapMode'

/** Lagrede visninger, med filteret renset mot taggene du har nå. */
export async function getViews(userId: string, knownTagIds: string[]) {
  const views = await prisma.mapView.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, name: true, mode: true, filter: true },
  })
  return views.map((v) => ({
    id: v.id,
    name: v.name,
    mode: (isMapMode(v.mode) ? v.mode : 'nearness') as MapMode,
    filter: normalize(v.filter, knownTagIds),
  }))
}

export type SavedView = Awaited<ReturnType<typeof getViews>>[number]
