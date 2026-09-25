import { notFound } from 'next/navigation'
import { getPersonProfile } from '@/server/queries/person'
import { requireUserId } from '@/server/session'
import { PersonProfile } from '@/components/person/PersonProfile'
import { BackLink } from '@/components/person/BackLink'
import { t } from '@/i18n'

type Params = { params: Promise<{ id: string }> }

export default async function PersonPage({ params }: Params) {
  const { id } = await params
  const person = await getPersonProfile(await requireUserId(), id)
  if (!person) notFound()

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-5 py-8">
      <BackLink href="/">{t.person.backToMap}</BackLink>
      <PersonProfile person={person} />
    </div>
  )
}
