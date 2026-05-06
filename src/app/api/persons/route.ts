import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const persons = await prisma.person.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(persons)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { name, birthday, notes, color } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Navn er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      birthday: birthday ? new Date(birthday) : null,
      notes: notes ?? null,
      color: color ?? '#6c63ff',
      positionX: Math.random() * 400,
      positionY: Math.random() * 300,
    },
  })

  return NextResponse.json(person, { status: 201 })
}
