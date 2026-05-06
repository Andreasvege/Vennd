import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/lib/relationship-colors'
import Image from 'next/image'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const types = Object.entries(RELATIONSHIP_LABELS) as [keyof typeof RELATIONSHIP_LABELS, string][]

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-Text mb-8">Innstillinger</h1>

      {/* Account */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-4">Konto</h2>
        <div className="flex items-center gap-4">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profilbilde"
              width={48}
              height={48}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-Text">{session.user.name}</p>
            <p className="text-sm text-Text/50">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Relationship color legend */}
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-Text/60 uppercase tracking-wider mb-4">Relasjonsfarger</h2>
        <div className="flex flex-col gap-3">
          {types.map(([type, label]) => (
            <div key={type} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
              />
              <span className="text-sm text-Text/80">{label}</span>
              <span className="text-xs text-Text/40 ml-auto font-mono">{RELATIONSHIP_COLORS[type]}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
