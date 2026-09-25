'use client'

import { buttonClass } from '@/components/ui/button-styles'
import { t } from '@/i18n'

// Siste sikkerhetsnett: noe uventet feilet under rendering. Handlingene
// svarer med egne feilmeldinger; hit kommer bare det ingen fanget.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center gap-5 px-6 pb-16">
      <h1 className="font-display text-[34px] italic leading-tight">{t.appError.title}</h1>
      <p className="text-[16px] text-ink-muted">{t.appError.body}</p>
      <button type="button" onClick={reset} className={`${buttonClass('primary', 'lg')} self-start`}>
        {t.appError.retry}
      </button>
    </div>
  )
}
