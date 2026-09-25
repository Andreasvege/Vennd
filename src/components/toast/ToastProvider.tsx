'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { t } from '@/i18n'

type Toast = { id: number; message: string; action?: { label: string; href: string } }
type Show = (message: string, action?: Toast['action']) => void

const ToastContext = createContext<Show>(() => {})
export const useToast = () => useContext(ToastContext)

const SHOW_MS = 6000

/**
 * Én kort beskjed om gangen, nederst, som skjermlesere får lest opp
 * (role="status"). Brukes for «Lagret» og for «Verden er liten».
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback<Show>((message, action) => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message, action })
    // En beskjed med en handling blir stående til den lukkes: seks sekunder
    // er for kort til å nå lenken med tastatur eller skjermleser.
    if (!action) timer.current = setTimeout(() => setToast(null), SHOW_MS)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Regionen finnes alltid, så opplesningen skjer når teksten endres. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[60] flex justify-center px-4 desk:bottom-6"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-[16px] bg-ink py-2 pl-4 pr-2 text-[14px] text-paper shadow-float"
          >
            <span className="py-1.5">{toast.message}</span>
            {toast.action && (
              <Link
                href={toast.action.href}
                onClick={() => setToast(null)}
                className="shrink-0 rounded-[8px] px-2 py-1.5 font-medium underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-paper"
              >
                {toast.action.label}
              </Link>
            )}
            <button
              type="button"
              aria-label={t.common.close}
              onClick={() => setToast(null)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full opacity-70 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-paper"
            >
              <X aria-hidden size={16} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
