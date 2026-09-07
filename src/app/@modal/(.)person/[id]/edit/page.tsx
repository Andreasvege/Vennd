import Link from 'next/link'
import { getOwnedPerson } from '@/lib/person-query'
import { EditPersonForm } from '@/components/person/EditPersonForm'

type Params = { params: Promise<{ id: string }> }

// Avskjærer /person/[id]/edit slik at redigering blir en side inne i den
// samme modalen, ikke en full side bak den.
export default async function EditPersonModal({ params }: Params) {
  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) return null

  return (
    <div className="flex flex-col gap-4">
      <Link
        href={`/person/${person.id}`}
        className="text-Text/40 hover:text-Text transition-colors text-sm"
      >
        ← Tilbake til profilen
      </Link>
      <EditPersonForm person={person} />
    </div>
  )
}
