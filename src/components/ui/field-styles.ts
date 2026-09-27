// Stilene for felt, i en vanlig modul (ikke 'use client'), så også
// serverkomponenter kan bruke dem, slik som button-styles.

export const fieldLabel = 'block text-[13px] text-ink-muted mb-1.5'

export const fieldControl = [
  'w-full rounded-[10px] bg-paper-raised border border-rule px-3 py-2.5 text-[15px] text-ink',
  'placeholder:text-ink-muted outline-none transition-colors duration-150',
  'data-[hovered]:border-ink-muted/60',
  'data-[focused]:border-pen data-[focused]:ring-2 data-[focused]:ring-pen data-[focused]:ring-offset-2 data-[focused]:ring-offset-paper',
  'data-[invalid]:border-redpencil data-[disabled]:opacity-40',
].join(' ')
