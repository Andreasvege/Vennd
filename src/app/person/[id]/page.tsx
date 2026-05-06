import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

const LOG_EMOJI: Record<string, string> = {
  MET: '☕',
  CALLED: '📞',
  MESSAGE: '💬',
  OTHER: '📝',
}

const LOG_LABELS: Record<string, string> = {
  MET: 'Møttes',
  CALLED: 'Ringte',
  MESSAGE: 'Melding',
  OTHER: 'Annet',
}

export default async function PersonPage({ params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/')
  }

  const { id } = await params

  const person = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
    include: {
      logEntries: { orderBy: { date: 'desc' } },
      reminders: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!person) notFound()

  const formatDate = (d: Date) =>
    new Date(d).toLocaleDateString('no-NO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

  const initials = person.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/" className="text-Text/40 hover:text-Text transition-colors text-sm mb-6 inline-block">
        ← Tilbake til kartet
      </Link>

      {/* Header */}
      <div className="glass-card p-6 mb-6 flex items-start gap-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shrink-0"
          style={{ backgroundColor: person.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-Text mb-1">{person.name}</h1>
          {person.birthday && (
            <p className="text-sm text-Text/50">
              Bursdag: {formatDate(person.birthday)}
            </p>
          )}
          <p className="text-xs text-Text/30 mt-1">
            Lagt til {formatDate(person.createdAt)}
          </p>
        </div>
      </div>

      {/* Notes */}
      {person.notes && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-3">Notat</h2>
          <p className="text-Text/80 leading-relaxed whitespace-pre-wrap">{person.notes}</p>
        </div>
      )}

      {/* Active reminders */}
      {person.reminders.length > 0 && (
        <div className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-3">Påminnelser</h2>
          <div className="flex flex-col gap-2">
            {person.reminders.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-sm text-Text/70">
                <span>{r.type === 'AUTO' ? '⏰' : '📌'}</span>
                <span>{r.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log history */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-4">Kontaktlogg</h2>
        {person.logEntries.length === 0 ? (
          <p className="text-Text/30 text-sm">Ingen loggede kontakter ennå.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {person.logEntries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-xl mt-0.5">{LOG_EMOJI[entry.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-Text">{LOG_LABELS[entry.type]}</span>
                    <span className="text-xs text-Text/40">{formatDate(entry.date)}</span>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-Text/60 leading-relaxed">{entry.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
