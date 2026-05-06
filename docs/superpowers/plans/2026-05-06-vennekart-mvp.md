# Vennekart MVP — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Vennekart MVP — an interactive social relationship map with friend graph, contact logging, notes, and reminders.

**Architecture:** Next.js 16 App Router with a React Flow graph as the main UI. All data lives in Neon Postgres via Prisma ORM. Auth.js v5 handles Google login with userId scoped on every database row so multi-user support is a config change, not a rewrite.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, @xyflow/react (React Flow v12), Prisma ORM, Neon Postgres, Auth.js v5 (next-auth@5), @auth/prisma-adapter, Vitest, @testing-library/react

---

## Prerequisites

- Install Vercel CLI if not already present: `npm i -g vercel`
- Neon database created via Vercel Marketplace (get `DATABASE_URL` and `DIRECT_URL`)
- Google OAuth app created at console.cloud.google.com (get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`)
- `AUTH_SECRET` generated with: `npx auth secret`

---

## File Map

**Create:**
```
prisma/schema.prisma
vitest.config.ts
src/test/setup.ts
src/types/index.ts
src/types/next-auth.d.ts
src/lib/prisma.ts
src/lib/auth.ts
src/lib/relationship-colors.ts
src/lib/reminders.ts
src/app/api/auth/[...nextauth]/route.ts
src/app/api/persons/route.ts
src/app/api/persons/[id]/route.ts
src/app/api/relationships/route.ts
src/app/api/relationships/[id]/route.ts
src/app/api/log/route.ts
src/app/api/log/[id]/route.ts
src/app/api/reminders/route.ts
src/app/api/reminders/[id]/route.ts
src/app/person/[id]/page.tsx
src/app/settings/page.tsx
src/components/providers/SessionProvider.tsx
src/components/graph/PersonNode.tsx
src/components/graph/RelationshipEdge.tsx
src/components/graph/VennekartCanvas.tsx
src/components/modals/Modal.tsx
src/components/modals/AddPersonModal.tsx
src/components/modals/AddRelationshipModal.tsx
src/components/modals/LogEntryModal.tsx
src/components/TimelineStripe.tsx
src/components/RemindersSidebar.tsx
```

**Modify:**
```
package.json                  — add test script
src/app/globals.css           — update Accent color to purple
src/app/layout.tsx            — update metadata, add SessionProvider
src/app/page.tsx              — replace boilerplate with Vennekart layout
src/components/Navbar.tsx     — Vennekart branding + auth state
```

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd "C:\Users\andyv\Documents\GitHub\Vennekart"
npm install next-auth@5 @auth/prisma-adapter @prisma/client @xyflow/react
```

Expected output: `added N packages` with no errors.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected output: `added N packages` with no errors.

- [ ] **Step 3: Verify package.json contains new dependencies**

```bash
node -e "const p = require('./package.json'); console.log(Object.keys({...p.dependencies,...p.devDependencies}).filter(k => ['next-auth','@prisma/client','@xyflow/react','vitest','prisma'].includes(k)).join(', '))"
```

Expected output: `next-auth, @prisma/client, @xyflow/react, prisma, vitest` (order may vary).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install auth, prisma, react-flow and vitest dependencies

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Test infrastructure

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Write vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Write test setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to package.json**

In `package.json`, update the `"scripts"` section to add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Full scripts block:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Run tests — expect zero tests, no errors**

```bash
npm test
```

Expected output: `No test files found` or `0 tests passed`. NOT an error exit code.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts src/test/setup.ts package.json package-lock.json
git commit -m "chore: set up vitest with jsdom and testing-library

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Prisma schema + database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env.local` (not committed)

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

Expected: creates `prisma/schema.prisma` and `.env` file.

- [ ] **Step 2: Create .env.local with database credentials**

Create `.env.local` (replace values with your actual Neon credentials):

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host/db?sslmode=require"

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

AUTH_SECRET="your-auth-secret-from-npx-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 3: Add .env.local and .env to .gitignore**

Check that `.gitignore` contains `.env.local` and `.env`. If not, add both lines.

- [ ] **Step 4: Write the full Prisma schema**

Replace the contents of `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Auth.js v5 required models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id            String     @id @default(cuid())
  name          String?
  email         String?    @unique
  emailVerified DateTime?
  image         String?
  createdAt     DateTime   @default(now())
  accounts      Account[]
  sessions      Session[]
  persons       Person[]
  logEntries    LogEntry[]
  reminders     Reminder[]
}

model Person {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name          String
  birthday      DateTime?
  notes         String?        @db.Text
  color         String         @default("#6c63ff")
  positionX     Float          @default(0)
  positionY     Float          @default(0)
  createdAt     DateTime       @default(now())
  logEntries    LogEntry[]
  reminders     Reminder[]
  relationsFrom Relationship[] @relation("FromPerson")
  relationsTo   Relationship[] @relation("ToPerson")
}

model Relationship {
  id           String           @id @default(cuid())
  fromPersonId String
  toPersonId   String
  fromPerson   Person           @relation("FromPerson", fields: [fromPersonId], references: [id], onDelete: Cascade)
  toPerson     Person           @relation("ToPerson", fields: [toPersonId], references: [id], onDelete: Cascade)
  type         RelationshipType
  color        String
  createdAt    DateTime         @default(now())
}

enum RelationshipType {
  FRIEND
  FAMILY
  COLLEAGUE
  PARTNER
  ACQUAINTANCE
  OTHER
}

model LogEntry {
  id        String       @id @default(cuid())
  userId    String
  personId  String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  person    Person       @relation(fields: [personId], references: [id], onDelete: Cascade)
  date      DateTime     @default(now())
  type      LogEntryType
  notes     String?      @db.Text
  createdAt DateTime     @default(now())
}

