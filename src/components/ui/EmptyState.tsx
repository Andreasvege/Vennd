import type { ReactNode } from 'react'

type Props = {
  title: string
  body?: string
  /** Et tomt skjermbilde er en invitasjon: gi alltid én ting å gjøre. */
  action?: ReactNode
  className?: string
}

export function EmptyState({ title, body, action, className }: Props) {
  return (
    <div
      className={['flex flex-col items-center gap-2 text-center', className]
        .filter(Boolean)
        .join(' ')}
    >
      <p className="font-display text-[21px] text-ink">{title}</p>
      {body && <p className="max-w-xs text-[14px] text-ink-muted">{body}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
