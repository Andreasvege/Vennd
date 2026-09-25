import type { LogEntryType } from '@/types'

/** Typene en logg kan ha, i den rekkefølgen de vises. */
export const LOG_TYPES = ['MET', 'CALLED', 'MESSAGE', 'DATE', 'OTHER'] as const satisfies readonly LogEntryType[]

/** En plan er noe dere skal gjøre sammen; en melding planlegger man ikke. */
export const PLAN_TYPES = ['MET', 'CALLED', 'DATE', 'OTHER'] as const satisfies readonly LogEntryType[]
