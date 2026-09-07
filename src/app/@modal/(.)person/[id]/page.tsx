import { getOwnedPerson } from '@/lib/person-query'
import { PersonProfile } from '@/components/person/PersonProfile'

type Params = { params: Promise<{ id: string }> }

export default async function PersonModal({ params }: Params) {
  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) return null

  return <PersonProfile person={person} />
}
