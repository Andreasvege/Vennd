import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Personer og relasjoner i ett kall. Som to endepunkter kostet dette to
// autentiseringer og to spørringer; databasen ligger ~110 ms unna, så hver
// rundtur vi sparer er merkbar.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const [persons, relationships] = await Promise.all([
    prisma.person.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' },
    }),
    prisma.relationship.findMany({
      where: {
        fromPerson: { userId: session.user.id },
        toPerson: { userId: session.user.id },
      },
    }),
  ])

  return NextResponse.json({ persons, relationships })
}
