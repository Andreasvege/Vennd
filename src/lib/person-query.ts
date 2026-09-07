import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { PersonWithHistory } from '@/components/person/PersonProfile'

// Brukes av både den fulle profilsiden og modalen som avskjærer den, så
// eierskapssjekken bare finnes ett sted.
export async function getOwnedPerson(id: string): Promise<PersonWithHistory | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.person.findFirst({
    where: { id, userId: session.user.id },
    include: {
      logEntries: { orderBy: { date: 'desc' } },
      reminders: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  })
}
