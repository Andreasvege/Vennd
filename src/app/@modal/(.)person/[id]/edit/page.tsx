import { getOwnedPerson } from '@/lib/person-query'
import { EditPersonForm } from '@/components/person/EditPersonForm'
import { BackLink } from '@/components/person/BackLink'
import { t } from '@/i18n'

type Params = { params: Promise<{ id: string }> }

// Avskjærer /person/[id]/edit slik at redigering blir et steg inne i det
// samme arket, ikke en full side bak det.
export default async function EditPersonModal({ params }: Params) {
  const { id } = await params
  const person = await getOwnedPerson(id)
  if (!person) return null

  return (
    <div className="flex flex-col gap-6">
      <BackLink href={`/person/${person.id}`}>{t.person.backToProfile(person.name)}</BackLink>
      <h2 className="font-display text-[26px] leading-tight tracking-tight">{t.person.editTitle(person.name)}</h2>
      <EditPersonForm person={person} />
    </div>
  )
}
