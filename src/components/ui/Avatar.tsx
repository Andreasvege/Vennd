import Image from 'next/image'
import { initialsOf } from '@/domain/format'
import { tagFill, type TagColor } from '@/lib/palette'

type Size = 'sm' | 'md' | 'lg' | 'xl'

const SIZES: Record<Size, { px: number; text: string }> = {
  sm: { px: 28, text: 'text-[12px]' },
  md: { px: 40, text: 'text-[13px]' },
  lg: { px: 56, text: 'text-[16px]' },
  xl: { px: 88, text: 'text-[26px]' },
}

type Props = {
  name: string
  tint?: TagColor
  src?: string | null
  size?: Size
  /** Navnet står allerede ved siden av: skjul avataren for skjermlesere. */
  decorative?: boolean
  className?: string
}

/**
 * En person som en tintet sirkel med blekkstrek — samme form på kartet,
 * i lister og på profilen, så man kjenner dem igjen overalt.
 */
export function Avatar({ name, tint = 'stone', src, size = 'md', decorative, className }: Props) {
  const { px, text } = SIZES[size]

  return (
    <span
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': name })}
      className={[
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full',
        'font-sans font-semibold text-ink',
        text,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width: px,
        height: px,
        background: tagFill(tint),
        boxShadow: 'inset 0 0 0 1.25px var(--ink)',
      }}
    >
      {src ? (
        // Tom alt: etiketten ligger allerede på omslaget.
        <Image src={src} alt="" fill sizes={`${px}px`} className="object-cover" />
      ) : (
        <span aria-hidden>{initialsOf(name)}</span>
      )}
    </span>
  )
}
