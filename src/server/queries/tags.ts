import 'server-only'
import { prisma } from '@/lib/prisma'
import { isTagColor } from '@/lib/palette'

export async function getTags(userId: string) {
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, color: true, _count: { select: { persons: true } } },
  })
  return tags.map(({ _count, color, ...t }) => ({
    ...t,
    color: isTagColor(color) ? color : ('stone' as const),
    personCount: _count.persons,
  }))
}

export type TagSummary = Awaited<ReturnType<typeof getTags>>[number]
