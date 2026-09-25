import Link from 'next/link'
import { buttonClass } from '@/components/ui/button-styles'
import { t } from '@/i18n'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center gap-5 px-6 pb-16">
      <h1 className="font-display text-[34px] italic leading-tight">{t.notFound.title}</h1>
      <p className="text-[16px] text-ink-muted">{t.notFound.body}</p>
      <Link href="/" className={`${buttonClass('primary', 'lg')} self-start`}>
        {t.notFound.back}
      </Link>
    </div>
  )
}
