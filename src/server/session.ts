import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getUserId(): Promise<string | null> {
  return (await auth())?.user?.id ?? null
}

/** Brukerens id, eller tilbake til forsiden. Eneste kilde til userId på serveren. */
export async function requireUserId(): Promise<string> {
  const id = await getUserId()
  if (!id) redirect('/')
  return id
}
