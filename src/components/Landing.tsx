'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui'
import { t } from '@/i18n'

/**
 * Kartets signatur i miniatyr: deg i midten, noen få mennesker rundt, og
 * én relasjon mellom to av dem. Farger fra tokens, så den følger temaet.
 */
function MiniMap() {
  return (
    <svg width="168" height="104" viewBox="0 0 168 104" aria-hidden className="overflow-visible">
      <g stroke="var(--ink)" strokeLinecap="round" fill="none">
        <line x1="84" y1="56" x2="34" y2="28" strokeWidth="1.5" opacity="0.55" />
        <line x1="84" y1="56" x2="138" y2="24" strokeWidth="1.5" opacity="0.55" />
        <line x1="84" y1="56" x2="146" y2="80" strokeWidth="1.2" opacity="0.4" />
        <line x1="84" y1="56" x2="24" y2="84" strokeWidth="1" strokeDasharray="1 5" opacity="0.5" />
      </g>
      <path
        d="M138 24 Q156 50 146 80"
        stroke="var(--tag-rose-stroke)"
        strokeWidth="1.3"
        strokeDasharray="5 4"
        fill="none"
      />
      <g stroke="var(--ink)" strokeWidth="1.25">
        <circle cx="34" cy="28" r="11" fill="var(--tag-ochre-fill)" />
        <circle cx="138" cy="24" r="11" fill="var(--tag-slate-fill)" />
        <circle cx="146" cy="80" r="11" fill="var(--tag-teal-fill)" />
        <circle cx="24" cy="84" r="9" fill="var(--tag-stone-fill)" opacity="0.6" />
      </g>
      <circle cx="84" cy="56" r="15" fill="var(--ink)" />
    </svg>
  )
}

export function Landing() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center gap-8 px-6 pb-16">
      <MiniMap />
      <div className="flex flex-col gap-5">
        <h1 className="font-display text-[46px] italic leading-[0.95] tracking-tight desk:text-[64px]">
          {t.app.name}
        </h1>
        <p className="font-display text-[21px] leading-snug text-ink-muted">{t.landing.lead}</p>
      </div>
      <div>
        <Button variant="primary" size="lg" onPress={() => signIn('google')}>
          {t.nav.signIn}
        </Button>
      </div>
    </div>
  )
}
