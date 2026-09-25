import { getPersonForEdit } from '@/server/queries/person'
import { requireUserId } from '@/server/session'
import { EditPersonForm } from '@/components/person/EditPersonForm'
import { BackLink } from '@/components/person/BackLink'
import { PanelSheet } from '@/components/person/PanelSheet'
import { t } from '@/i18n'

type Params = { params: Promise<{ id: string }> }

export default async function EditPersonPanel({ params }: Params) {
  const { id } = await params
  const data = await getPersonForEdit(await requireUserId(), id)
  if (!data) return null
  const { person } = data
  return (
    <PanelSheet label={t.person.editTitle(person.name)}>
      <div className="flex flex-col gap-6">
        <BackLink href={`/person/${person.id}`}>{t.person.backToProfile(person.name)}</BackLink>
        <h2 className="font-display text-[26px] leading-tight tracking-tight">{t.person.editTitle(person.name)}</h2>
        <EditPersonForm {...data} />
      </div>
    </PanelSheet>
  )
}
