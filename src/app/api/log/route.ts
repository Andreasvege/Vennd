import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { LogEntryType } from '@prisma/client'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const personId = searchParams.get('personId')
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  const entries = await prisma.logEntry.findMany({
    where: {
      userId: session.user.id,
      ...(personId && { personId }),
    },
    include: { person: true },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { personId, type, notes, date } = body

  if (!personId || !type) {
    return NextResponse.json({ error: 'personId og type er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, userId: session.user.id },
  })

  if (!person) {
    return NextResponse.json({ error: 'Person ikke funnet' }, { status: 404 })
  }

  const entry = await prisma.logEntry.create({
    data: {
      userId: session.user.id,
      personId,
      type: type as LogEntryType,
      notes: notes ?? null,
      date: date ? new Date(date) : new Date(),
    },
    include: { person: true },
  })

  return NextResponse.json(entry, { status: 201 })
}
