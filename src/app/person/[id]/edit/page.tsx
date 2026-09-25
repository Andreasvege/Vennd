import { notFound } from 'next/navigation'
import { getPersonForEdit } from '@/server/queries/person'
import { requireUserId } from '@/server/session'
import { EditPersonForm } from '@/components/person/EditPersonForm'
import { BackLink } from '@/components/person/BackLink'
import { t } from '@/i18n'

type Params = { params: Promise<{ id: string }> }

// Bevisst en ekte side, ikke et ark: profilen vises allerede som ark
// over kartet, og ark oppå ark er en dårlig idé.
export default async function EditPersonPage({ params }: Params) {
  const { id } = await params
  const data = await getPersonForEdit(await requireUserId(), id)
  if (!data) notFound()
  const { person } = data

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-5 py-8">
      <BackLink href={`/person/${person.id}`}>{t.person.backToProfile(person.name)}</BackLink>
      <h1 className="font-display text-[34px] leading-tight tracking-tight">{t.person.editTitle(person.name)}</h1>
      <EditPersonForm {...data} />
    </div>
  )
}
