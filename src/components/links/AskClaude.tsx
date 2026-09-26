'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui'
import { RelativeDay } from '@/components/RelativeDay'
import { askClaudeForLinks } from '@/server/actions/links'
import { settle } from '@/server/actions/result'
import { t } from '@/i18n'

/**
 * «Spør Claude»: hele nettverket vurderes i ett kall, når du ber om det.
 * Viser når det sist skjedde, så du vet om det er verdt et nytt.
 */
export function AskClaude({ lastAt }: { lastAt: Date | null }) {
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const ask = () =>
    startTransition(async () => {
      setMessage('')
      const res = await settle(askClaudeForLinks())
      if (!res.ok) return setMessage(t.errors[res.error])
      const r = res.data.result
      setMessage(r.status === 'done' ? t.links.askDone(r.found) : r.status === 'busy' ? t.links.askBusy : t.links.askFailed)
    })

  return (
    <div className="flex flex-col items-start gap-2 rounded-[14px] border border-rule bg-paper-raised p-4">
      <p className="text-[14px] text-ink-muted">{t.links.askLead}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onPress={ask} isDisabled={pending}>
          <Sparkles aria-hidden size={15} strokeWidth={1.75} />
          {pending ? t.links.asking : t.links.ask}
        </Button>
        {lastAt && (
          <span className="text-[13px] text-ink-muted">
            {t.links.lastAsked} <RelativeDay date={lastAt} />
          </span>
        )}
      </div>
      <p role="status" className="text-[14px] text-ink">
        {message}
      </p>
    </div>
  )
}
