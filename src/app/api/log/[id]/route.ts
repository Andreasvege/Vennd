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

  const entry = await prisma.logEntry.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.logEntry.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
