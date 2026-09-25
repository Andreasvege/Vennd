import { t } from '@/i18n'
import type { RelationshipType } from '@/types'

// Rekkefølgen i velgeren: fra nærmest til fjernest.
const ORDER: RelationshipType[] = ['FRIEND', 'FAMILY', 'ROMANTIC', 'COLLEAGUE', 'ACQUAINTANCE', 'OTHER']

export const TYPE_OPTIONS = ORDER.map((value) => ({ value, label: t.relationType[value] }))
