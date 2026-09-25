'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui'
import { nextPhase } from '@/domain/romance'
import { todayISO } from '@/domain/format'
import { addPhase } from '@/server/actions/phase'
import { settle } from '@/server/actions/result'
import type { RomanticPhase } from '@/types'
import { t } from '@/i18n'

/** Gå videre til neste fase, eller avslutt. Datoen er i dag. */
export function PhaseControl({ personId, current }: { personId: string; current: RomanticPhase | null }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const next = nextPhase(current)

  const go = (phase: RomanticPhase) =>
    startTransition(async () => {
      const result = await settle(addPhase({ personId, phase, at: todayISO() }))
      setError(result.ok ? '' : t.errors[result.error])
      setConfirming(false)
    })

  if (current === 'ENDED') return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {next && (
          <Button variant="secondary" size="sm" onPress={() => go(next)} isDisabled={pending}>
            {current === null ? t.phaseControl.start : t.phaseControl.next(t.phase[next])}
          </Button>
        )}
        {current !== null &&
          (confirming ? (
            <>
              <span className="text-[13px] text-ink-muted">{t.phaseControl.confirmEnd}</span>
              <Button variant="danger" size="sm" onPress={() => go('ENDED')} isDisabled={pending}>
                {t.phaseControl.end}
              </Button>
              <Button variant="quiet" size="sm" onPress={() => setConfirming(false)}>
                {t.common.cancel}
              </Button>
            </>
          ) : (
            <Button variant="quiet" size="sm" onPress={() => setConfirming(true)}>
              {t.phaseControl.end}
            </Button>
          ))}
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-redpencil">
          {error}
        </p>
      )}
    </div>
  )
}
