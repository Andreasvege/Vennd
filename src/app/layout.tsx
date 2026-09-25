import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import './globals.css'
import { AppHeader } from '@/components/AppHeader'
import { Providers } from '@/components/providers/Providers'
import { themeScript } from '@/components/theme'
import { TOKENS } from '@/styles/tokens'
import { BottomTabs } from '@/components/BottomTabs'
import { getUserId } from '@/server/session'
import { getComposerData } from '@/server/queries/composer'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

// Fraunces bærer dagbok-stemmen: navn, overskrifter og selve loggteksten.
// SOFT og WONK gir de runde, litt skjeve formene som skiller den fra en
// vanlig avis-serif; opsz lar store titler bli tettere enn brødtekst.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
})

const instrument = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'Vennekart',
  description: 'En dagbok over menneskene dine',
  // Lagt til på hjemskjermen på iPhone: åpnes uten nettleserramme.
  appleWebApp: { capable: true, title: 'Vennekart', statusBarStyle: 'default' },
}

export const viewport: Viewport = {
  // Innholdet går helt ut til kantene; fanelinjen tar selv høyde for hjemmelinjen.
  viewportFit: 'cover',
  themeColor: [
    // Nettleserens ramme (adresselinje, statuslinje) får papirfargen.
    { media: '(prefers-color-scheme: light)', color: TOKENS.light.paper },
    { media: '(prefers-color-scheme: dark)', color: TOKENS.dark.paper },
  ],
}

export default async function RootLayout({
  children,
  panel,
}: Readonly<{
  children: React.ReactNode
  panel: React.ReactNode
}>) {
  // Skriv-arket skal kunne åpnes fra hvor som helst, så dataene det trenger
  // hentes her. Handlingene revaliderer layouten, så de holdes ferske.
  const userId = await getUserId()
  const composer = userId ? await getComposerData(userId) : null

  return (
    // suppressHydrationWarning: temaskriptet setter data-theme på <html>
    // før React hydrerer, så attributtet avviker bevisst fra serverens HTML.
    <html
      lang="nb"
      className={`${fraunces.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink font-sans antialiased">
        {/* Kjører før hydrering, så et manuelt valgt tema aldri blinker. */}
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <Providers composer={composer}>
          <AppHeader />
          {/* PC: innholdet til venstre og et sidepanel (I dag eller en profil)
              til høyre. Mobil: innholdet alene, med fanelinjen under; en
              profil legger seg over som et ark. */}
          <div className="desk:flex desk:h-[calc(100dvh-64px)]">
            <main className="min-w-0 flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] desk:overflow-y-auto desk:pb-0">
              {children}
            </main>
            <aside className="desk:w-[440px] desk:shrink-0 desk:overflow-y-auto desk:border-l desk:border-rule desk:bg-paper-raised desk:empty:hidden">
              {panel}
            </aside>
          </div>
          {userId && <BottomTabs />}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
