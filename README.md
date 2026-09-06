# Vennekart

App for å visualisere vennekretsen din og hjelpe deg med å strukturere sosiallivet ditt.

Interaktivt relasjonskart (React Flow) med personer, relasjoner, kontaktlogg,
tidslinje og påminnelser. Alt er scoped på `userId` fra dag én.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
@xyflow/react · Prisma 7 + Neon Postgres · Auth.js v5 (Google) · Vitest

## Kom i gang

```bash
npm install
cp .env.example .env.local   # fyll inn Neon- og Google-OAuth-verdier
npx prisma migrate deploy    # kjør migrasjoner mot databasen
npm run dev
```

## Kommandoer

| Kommando | Hva den gjør |
| --- | --- |
| `npm run dev` | Dev-server på http://localhost:3000 |
| `npm run build` | `prisma generate` + produksjonsbygg |
| `npm run lint` | ESLint |
| `npm test` | Vitest (én gjennomkjøring) |
| `npm run test:watch` | Vitest i watch-modus |

## Struktur

```
src/app/api/       REST-endepunkter (persons, relationships, log, reminders)
src/components/    graph/ (React Flow), modals/, Navbar, TimelineStripe, RemindersSidebar
src/lib/           prisma, auth, relationship-colors, reminders
prisma/            schema + migrasjoner
docs/superpowers/  spec og MVP-plan
```
