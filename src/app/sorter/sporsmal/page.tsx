import { requireUserId } from '@/server/session'
import { prisma } from '@/lib/prisma'
import { personTint } from '@/lib/palette'
import { notArchived } from '@/server/queries/visibility'
import { QuestionDeck } from '@/components/sort/QuestionDeck'

/** Spørsmålskort: folk hentes ut av hukommelsen, ikke fra en fil. */
export default async function QuestionsPage() {
  const userId = await requireUserId()
  const persons = await prisma.person.findMany({
    where: { userId, ...notArchived },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, primaryTag: { select: { color: true } } },
  })
  return <QuestionDeck everyone={persons.map((p) => ({ id: p.id, name: p.name, tint: personTint(p) }))} />
}
