'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { mapViewInput, type MapViewInput } from '@/server/schemas'
import { parseId, refreshAll } from './shared'
import { fail, type ActionResult } from './result'

/** Lagre syn og filter under et navn. Samme navn igjen oppdaterer visningen. */
export async function saveView(raw: MapViewInput): Promise<ActionResult<{ id: string }>> {
  const userId = await requireUserId()
  const parsed = mapViewInput.safeParse(raw)
  if (!parsed.success) return fail('invalid')
  const { name, mode, filter } = parsed.data

  const count = await prisma.mapView.count({ where: { userId } })
  const view = await prisma.mapView.upsert({
    where: { userId_name: { userId, name } },
    create: { userId, name, mode, filter, sortOrder: count },
    update: { mode, filter },
    select: { id: true },
  })
  refreshAll()
  return { ok: true, data: { id: view.id } }
}

export async function renameView(rawId: string, rawName: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  const name = mapViewInput.shape.name.safeParse(rawName)
  if (!id || !name.success) return fail('invalid')

  const clash = await prisma.mapView.findFirst({ where: { userId, name: name.data, id: { not: id } }, select: { id: true } })
  if (clash) return fail('taken')

  const { count } = await prisma.mapView.updateMany({ where: { id, userId }, data: { name: name.data } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}

export async function deleteView(rawId: string): Promise<ActionResult> {
  const userId = await requireUserId()
  const id = parseId(rawId)
  if (!id) return fail('invalid')
  const { count } = await prisma.mapView.deleteMany({ where: { id, userId } })
  if (count === 0) return fail('not-found')
  refreshAll()
  return { ok: true }
}
