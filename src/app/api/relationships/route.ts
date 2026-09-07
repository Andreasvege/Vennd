import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRelationshipColor } from '@/lib/relationship-colors'
import type { RelationshipType } from '@/types'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  // Begge sider må eies av brukeren. Filtrerte vi bare på fromPerson, ville
  // svaret lekke hele toPerson-raden til en annen brukers person.
  const relationships = await prisma.relationship.findMany({
    where: {
      fromPerson: { userId: session.user.id },
      toPerson: { userId: session.user.id },
    },
    include: { fromPerson: true, toPerson: true },
  })

  return NextResponse.json(relationships)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { fromPersonId, toPersonId, type } = body

  if (!fromPersonId || !toPersonId || !type) {
    return NextResponse.json(
      { error: 'fromPersonId, toPersonId og type er påkrevd' },
      { status: 400 }
    )
  }

  const [from, to] = await Promise.all([
    prisma.person.findFirst({ where: { id: fromPersonId, userId: session.user.id } }),
    prisma.person.findFirst({ where: { id: toPersonId, userId: session.user.id } }),
  ])

  if (!from || !to) {
    return NextResponse.json({ error: 'Personene ble ikke funnet' }, { status: 404 })
  }

  const color = getRelationshipColor(type as RelationshipType)

  const relationship = await prisma.relationship.create({
    data: {
      fromPersonId,
      toPersonId,
      type: type as RelationshipType,
      color,
    },
  })

  return NextResponse.json(relationship, { status: 201 })
}
