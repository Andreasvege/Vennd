import { Check } from 'lucide-react'

/** Rad for en react-aria Checkbox; boksen under reagerer på radens tilstand. */
export const checkRow = 'group flex min-h-11 cursor-pointer items-center gap-3 text-[15px] outline-none desk:min-h-9'

/**
 * Selve avkrysningsboksen i en react-aria Checkbox (som må ha `group`).
 * Rund for tråder, som tegnes som sirkler overalt; firkantet ellers.
 */
export function CheckMark({ shape = 'square' }: { shape?: 'square' | 'round' }) {
  return (
    <span
      className={[
        'flex size-5 shrink-0 items-center justify-center border-[1.5px] border-ink',
        shape === 'round' ? 'rounded-full' : 'rounded-[5px]',
        'group-data-[selected]:bg-ink group-data-[focus-visible]:ring-2 group-data-[focus-visible]:ring-pen group-data-[focus-visible]:ring-offset-2 group-data-[focus-visible]:ring-offset-paper-raised',
      ].join(' ')}
    >
      <Check aria-hidden size={12} strokeWidth={3} className="hidden text-paper group-data-[selected]:block" />
    </span>
  )
}
