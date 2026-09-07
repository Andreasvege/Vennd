import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getOwnedPerson } from '@/lib/person-query'
import { EditPersonForm } from '@/components/person/EditPersonForm'

type Params = { params: Promise<{ id: string }> }

// Bevisst en ekte side, ikke en modal: profilen vises allerede som modal
// over kartet, og modal oppå modal er en dårlig idé.
export default async function EditPersonPage({ params }: Params) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href={`/person/${person.id}`}
        className="text-Text/40 hover:text-Text transition-colors text-sm mb-6 inline-block"
      >
        ← Tilbake til {person.name}
      </Link>
      <h1 className="text-2xl font-bold text-Text mb-5">Rediger {person.name}</h1>
      <EditPersonForm person={person} />
    </main>
  )
}
