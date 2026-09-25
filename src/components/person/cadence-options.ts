import { t } from '@/i18n'

// Valgene i kadens-velgeren. «Aldri» lagres som null og slår av
// auto-påminnelser for personen.
const WEEKS = [1, 2, 3, 4, 6, 8, 12, 26, 52] as const

export type CadenceOption = `${(typeof WEEKS)[number]}` | 'never'

export const CADENCE_OPTIONS: { value: CadenceOption; label: string }[] = [
  ...WEEKS.map((w) => ({ value: `${w}` as CadenceOption, label: t.cadence.every(w) })),
  { value: 'never', label: t.cadence.never },
]

export function cadenceToOption(weeks: number | null): CadenceOption {
  if (weeks === null) return 'never'
  // En kadens som ikke finnes i lista (satt før valgene ble strammet inn)
  // rundes til nærmeste valg, så velgeren aldri står tom.
  const nearest = WEEKS.reduce((best, w) => (Math.abs(w - weeks) < Math.abs(best - weeks) ? w : best))
  return `${nearest}` as CadenceOption
}

export function cadenceFromOption(option: CadenceOption): number | null {
  return option === 'never' ? null : Number(option)
}
