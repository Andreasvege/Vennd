import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params

  const relationship = await prisma.relationship.findFirst({
    where: {
      id,
      fromPerson: { userId: session.user.id },
      toPerson: { userId: session.user.id },
    },
  })

  if (!relationship) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.relationship.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
