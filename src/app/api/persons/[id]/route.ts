import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const person = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
    include: {
      logEntries: { orderBy: { date: 'desc' } },
      reminders: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!person) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  return NextResponse.json(person)
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, birthday, notes, color, positionX, positionY } = body

  const existing = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  const updated = await prisma.person.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
      ...(notes !== undefined && { notes }),
      ...(color !== undefined && { color }),
      ...(positionX !== undefined && { positionX }),
      ...(positionY !== undefined && { positionY }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.person.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
