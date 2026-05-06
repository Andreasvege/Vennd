import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAutoReminders } from '@/lib/reminders'
import type { ReminderType } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id, dismissed: false },
    include: { person: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reminders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()

  // Special action: generate auto-reminders based on last contact dates
  if (body.action === 'generate-auto') {
    const persons = await prisma.person.findMany({
      where: { userId: session.user.id },
      include: {
        logEntries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    const personsWithLastContact = persons.map((p) => ({
      id: p.id,
      name: p.name,
      userId: p.userId,
      lastContactDate: p.logEntries[0]?.date ?? null,
    }))

    const toGenerate = generateAutoReminders(personsWithLastContact)

    await prisma.reminder.deleteMany({
      where: { userId: session.user.id, type: 'AUTO', dismissed: false },
    })

    const created = await prisma.reminder.createMany({
      data: toGenerate.map((r) => ({
        userId: r.userId,
        personId: r.personId,
        type: 'AUTO' as ReminderType,
        message: r.message,
      })),
    })

    return NextResponse.json({ created: created.count }, { status: 201 })
  }

  // Manual reminder
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
