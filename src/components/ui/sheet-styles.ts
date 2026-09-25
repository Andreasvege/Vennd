// Delt mellom Sheet og PersonModalShell. Skallet styrer åpningen selv
// (det lever i en rute), så det kan ikke bruke Sheet direkte — men det
// skal se og bevege seg identisk.

export const sheetOverlay = [
  'fixed inset-0 z-50 flex items-end justify-center bg-ink/30 sm:items-center sm:p-6',
  'transition-opacity duration-250 ease-out',
  'data-[entering]:opacity-0 data-[exiting]:opacity-0',
].join(' ')

export const sheetModal = (size: 'md' | 'lg' = 'md') =>
  [
    'w-full max-h-[92dvh] overflow-y-auto overscroll-contain bg-paper shadow-float outline-none',
    'rounded-t-[16px] sm:rounded-[16px]',
    size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-lg',
    // Bunnark glir opp på mobil; på større skjermer vokser dialogen fram.
    'transition duration-250 ease-out',
    'data-[entering]:translate-y-6 data-[exiting]:translate-y-6',
    'sm:data-[entering]:translate-y-0 sm:data-[entering]:scale-[0.98]',
    'sm:data-[exiting]:translate-y-0 sm:data-[exiting]:scale-[0.98]',
  ].join(' ')

export const sheetBody = 'px-5 pb-8 pt-4 sm:px-7 sm:pb-7'
