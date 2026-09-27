import { t } from '@/i18n'
import { CADENCE_WEEKS, nearestCadence } from '@/domain/cadence'

// Valgene i kadens-velgeren, de samme som i kortstokken. «Aldri» lagres
// som null og slår av auto-påminnelser for personen.
const WEEKS = CADENCE_WEEKS

export type CadenceOption = `${(typeof WEEKS)[number]}` | 'never'

export const CADENCE_OPTIONS: { value: CadenceOption; label: string }[] = [
  ...WEEKS.map((w) => ({ value: `${w}` as CadenceOption, label: t.cadence.every(w) })),
  { value: 'never', label: t.cadence.never },
]

export function cadenceToOption(weeks: number | null): CadenceOption {
  if (weeks === null) return 'never'
  // En kadens som ikke finnes i lista (satt før valgene ble strammet inn)
  // rundes til nærmeste valg, så velgeren aldri står tom.
  return `${nearestCadence(weeks)}` as CadenceOption
}

export function cadenceFromOption(option: CadenceOption): number | null {
  return option === 'never' ? null : Number(option)
}
