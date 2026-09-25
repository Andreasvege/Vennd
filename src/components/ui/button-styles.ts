// Egen modul (uten 'use client'), så serverkomponenter kan style en lenke
// som en knapp. Konstanter eksportert fra en klientmodul blir referanser,
// ikke strenger, når en serverkomponent importerer dem.

export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Én primærknapp per flate: blekk på papir. Resten er papir med strek
// eller rene tekstknapper, så øyet alltid vet hva hovedhandlingen er.
export const buttonBase = [
  'inline-flex items-center justify-center gap-2 rounded-[10px] font-medium whitespace-nowrap',
  'transition-colors duration-150 ease-out outline-none select-none',
  'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
].join(' ')

// react-aria setter data-attributter; vanlige lenker har :hover og :focus-visible.
const focusRing =
  'data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper focus-visible:ring-2 focus-visible:ring-pen focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper data-[hovered]:bg-ink/88 hover:bg-ink/88 data-[pressed]:bg-ink/78',
  secondary:
    'bg-paper-raised text-ink border border-rule data-[hovered]:border-ink-muted hover:border-ink-muted data-[pressed]:bg-rule/40',
  quiet: 'text-ink-muted data-[hovered]:text-ink hover:text-ink data-[pressed]:text-ink',
  danger:
    'bg-paper-raised text-redpencil border border-redpencil/50 data-[hovered]:border-redpencil hover:border-redpencil',
}

// Under desk-bredden er alt minst 44 px høyt: fingre treffer ikke 32 px.
// På PC, med mus, får de mindre størrelsene være kompakte.
export const buttonSizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-2.5 text-[13px] desk:min-h-8',
  md: 'min-h-11 px-4 text-[14px] desk:min-h-10',
  lg: 'min-h-12 px-5 text-[15px]',
}

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return [buttonBase, focusRing, buttonVariants[variant], buttonSizes[size]].join(' ')
}
