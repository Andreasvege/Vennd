import { t } from '@/i18n'

const DAY_MS = 86_400_000
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

/**
 * «i dag 19:30», «i morgen», «lørdag», «3. oktober» — slik en plan leses i
 * farta. Kjøres i nettleseren (lokal tid).
 */
export function whenLabel(at: Date, hasTime: boolean, now: Date = new Date()): string {
  const days = Math.round((startOfDay(at).getTime() - startOfDay(now).getTime()) / DAY_MS)
  const day =
    days === 0
      ? t.plans.today.toLowerCase()
      : days === 1
        ? t.plans.tomorrow.toLowerCase()
        : days > 1 && days < 7
          ? at.toLocaleDateString('nb-NO', { weekday: 'long' })
          : at.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
  const time = hasTime ? ` ${at.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}` : ''
  return `${day}${time}`
}

export function birthdayLabel(inDays: number): string {
  return inDays === 0 ? t.birthdays.today : inDays === 1 ? t.birthdays.tomorrow : t.birthdays.inDays(inDays)
}
