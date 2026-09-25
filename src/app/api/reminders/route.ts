import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeAutoReminders } from '@/lib/reminders'
import type { PersonWithCadence, ReminderResponse } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  // Auto-påminnelser beregnes her og lagres aldri. Alt vi trenger er siste
  // loggførte kontakt per person.
  const persons = await prisma.person.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      type: true,
      userId: true,
      cadenceWeeks: true,
      snoozedUntil: true,
      logEntries: { orderBy: { date: 'desc' }, take: 1, select: { date: true } },
    },
  })

  const withCadence: PersonWithCadence[] = persons.map((p) => ({
    id: p.id,
    name: p.name,
    userId: p.userId,
    cadenceWeeks: p.cadenceWeeks,
    snoozedUntil: p.snoozedUntil,
    lastContactDate: p.logEntries[0]?.date ?? null,
  }))

  const typeOf = new Map(persons.map((p) => [p.id, p.type]))

  const auto: ReminderResponse[] = computeAutoReminders(withCadence).map((r) => ({
    id: r.id,
    personId: r.personId,
    personName: r.personName,
    personType: typeOf.get(r.personId)!,
    type: 'AUTO',
    message: r.message,
    dueDate: null,
    weeksSinceContact: r.weeksSinceContact,
  }))

  const stored = await prisma.reminder.findMany({
    where: { userId: session.user.id, type: 'MANUAL', dismissed: false },
    include: { person: { select: { name: true, type: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const manual: ReminderResponse[] = stored.map((r) => ({
    id: r.id,
    personId: r.personId,
    personName: r.person.name,
    personType: r.person.type,
    type: 'MANUAL',
    message: r.message ?? '',
    dueDate: r.dueDate?.toISOString() ?? null,
    weeksSinceContact: null,
  }))

  return NextResponse.json([...auto, ...manual])
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { personId, message, dueDate } = body

  if (!personId || !message) {
    return NextResponse.json({ error: 'personId og message er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, userId: session.user.id },
  })

  if (!person) {
    return NextResponse.json({ error: 'Person ikke funnet' }, { status: 404 })
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId: session.user.id,
      personId,
      type: 'MANUAL',
      message,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { person: true },
  })

  return NextResponse.json(reminder, { status: 201 })
}
