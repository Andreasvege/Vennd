import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getOwnedPerson } from '@/lib/person-query'
import { PersonProfile } from '@/components/person/PersonProfile'

type Params = { params: Promise<{ id: string }> }

export default async function PersonPage({ params }: Params) {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) notFound()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="text-Text/40 hover:text-Text transition-colors text-sm mb-6 inline-block"
      >
        ← Tilbake til kartet
      </Link>
      <PersonProfile person={person} />
    </main>
  )
}
