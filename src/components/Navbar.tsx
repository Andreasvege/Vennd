'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

const navLinks = [
  { label: 'Kart', href: '/' },
  { label: 'Innstillinger', href: '/settings' },
]

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="p-3 mx-4 mt-4 glass-card text-Text z-40 relative">
      <div className="flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-Accent tracking-tight hover:opacity-80 transition-opacity">
          Vennekart
        </Link>

        {/* Desktop links */}
        <ul className="hidden navbar:flex gap-8 text-sm items-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-Text/70 hover:text-Text transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth + avatar */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'Bruker'}
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-Accent/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-Accent/30 flex items-center justify-center text-sm font-bold text-Accent">
                  {session.user.name?.[0] ?? '?'}
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="hidden navbar:block text-xs text-Text/50 hover:text-Text transition-colors"
              >
                Logg ut
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="text-sm font-semibold bg-Accent text-Primary px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
            >
              Logg inn
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(true)}
            className="navbar:hidden text-Accent text-2xl"
            aria-label="Meny"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile fullscreen menu */}
      <div
        className={`fixed inset-0 bg-Primary z-50 flex flex-col items-center justify-center gap-8 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 left-8 text-Accent text-4xl"
          aria-label="Lukk meny"
        >
          ✕
        </button>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-3xl font-bold text-Text hover:text-Accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {session ? (
          <button
            onClick={() => { signOut(); setIsOpen(false) }}
            className="text-Text/60 text-lg"
          >
            Logg ut
          </button>
        ) : (
          <button
            onClick={() => { signIn('google'); setIsOpen(false) }}
            className="font-bold bg-Accent text-Primary px-6 py-3 rounded-xl text-lg"
          >
            Logg inn med Google
          </button>
        )}
      </div>
    </nav>
  )
}
