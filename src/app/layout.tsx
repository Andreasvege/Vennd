import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import './globals.css'
import { AppHeader } from '@/components/AppHeader'
import { SessionProvider } from '@/components/providers/SessionProvider'
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3EEE4' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1916' },
  ],
}

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: temaskriptet setter data-theme på <html>
    // før React hydrerer, så attributtet avviker bevisst fra serverens HTML.
    <html
      lang="nb"
      className={`${fraunces.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper text-ink font-sans antialiased">
        <SessionProvider>
          <div className="min-h-screen">
            <AppHeader />
            {children}
            {modal}
          </div>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
