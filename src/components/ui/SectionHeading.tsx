import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** En handling som hører til seksjonen, f.eks. «Logg kontakt». */
  action?: ReactNode
  as?: 'h2' | 'h3'
}

export function SectionHeading({ children, action, as: Tag = 'h2' }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <Tag className="font-display text-[21px] italic leading-tight text-ink">{children}</Tag>
      {action}
    </div>
  )
}
