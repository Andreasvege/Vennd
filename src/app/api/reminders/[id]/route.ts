import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!reminder) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      ...(body.dismissed !== undefined && { dismissed: body.dismissed }),
      ...(body.message !== undefined && { message: body.message }),
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

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!reminder) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.reminder.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