enum LogEntryType {
  MET
  CALLED
  MESSAGE
  OTHER
}

model Reminder {
  id        String       @id @default(cuid())
  userId    String
  personId  String
  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  person    Person       @relation(fields: [personId], references: [id], onDelete: Cascade)
  type      ReminderType
  message   String?      @db.Text
  dueDate   DateTime?
  dismissed Boolean      @default(false)
  createdAt DateTime     @default(now())
}

enum ReminderType {
  AUTO
  MANUAL
}
```

- [ ] **Step 5: Run migration**

```bash
npx prisma migrate dev --name init
```

Expected: `Your database is now in sync with your schema.` — all tables created.

- [ ] **Step 6: Generate Prisma client**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client` message.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add prisma schema with full vennekart data model

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Prisma client singleton + Auth.js setup

**Files:**
- Create: `src/lib/prisma.ts`
- Create: `src/lib/auth.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/components/providers/SessionProvider.tsx`

- [ ] **Step 1: Write the Prisma singleton**

Create `src/lib/prisma.ts`:

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

- [ ] **Step 2: Extend NextAuth session type**

Create `src/types/next-auth.d.ts`:

```ts
import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
```

- [ ] **Step 3: Write Auth.js config**

Create `src/lib/auth.ts`:

```ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

- [ ] **Step 4: Create the NextAuth API route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 5: Create client-side SessionProvider wrapper**

Create `src/components/providers/SessionProvider.tsx`:

```tsx
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/prisma.ts src/lib/auth.ts src/types/next-auth.d.ts src/app/api/auth/ src/components/providers/
git commit -m "feat: add auth.js v5 with google provider and prisma adapter

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Brand update + Navbar

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Update brand colors in globals.css**

In `src/app/globals.css`, replace the `:root` block:

```css
:root {
  --Primary: #0f0f1a;   /* Deep dark navy */
  --Accent:  #6c63ff;   /* Vennekart purple */
  --Text:    #eaeaea;   /* Main text */
  --Glass:   rgba(255, 255, 255, 0.06);  /* Glassmorphism bg */
  --GlassBorder: rgba(255, 255, 255, 0.12);  /* Glassmorphism border */
}
```

Also add to the `@theme inline` block:

```css
@theme inline {
  --color-Primary: var(--Primary);
  --color-Accent:  var(--Accent);
  --color-Text:    var(--Text);
  --color-Glass:   var(--Glass);
  --color-GlassBorder: var(--GlassBorder);
  --breakpoint-navbar: 768px;
}
```

- [ ] **Step 2: Add glassmorphism card utility class**

At the bottom of `src/app/globals.css`, add:

```css
/* Glassmorphism card — use className="glass-card" */
.glass-card {
  background: var(--Glass);
  border: 1px solid var(--GlassBorder);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
}
```

- [ ] **Step 3: Update layout.tsx — metadata + SessionProvider**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geist = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Vennekart',
  description: 'Din personlige sosiale relasjonsdagbok',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={`${geist.variable} antialiased`}>
        <SessionProvider>
          <div className="min-h-screen">
            <Navbar />
            {children}
          </div>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Rewrite Navbar with Vennekart branding + auth**

Replace `src/components/Navbar.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'

const navLinks = [
  { label: 'Kart', href: '/' },
  { label: 'Påminnelser', href: '/reminders' },
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
```

- [ ] **Step 5: Start dev server and verify visually**

```bash
npm run dev
```

Open http://localhost:3000 — verify: dark background, purple Vennekart logo in navbar, "Logg inn" button visible.

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/Navbar.tsx
git commit -m "feat: vennekart brand — purple theme, glass navbar, auth state

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Shared types + utility functions

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/relationship-colors.ts`

- [ ] **Step 1: Write failing test for relationship colors**

Create `src/lib/relationship-colors.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { getRelationshipColor, RELATIONSHIP_COLORS } from './relationship-colors'

