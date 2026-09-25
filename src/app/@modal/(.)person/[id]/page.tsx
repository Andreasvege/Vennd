import { getPersonProfile } from '@/server/queries/person'
import { requireUserId } from '@/server/session'
import { PersonProfile } from '@/components/person/PersonProfile'

type Params = { params: Promise<{ id: string }> }

export default async function PersonModal({ params }: Params) {
  const { id } = await params
  const person = await getPersonProfile(await requireUserId(), id)
  if (!person) return null

  return <PersonProfile person={person} />
}