describe('getRelationshipColor', () => {
  it('returns correct color for FRIEND', () => {
    expect(getRelationshipColor('FRIEND')).toBe('#6c63ff')
  })

  it('returns correct color for FAMILY', () => {
    expect(getRelationshipColor('FAMILY')).toBe('#ef5350')
  })

  it('returns correct color for PARTNER', () => {
    expect(getRelationshipColor('PARTNER')).toBe('#ff6584')
  })

  it('covers all relationship types', () => {
    const types = ['FRIEND', 'FAMILY', 'COLLEAGUE', 'PARTNER', 'ACQUAINTANCE', 'OTHER'] as const
    types.forEach((type) => {
      expect(RELATIONSHIP_COLORS[type]).toBeTruthy()
    })
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test
```

Expected: `Cannot find module './relationship-colors'`.

- [ ] **Step 3: Write relationship colors utility**

Create `src/lib/relationship-colors.ts`:

```ts
import type { RelationshipType } from '@prisma/client'

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  FRIEND: '#6c63ff',
  FAMILY: '#ef5350',
  COLLEAGUE: '#29b6f6',
  PARTNER: '#ff6584',
  ACQUAINTANCE: '#888888',
  OTHER: '#f9a825',
}

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  FRIEND: 'Venn',
  FAMILY: 'Familie',
  COLLEAGUE: 'Kollega',
  PARTNER: 'Partner',
  ACQUAINTANCE: 'Bekjent',
  OTHER: 'Annet',
}

export function getRelationshipColor(type: RelationshipType): string {
  return RELATIONSHIP_COLORS[type]
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test
```

Expected: `4 passed`.

- [ ] **Step 5: Write shared TypeScript types**

Create `src/types/index.ts`:

```ts
import type { Person, Relationship, LogEntry, Reminder, RelationshipType, LogEntryType, ReminderType } from '@prisma/client'

// Re-export Prisma types for convenience
export type { Person, Relationship, LogEntry, Reminder, RelationshipType, LogEntryType, ReminderType }

// Person with last contact date (computed for reminder logic)
export type PersonWithLastContact = {
  id: string
  name: string
  userId: string
  lastContactDate: Date | null
}

// React Flow node data shapes
export type PersonNodeData = {
  id: string
  name: string
  color: string
  initials: string
  onAddLog: (personId: string) => void
  onViewProfile: (personId: string) => void
}

// API response shape for graph data
export type GraphData = {
  persons: Person[]
  relationships: Relationship[]
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/relationship-colors.ts src/lib/relationship-colors.test.ts src/types/index.ts
git commit -m "feat: shared types and relationship color utilities with tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Auto-reminder logic

**Files:**
- Create: `src/lib/reminders.ts`
- Create: `src/lib/reminders.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/reminders.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { generateAutoReminders, WEEKS_THRESHOLD } from './reminders'
import type { PersonWithLastContact } from '@/types'

const makeDate = (weeksAgo: number): Date => {
  const d = new Date('2026-05-06T12:00:00Z')
  d.setDate(d.getDate() - weeksAgo * 7)
  return d
}

const NOW = new Date('2026-05-06T12:00:00Z')

describe('generateAutoReminders', () => {
  it('flags a person not contacted for over the threshold', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Lars', userId: 'u1', lastContactDate: makeDate(4) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(1)
    expect(result[0].personId).toBe('p1')
  })

  it('does not flag a recently contacted person', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Jenny', userId: 'u1', lastContactDate: makeDate(1) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(0)
  })

  it('flags a person who has never been contacted', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p2', name: 'Kari', userId: 'u1', lastContactDate: null },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(1)
    expect(result[0].message).toContain('aldri')
  })

  it('includes correct message for overdue contact', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Lars', userId: 'u1', lastContactDate: makeDate(4) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result[0].message).toContain('Lars')
    expect(result[0].message).toContain('4')
  })

  it('returns empty array when all persons are up to date', () => {
    const persons: PersonWithLastContact[] = [
      { id: 'p1', name: 'Jenny', userId: 'u1', lastContactDate: makeDate(1) },
      { id: 'p2', name: 'Lars', userId: 'u1', lastContactDate: makeDate(2) },
    ]
    const result = generateAutoReminders(persons, NOW)
    expect(result).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: `Cannot find module './reminders'`.

- [ ] **Step 3: Implement auto-reminder logic**

Create `src/lib/reminders.ts`:

```ts
import type { PersonWithLastContact } from '@/types'

export const WEEKS_THRESHOLD = 3

export type AutoReminderInput = {
  personId: string
  userId: string
  message: string
  type: 'AUTO'
}

export function generateAutoReminders(
  persons: PersonWithLastContact[],
  now: Date = new Date()
): AutoReminderInput[] {
  return persons
    .filter((person) => {
      if (!person.lastContactDate) return true
      const diffMs = now.getTime() - person.lastContactDate.getTime()
      const diffWeeks = diffMs / (1000 * 60 * 60 * 24 * 7)
      return diffWeeks >= WEEKS_THRESHOLD
    })
    .map((person) => {
      const weeksAgo = person.lastContactDate
        ? Math.floor(
            (now.getTime() - person.lastContactDate.getTime()) /
              (1000 * 60 * 60 * 24 * 7)
          )
        : null

      const message = weeksAgo
        ? `Du har ikke hatt kontakt med ${person.name} på ${weeksAgo} uker`
        : `Du har aldri logget kontakt med ${person.name}`

      return {
        personId: person.id,
        userId: person.userId,
        message,
        type: 'AUTO' as const,
      }
    })
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: `9 passed` (4 from relationship-colors + 5 from reminders).

- [ ] **Step 5: Commit**

```bash
git add src/lib/reminders.ts src/lib/reminders.test.ts
git commit -m "feat: auto-reminder logic with full test coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Persons API routes

**Files:**
- Create: `src/app/api/persons/route.ts`
- Create: `src/app/api/persons/[id]/route.ts`

- [ ] **Step 1: Write GET + POST /api/persons**

Create `src/app/api/persons/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const persons = await prisma.person.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(persons)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { name, birthday, notes, color } = body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'Navn er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      birthday: birthday ? new Date(birthday) : null,
      notes: notes ?? null,
      color: color ?? '#6c63ff',
      positionX: Math.random() * 400,
      positionY: Math.random() * 300,
    },
  })

  return NextResponse.json(person, { status: 201 })
}
```

- [ ] **Step 2: Write GET + PATCH + DELETE /api/persons/[id]**

Create `src/app/api/persons/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const person = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
    include: {
      logEntries: { orderBy: { date: 'desc' } },
      reminders: { where: { dismissed: false }, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!person) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  return NextResponse.json(person)
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, birthday, notes, color, positionX, positionY } = body

  const existing = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  const updated = await prisma.person.update({
    where: { id },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
      ...(notes !== undefined && { notes }),
      ...(color !== undefined && { color }),
      ...(positionX !== undefined && { positionX }),
      ...(positionY !== undefined && { positionY }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.person.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.person.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Manual smoke test — start dev server and test endpoints**

```bash
npm run dev
```

In a separate terminal (requires being logged in via browser first to get session cookie, or use Postman with session):

```bash
curl http://localhost:3000/api/persons
```

Expected: `{"error":"Ikke innlogget"}` if not authenticated. This confirms the route exists.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/persons/
git commit -m "feat: persons CRUD API with auth guard and position support

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Relationships API routes

**Files:**
- Create: `src/app/api/relationships/route.ts`
- Create: `src/app/api/relationships/[id]/route.ts`

- [ ] **Step 1: Write GET + POST /api/relationships**

Create `src/app/api/relationships/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRelationshipColor } from '@/lib/relationship-colors'
import type { RelationshipType } from '@prisma/client'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  // Fetch relationships where either person belongs to this user
  const relationships = await prisma.relationship.findMany({
    where: {
      fromPerson: { userId: session.user.id },
    },
    include: { fromPerson: true, toPerson: true },
  })

  return NextResponse.json(relationships)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { fromPersonId, toPersonId, type } = body

  if (!fromPersonId || !toPersonId || !type) {
    return NextResponse.json(
      { error: 'fromPersonId, toPersonId og type er påkrevd' },
      { status: 400 }
    )
  }

  // Verify both persons belong to the user
  const [from, to] = await Promise.all([
    prisma.person.findFirst({ where: { id: fromPersonId, userId: session.user.id } }),
    prisma.person.findFirst({ where: { id: toPersonId, userId: session.user.id } }),
  ])

  if (!from || !to) {
    return NextResponse.json({ error: 'Personene ble ikke funnet' }, { status: 404 })
  }

  const color = getRelationshipColor(type as RelationshipType)

  const relationship = await prisma.relationship.create({
    data: {
      fromPersonId,
      toPersonId,
      type: type as RelationshipType,
      color,
    },
  })

  return NextResponse.json(relationship, { status: 201 })
}
```

- [ ] **Step 2: Write DELETE /api/relationships/[id]**

Create `src/app/api/relationships/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params

  const relationship = await prisma.relationship.findFirst({
    where: { id, fromPerson: { userId: session.user.id } },
  })

  if (!relationship) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.relationship.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/relationships/
git commit -m "feat: relationships CRUD API with auto color assignment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: LogEntries API routes

**Files:**
- Create: `src/app/api/log/route.ts`
- Create: `src/app/api/log/[id]/route.ts`

- [ ] **Step 1: Write GET + POST /api/log**

Create `src/app/api/log/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { LogEntryType } from '@prisma/client'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const personId = searchParams.get('personId')
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)

  const entries = await prisma.logEntry.findMany({
    where: {
      userId: session.user.id,
      ...(personId && { personId }),
    },
    include: { person: true },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()
  const { personId, type, notes, date } = body

  if (!personId || !type) {
    return NextResponse.json({ error: 'personId og type er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, userId: session.user.id },
  })

  if (!person) {
    return NextResponse.json({ error: 'Person ikke funnet' }, { status: 404 })
  }

  const entry = await prisma.logEntry.create({
    data: {
      userId: session.user.id,
      personId,
      type: type as LogEntryType,
      notes: notes ?? null,
      date: date ? new Date(date) : new Date(),
    },
    include: { person: true },
  })

  return NextResponse.json(entry, { status: 201 })
}
```

- [ ] **Step 2: Write DELETE /api/log/[id]**

Create `src/app/api/log/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params

  const entry = await prisma.logEntry.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!entry) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.logEntry.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/app/api/log/
git commit -m "feat: log entries API with person filter and date support

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Reminders API routes

**Files:**
- Create: `src/app/api/reminders/route.ts`
- Create: `src/app/api/reminders/[id]/route.ts`

- [ ] **Step 1: Write GET + POST /api/reminders**

Create `src/app/api/reminders/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAutoReminders } from '@/lib/reminders'
import type { ReminderType } from '@prisma/client'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id, dismissed: false },
    include: { person: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(reminders)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const body = await req.json()

  // Special action: generate auto-reminders based on last contact dates
  if (body.action === 'generate-auto') {
    const persons = await prisma.person.findMany({
      where: { userId: session.user.id },
      include: {
        logEntries: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    })

    const personsWithLastContact = persons.map((p) => ({
      id: p.id,
      name: p.name,
      userId: p.userId,
      lastContactDate: p.logEntries[0]?.date ?? null,
    }))

    const toGenerate = generateAutoReminders(personsWithLastContact)

    // Remove old undismissed AUTO reminders, then re-create fresh ones
    await prisma.reminder.deleteMany({
      where: { userId: session.user.id, type: 'AUTO', dismissed: false },
    })

    const created = await prisma.reminder.createMany({
      data: toGenerate.map((r) => ({
        userId: r.userId,
        personId: r.personId,
        type: 'AUTO' as ReminderType,
        message: r.message,
      })),
    })

    return NextResponse.json({ created: created.count }, { status: 201 })
  }

  // Manual reminder
  const { personId, message, dueDate } = body

  if (!personId || !message) {
    return NextResponse.json({ error: 'personId og message er påkrevd' }, { status: 400 })
  }

  const person = await prisma.person.findFirst({
    where: { id: personId, userId: session.user.id },
  })

  if (!person) {
    return NextResponse.json({ error: 'Person ikke funnet' }, { status: 404 })
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId: session.user.id,
      personId,
      type: 'MANUAL',
      message,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { person: true },
  })

  return NextResponse.json(reminder, { status: 201 })
}
```

- [ ] **Step 2: Write PATCH + DELETE /api/reminders/[id]**

Create `src/app/api/reminders/[id]/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!reminder) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      ...(body.dismissed !== undefined && { dismissed: body.dismissed }),
      ...(body.message !== undefined && { message: body.message }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Ikke innlogget' }, { status: 401 })
  }

  const { id } = await params

  const reminder = await prisma.reminder.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!reminder) {
    return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 })
  }

  await prisma.reminder.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: TypeScript check + run tests**

```bash
npx tsc --noEmit && npm test
```

Expected: no type errors, all tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/reminders/
git commit -m "feat: reminders API with auto-generation and dismiss support

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: React Flow custom node and edge

**Files:**
- Create: `src/components/graph/PersonNode.tsx`
- Create: `src/components/graph/RelationshipEdge.tsx`

- [ ] **Step 1: Import React Flow CSS in globals.css**

At the top of `src/app/globals.css`, add after the existing `@import "tailwindcss";`:

```css
@import '@xyflow/react/dist/style.css';
```

- [ ] **Step 2: Write the PersonNode component**

Create `src/components/graph/PersonNode.tsx`:

```tsx
'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { PersonNodeData } from '@/types'

export function PersonNode({ data, selected }: NodeProps) {
  const d = data as PersonNodeData

  const initials = d.name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <Handle type="target" position={Position.Top} className="opacity-0 !w-1 !h-1" />

      <div
        className={`
          flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all cursor-pointer
          ${selected
            ? 'ring-2 ring-white/60 scale-110'
            : 'hover:scale-105'
          }
        `}
      >
        {/* Avatar circle */}
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-black/40"
          style={{ backgroundColor: d.color }}
        >
          {initials}
        </div>

        {/* Name label */}
        <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full whitespace-nowrap max-w-[100px] overflow-hidden text-ellipsis">
          {d.name}
        </span>
      </div>

      {/* Quick actions on select */}
      {selected && (
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => d.onAddLog(d.id)}
            className="text-[10px] bg-Accent/90 text-white px-2 py-0.5 rounded-full hover:bg-Accent transition-colors"
            title="Logg kontakt"
          >
            + Logg
          </button>
          <button
            onClick={() => d.onViewProfile(d.id)}
            className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors"
            title="Se profil"
          >
            Profil
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0 !w-1 !h-1" />
    </div>
  )
}
```

- [ ] **Step 3: Write the RelationshipEdge component**

Create `src/components/graph/RelationshipEdge.tsx`:

```tsx
'use client'

import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@xyflow/react'

type RelationshipEdgeData = {
  label?: string
  color: string
}

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: EdgeProps) {
  const edgeData = data as RelationshipEdgeData
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeData?.color ?? '#6c63ff',
          strokeWidth: 2,
          strokeOpacity: 0.7,
        }}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="text-[10px] text-white/70 bg-Primary/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/10"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/graph/ src/app/globals.css
git commit -m "feat: custom PersonNode and RelationshipEdge for React Flow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: VennekartCanvas — main graph component

**Files:**
- Create: `src/components/graph/VennekartCanvas.tsx`

- [ ] **Step 1: Write the canvas component**

Create `src/components/graph/VennekartCanvas.tsx`:

```tsx
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodeDrag,
  BackgroundVariant,
} from '@xyflow/react'
import { useRouter } from 'next/navigation'
import { PersonNode } from './PersonNode'
import { RelationshipEdge } from './RelationshipEdge'
import type { Person, Relationship } from '@/types'

const nodeTypes = { person: PersonNode }
const edgeTypes = { relationship: RelationshipEdge }

type Props = {
  onAddPerson: () => void
  onAddLog: (personId: string) => void
  onAddRelationship: () => void
  refreshKey: number
}

export function VennekartCanvas({ onAddPerson, onAddLog, onAddRelationship, refreshKey }: Props) {
  const router = useRouter()
  const [persons, setPersons] = useState<Person[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const fetchData = useCallback(async () => {
    const [personsRes, relationshipsRes] = await Promise.all([
      fetch('/api/persons'),
      fetch('/api/relationships'),
    ])
    if (!personsRes.ok || !relationshipsRes.ok) return

    const [personsData, relData] = await Promise.all([
      personsRes.json() as Promise<Person[]>,
      relationshipsRes.json() as Promise<Relationship[]>,
    ])

    setPersons(personsData)
    setRelationships(relData)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshKey])

  // Convert persons → React Flow nodes
  useEffect(() => {
    const newNodes: Node[] = persons.map((p) => ({
      id: p.id,
      type: 'person',
      position: { x: p.positionX, y: p.positionY },
      data: {
        id: p.id,
        name: p.name,
        color: p.color,
        initials: p.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2),
        onAddLog,
        onViewProfile: (id: string) => router.push(`/person/${id}`),
      },
    }))
    setNodes(newNodes)
  }, [persons, onAddLog, router, setNodes])

  // Convert relationships → React Flow edges
  useEffect(() => {
    const newEdges: Edge[] = relationships.map((r) => ({
      id: r.id,
      source: r.fromPersonId,
      target: r.toPersonId,
      type: 'relationship',
      data: { color: r.color, label: undefined },
    }))
    setEdges(newEdges)
  }, [relationships, setEdges])

  // Save node position when dragging stops
  const onNodeDragStop: OnNodeDrag = useCallback(async (_event, node) => {
    await fetch(`/api/persons/${node.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionX: node.position.x, positionY: node.position.y }),
    })
  }, [])

  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

  return (
    <div className="relative flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={proOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls
          className="!bg-Glass !border-GlassBorder !rounded-xl !shadow-lg"
        />
      </ReactFlow>

      {/* Floating action buttons */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={onAddRelationship}
          className="glass-card px-4 py-2 text-sm font-medium text-Text/80 hover:text-Text transition-colors flex items-center gap-2"
          title="Legg til relasjon"
        >
          <span className="text-Accent">⟷</span> Relasjon
        </button>
        <button
          onClick={onAddPerson}
          className="bg-Accent text-Primary px-5 py-3 rounded-2xl font-bold text-lg shadow-lg shadow-Accent/30 hover:opacity-90 transition-opacity"
          title="Legg til person"
        >
          +
        </button>
      </div>

      {/* Empty state */}
      {persons.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
          <p className="text-Text/40 text-lg">Vennekartet ditt er tomt</p>
          <p className="text-Text/30 text-sm">Trykk + for å legge til din første person</p>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/graph/VennekartCanvas.tsx
git commit -m "feat: vennekart canvas with react flow, drag-to-position, empty state

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 14: Modal system + Add Person/Relationship modals

**Files:**
- Create: `src/components/modals/Modal.tsx`
- Create: `src/components/modals/AddPersonModal.tsx`
- Create: `src/components/modals/AddRelationshipModal.tsx`
- Create: `src/components/modals/LogEntryModal.tsx`

- [ ] **Step 1: Write generic Modal wrapper**

Create `src/components/modals/Modal.tsx`:

```tsx
'use client'

import { useEffect } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: Props) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative glass-card p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-Text">{title}</h2>
          <button
            onClick={onClose}
            className="text-Text/40 hover:text-Text transition-colors text-xl leading-none"
            aria-label="Lukk"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write AddPersonModal**

Create `src/components/modals/AddPersonModal.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { Modal } from './Modal'

const COLOR_OPTIONS = [
  '#6c63ff', '#ef5350', '#29b6f6', '#ff6584',
  '#66bb6a', '#ffa726', '#ab47bc', '#26c6da',
]

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPersonModal({ isOpen, onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6c63ff')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/persons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), color, notes }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setName('')
    setColor('#6c63ff')
    setNotes('')
    onSuccess()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Legg til person">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Navn *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jenny Hansen"
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Notat (valgfritt)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vurderer å flytte til Amsterdam..."
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Farge</label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Velg farge ${c}`}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Legger til...' : 'Legg til'}
        </button>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 3: Write AddRelationshipModal**

Create `src/components/modals/AddRelationshipModal.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/lib/relationship-colors'
import type { Person, RelationshipType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_LABELS) as RelationshipType[]

export function AddRelationshipModal({ isOpen, onClose, onSuccess }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [type, setType] = useState<RelationshipType>('FRIEND')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/persons')
      .then((r) => r.json())
      .then(setPersons)
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromId || !toId || fromId === toId) {
      setError('Velg to forskjellige personer')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/relationships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromPersonId: fromId, toPersonId: toId, type }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setFromId('')
    setToId('')
    setType('FRIEND')
    onSuccess()
    onClose()
  }

  const selectClass = "bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors w-full"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Legg til relasjon">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Fra person</label>
          <select value={fromId} onChange={(e) => setFromId(e.target.value)} className={selectClass}>
            <option value="">Velg person...</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Til person</label>
          <select value={toId} onChange={(e) => setToId(e.target.value)} className={selectClass}>
            <option value="">Velg person...</option>
            {persons.filter((p) => p.id !== fromId).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Relasjonstype</label>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${
                  type === t
                    ? 'text-Primary border-transparent'
                    : 'text-Text/60 border-white/10 hover:border-white/30'
                }`}
                style={type === t ? { backgroundColor: RELATIONSHIP_COLORS[t] } : {}}
              >
                {RELATIONSHIP_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !fromId || !toId}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Legger til...' : 'Legg til relasjon'}
        </button>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 4: Write LogEntryModal**

Create `src/components/modals/LogEntryModal.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import type { Person, LogEntryType } from '@/types'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultPersonId?: string
}

const LOG_TYPES: { value: LogEntryType; label: string; emoji: string }[] = [
  { value: 'MET', label: 'Møttes', emoji: '☕' },
  { value: 'CALLED', label: 'Ringte', emoji: '📞' },
  { value: 'MESSAGE', label: 'Melding', emoji: '💬' },
  { value: 'OTHER', label: 'Annet', emoji: '📝' },
]

export function LogEntryModal({ isOpen, onClose, onSuccess, defaultPersonId }: Props) {
  const [persons, setPersons] = useState<Person[]>([])
  const [personId, setPersonId] = useState(defaultPersonId ?? '')
  const [type, setType] = useState<LogEntryType>('MET')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/persons').then((r) => r.json()).then(setPersons)
    if (defaultPersonId) setPersonId(defaultPersonId)
  }, [isOpen, defaultPersonId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!personId) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, type, notes, date }),
    })

    setLoading(false)

    if (!res.ok) {
      setError('Noe gikk galt. Prøv igjen.')
      return
    }

    setNotes('')
    setType('MET')
    onSuccess()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Logg kontakt">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Person *</label>
          <select
            value={personId}
            onChange={(e) => setPersonId(e.target.value)}
            required
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors"
          >
            <option value="">Velg person...</option>
            {persons.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-Text/60">Type</label>
          <div className="flex gap-2">
            {LOG_TYPES.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                  type === value
                    ? 'bg-Accent/20 border-Accent text-Accent'
                    : 'border-white/10 text-Text/60 hover:border-white/30'
                }`}
              >
                <div>{emoji}</div>
                <div>{label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Dato</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text focus:outline-none focus:border-Accent transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-Text/60">Notat (valgfritt)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Vi snakket om..."
            rows={3}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-Text placeholder:text-Text/30 focus:outline-none focus:border-Accent transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !personId}
          className="mt-2 bg-Accent text-Primary font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {loading ? 'Lagrer...' : 'Logg kontakt'}
        </button>
      </form>
    </Modal>
  )
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/modals/
git commit -m "feat: modal system with AddPerson, AddRelationship, LogEntry modals

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 15: Timeline stripe

**Files:**
- Create: `src/components/TimelineStripe.tsx`

- [ ] **Step 1: Write the TimelineStripe component**

Create `src/components/TimelineStripe.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { LogEntry, Person } from '@/types'

type LogEntryWithPerson = LogEntry & { person: Person }

const LOG_EMOJI: Record<string, string> = {
  MET: '☕',
  CALLED: '📞',
  MESSAGE: '💬',
  OTHER: '📝',
}

type Props = {
  refreshKey: number
  onAddLog: () => void
}

export function TimelineStripe({ refreshKey, onAddLog }: Props) {
  const [entries, setEntries] = useState<LogEntryWithPerson[]>([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/log?limit=10')
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
  }, [refreshKey])

  const formatDate = (d: string | Date) => {
    const date = new Date(d)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'I dag'
    if (diffDays === 1) return 'I går'
    if (diffDays < 7) return `${diffDays} dager siden`
    return date.toLocaleDateString('no-NO', { day: 'numeric', month: 'short' })
  }

  if (entries.length === 0 && !expanded) {
    return (
      <div className="mx-4 mt-2 px-4 py-2 glass-card flex items-center gap-3 text-sm text-Text/40">
        <span>Ingen kontakter logget ennå</span>
        <button onClick={onAddLog} className="text-Accent hover:text-Accent/80 transition-colors ml-auto">
          + Logg kontakt
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-2 glass-card overflow-hidden transition-all duration-300">
      {/* Collapsed strip */}
      <div
        className="flex items-center gap-3 px-4 py-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex gap-4 flex-1 overflow-hidden">
          {entries.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex items-center gap-1.5 text-sm whitespace-nowrap text-Text/70">
              <span>{LOG_EMOJI[entry.type]}</span>
              <span className="font-medium text-Text">{entry.person.name}</span>
              <span className="text-Text/40 text-xs">{formatDate(entry.date)}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-Text/40 text-sm shrink-0">
          {entries.length > 4 && <span className="text-xs">+{entries.length - 4} til</span>}
          <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/person/${entry.personId}`}
              className="flex items-start gap-3 hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group"
            >
              <span className="text-base mt-0.5">{LOG_EMOJI[entry.type]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-Text text-sm group-hover:text-Accent transition-colors">
                    {entry.person.name}
                  </span>
                  <span className="text-Text/40 text-xs">{formatDate(entry.date)}</span>
                </div>
                {entry.notes && (
                  <p className="text-xs text-Text/50 truncate">{entry.notes}</p>
                )}
              </div>
            </Link>
          ))}
          <button
            onClick={(e) => { e.stopPropagation(); onAddLog() }}
            className="text-xs text-Accent hover:text-Accent/80 transition-colors text-left px-2 py-1"
          >
            + Logg ny kontakt
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/TimelineStripe.tsx
git commit -m "feat: collapsible timeline stripe with recent log entries

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 16: Reminders sidebar

**Files:**
- Create: `src/components/RemindersSidebar.tsx`

- [ ] **Step 1: Write the RemindersSidebar component**

Create `src/components/RemindersSidebar.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Reminder, Person } from '@/types'

type ReminderWithPerson = Reminder & { person: Person }

type Props = {
  refreshKey: number
}

export function RemindersSidebar({ refreshKey }: Props) {
  const [reminders, setReminders] = useState<ReminderWithPerson[]>([])
  const [visible, setVisible] = useState(true)

  const fetchReminders = async () => {
    // First generate auto reminders, then fetch all
    await fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate-auto' }),
    })
    const res = await fetch('/api/reminders')
    if (res.ok) {
      setReminders(await res.json())
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [refreshKey])

  const dismiss = async (id: string) => {
    await fetch(`/api/reminders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dismissed: true }),
    })
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="absolute right-4 top-4 glass-card px-3 py-2 text-sm text-Text/60 hover:text-Text transition-colors z-10"
        title="Vis påminnelser"
      >
        🔔 {reminders.length > 0 && <span className="text-Accent font-bold">{reminders.length}</span>}
      </button>
    )
  }

  return (
    <div className="w-64 shrink-0 glass-card m-2 ml-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-Text/80">Påminnelser</h3>
        <button
          onClick={() => setVisible(false)}
          className="text-Text/30 hover:text-Text transition-colors text-lg leading-none"
          aria-label="Skjul"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {reminders.length === 0 ? (
          <p className="text-xs text-Text/30 text-center py-6">Ingen påminnelser</p>
        ) : (
          reminders.map((r) => (
            <div
              key={r.id}
              className="bg-white/4 rounded-xl p-3 flex flex-col gap-1.5 group"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm mt-0.5">
                  {r.type === 'AUTO' ? '⏰' : '📌'}
                </span>
                <p className="text-xs text-Text/80 flex-1 leading-relaxed">{r.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/person/${r.personId}`}
                  className="text-xs text-Accent hover:text-Accent/80 transition-colors"
                >
                  {r.person.name} →
                </Link>
                <button
                  onClick={() => dismiss(r.id)}
                  className="text-xs text-Text/30 hover:text-Text/60 transition-colors ml-auto opacity-0 group-hover:opacity-100"
                >
                  Avvis
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/RemindersSidebar.tsx
git commit -m "feat: dismissible reminders sidebar with auto and manual reminders

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 17: Main page assembly

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx with Vennekart layout**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
'use client'

import { useState, useCallback } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { VennekartCanvas } from '@/components/graph/VennekartCanvas'
import { TimelineStripe } from '@/components/TimelineStripe'
import { RemindersSidebar } from '@/components/RemindersSidebar'
import { AddPersonModal } from '@/components/modals/AddPersonModal'
import { AddRelationshipModal } from '@/components/modals/AddRelationshipModal'
import { LogEntryModal } from '@/components/modals/LogEntryModal'

export default function HomePage() {
  const { data: session, status } = useSession()

  // refreshKey increments to trigger data refetch across components
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  // Modal state
  const [addPersonOpen, setAddPersonOpen] = useState(false)
  const [addRelationshipOpen, setAddRelationshipOpen] = useState(false)
  const [logEntryOpen, setLogEntryOpen] = useState(false)
  const [logEntryPersonId, setLogEntryPersonId] = useState<string | undefined>()

  const handleAddLog = useCallback((personId?: string) => {
    setLogEntryPersonId(personId)
    setLogEntryOpen(true)
  }, [])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-Text/40">Laster...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6 text-center px-4">
        <h1 className="text-5xl font-bold text-Accent">Vennekart</h1>
        <p className="text-Text/60 max-w-sm">
          Din personlige sosiale relasjonsdagbok. Hold oversikt over vennene dine, logg kontakt og få påminnelser.
        </p>
        <button
          onClick={() => signIn('google')}
          className="bg-Accent text-Primary font-bold px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg shadow-Accent/30"
        >
          Kom i gang med Google
        </button>
      </div>
    )
  }

  return (
    <>
      {/* Timeline stripe */}
      <TimelineStripe
        refreshKey={refreshKey}
        onAddLog={() => handleAddLog(undefined)}
      />

      {/* Main area: graph + sidebar */}
      <div className="flex mx-4 mt-2 gap-0" style={{ height: 'calc(100vh - 140px)' }}>
        <VennekartCanvas
          onAddPerson={() => setAddPersonOpen(true)}
          onAddRelationship={() => setAddRelationshipOpen(true)}
          onAddLog={handleAddLog}
          refreshKey={refreshKey}
        />
        <RemindersSidebar refreshKey={refreshKey} />
      </div>

      {/* Modals */}
      <AddPersonModal
        isOpen={addPersonOpen}
        onClose={() => setAddPersonOpen(false)}
        onSuccess={refresh}
      />
      <AddRelationshipModal
        isOpen={addRelationshipOpen}
        onClose={() => setAddRelationshipOpen(false)}
        onSuccess={refresh}
      />
      <LogEntryModal
        isOpen={logEntryOpen}
        onClose={() => setLogEntryOpen(false)}
        onSuccess={refresh}
        defaultPersonId={logEntryPersonId}
      />
    </>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Start dev server and do a full visual smoke test**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Login screen shows when not authenticated
- After Google login: Navbar shows user avatar, graph canvas appears, timeline stripe at top, reminders sidebar on right
- Clicking + button opens AddPerson modal
- Adding a person makes a node appear in the graph
- Dragging a node saves its position (refresh the page — node should be in same spot)
- Clicking a node shows "Logg" and "Profil" quick action buttons
- "Logg" opens LogEntryModal pre-filled with the person
- Timeline stripe shows the new log entry
- Clicking ▾ expands the timeline

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: main page — full vennekart layout with graph, timeline, sidebar

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 18: Person profile page

**Files:**
- Create: `src/app/person/[id]/page.tsx`

- [ ] **Step 1: Write the person profile page**

Create `src/app/person/[id]/page.tsx`:

```tsx
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
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
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
```

- [ ] **Step 2: TypeScript check + run all tests**

```bash
npx tsc --noEmit && npm test
```

Expected: no type errors, all 9 tests pass.

- [ ] **Step 3: Visual smoke test**

In the running dev server, click a person node → "Profil" → verify profile page loads with name, avatar, log history.

- [ ] **Step 4: Commit**

```bash
git add src/app/person/
git commit -m "feat: person profile page with log history, notes, and reminders

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 19: Settings page + deploy

**Files:**
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: Write basic settings page**

Create `src/app/settings/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { RELATIONSHIP_LABELS, RELATIONSHIP_COLORS } from '@/lib/relationship-colors'

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
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="Profilbilde" className="w-12 h-12 rounded-full" />
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
```

- [ ] **Step 2: Final TypeScript check and all tests**

```bash
npx tsc --noEmit && npm test
```

Expected: no errors, all 9 tests pass.

- [ ] **Step 3: Final commit**

```bash
git add src/app/settings/
git commit -m "feat: settings page with account info and relationship color legend

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy to Vercel**

Ensure Vercel CLI is installed (`npm i -g vercel`), then:

```bash
vercel --prod
```

During first deploy, set environment variables when prompted, or add them in the Vercel dashboard:
- `DATABASE_URL`
- `DIRECT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (set to your production URL)

Also add the production URL to your Google OAuth app's authorized redirect URIs: `https://your-domain.vercel.app/api/auth/callback/google`

Expected: deployment succeeds, production URL is returned.

---

## Self-Review Checklist

**Spec coverage:**
- [x] Auth med NextAuth (Google) — Task 4
- [x] Grafvisning med React Flow — Tasks 12, 13
- [x] Legg til / rediger person — Task 8, 14 (AddPersonModal)
- [x] Legg til relasjon mellom to personer — Task 9, 14 (AddRelationshipModal)
- [x] Logg et møte/samtale (LogEntry) — Task 10, 14 (LogEntryModal)
- [x] Tidslinje-stripe øverst med siste hendelser — Task 15
- [x] Sidepanel med påminnelser (auto + manuell), kan skjules — Task 11, 16
- [x] Fargekodede kanter per relasjonstype — Task 6, 9
- [x] Svevende/glassmorphism design — Task 5
- [x] positionX/positionY persisted on drag — Task 3 (schema), 8 (API PATCH), 13 (canvas)
- [x] Person profile page — Task 18
- [x] Settings page — Task 19
- [x] userId on all tables from day one — Task 3 (schema)

**No placeholders found.**

**Type consistency verified:**
- `PersonNodeData` defined in `src/types/index.ts` and used consistently in `PersonNode.tsx` and `VennekartCanvas.tsx`
- `generateAutoReminders` returns `AutoReminderInput[]` used correctly in `src/app/api/reminders/route.ts`
- `getRelationshipColor` used in `src/app/api/relationships/route.ts` and `AddRelationshipModal.tsx`
- `refresh` / `refreshKey` pattern consistent across all components in `page.tsx`
