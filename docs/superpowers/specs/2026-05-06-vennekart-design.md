# Vennekart — Design Spec

**Dato:** 2026-05-06
**Status:** Godkjent

---

## Konsept

Vennekart er en personlig sosial relasjonsdagbok — en webapp der du kan kartlegge vennekretsen din, logge når du treffer eller ringer folk, notere ting du vil huske om dem, og få påminnelser om å holde kontakten.

Hjertet i appen er en interaktiv grafvisning ("Vennekartet") der du og vennene dine vises som noder, og relasjonene mellom dere som fargekodede kanter.

---

## Arkitektur

| Lag | Valg |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Grafvisning | React Flow |
| Database | Neon Postgres (Vercel Marketplace) + Prisma ORM |
| Auth | NextAuth.js (Google-innlogging, e-post som alternativ) |
| Deploy | Vercel |
| Cron/påminnelser | Vercel Cron Jobs (fase 2 — ikke i MVP) |
| Analytics | Vercel Analytics + Speed Insights (allerede i boilerplate) |

### Nøkkelprinsipper
- Alle tabeller har `userId` fra dag én — flerbrukerstøtte er en config-endring, ikke en omskriving
- Enkeltbruker i MVP, men auth er satt opp fra start
- Bygger videre på eksisterende Next.js/Tailwind-boilerplate fra Novafest-prosjektet

---

## Datamodell (Prisma)

```prisma
model User {
  id          String       @id @default(cuid())
  email       String       @unique
  name        String?
  image       String?
  createdAt   DateTime     @default(now())
  persons     Person[]
  logEntries  LogEntry[]
  reminders   Reminder[]
}

model Person {
  id            String         @id @default(cuid())
  userId        String
  user          User           @relation(fields: [userId], references: [id])
  name          String
  birthday      DateTime?
  notes         String?
  color         String         @default("#6c63ff")
  createdAt     DateTime       @default(now())
  logEntries    LogEntry[]
  reminders     Reminder[]
  relationsFrom Relationship[] @relation("FromPerson")
  relationsTo   Relationship[] @relation("ToPerson")
}

model Relationship {
  id           String   @id @default(cuid())
  fromPersonId String
  toPersonId   String
  fromPerson   Person   @relation("FromPerson", fields: [fromPersonId], references: [id])
  toPerson     Person   @relation("ToPerson", fields: [toPersonId], references: [id])
  type         RelationshipType
  color        String
  createdAt    DateTime @default(now())
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
  id        String        @id @default(cuid())
  userId    String
  personId  String
  user      User          @relation(fields: [userId], references: [id])
  person    Person        @relation(fields: [personId], references: [id])
  date      DateTime
  type      LogEntryType
  notes     String?
  createdAt DateTime      @default(now())
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
  user      User         @relation(fields: [userId], references: [id])
  person    Person       @relation(fields: [personId], references: [id])
  type      ReminderType
  message   String?
  dueDate   DateTime?
  dismissed Boolean      @default(false)
  createdAt DateTime     @default(now())
}

enum ReminderType {
  AUTO
  MANUAL
}
```

---

## Sider & ruting

```
/                   Vennekartet — grafvisning (hovedside)
/person/[id]        Profilside for én person (logg, notater, påminnelser)
/log/new            Logg et møte eller samtale
/reminders          Alle påminnelser samlet
/settings           Brukerinnstillinger, relasjonskategorier
/auth/...           NextAuth (login/logout)
```

---

## UI-layout

```
┌─────────────────────────────────────────────────────┐
│ Navbar: Logo | navigasjon | bruker-avatar           │
├─────────────────────────────────────────────────────┤
│ Tidslinje-stripe (kollapset, klikk for å utvide)    │
│  ● Jenny – kaffe  |  ● Lars – ringte  |  ▼ vis mer  │
├──────────────────────────────┬──────────────────────┤
│                              │  Påminnelser         │
│   Vennekart (React Flow)     │  ─────────────────   │
│                              │  ⚠ Ring Lars (3 uker)│
│   [noder og kanter]          │  ⚠ Se Kari (6 uker)  │
│                              │  📌 Spør Jenny om    │
│                  [+]         │     Amsterdam        │
│                              │                  [×] │
└──────────────────────────────┴──────────────────────┘
```

**Designspråk:** Svevende, avrundet stil. Mørk bakgrunn (eksisterende `--Primary`), glassmorphism-aktige cards, myke skygger, noder med personlig farge. Holde det minimalistisk

### Kant-farger i grafen (RelationshipType)
| Type | Farge |
|---|---|
| FRIEND | Lilla (#6c63ff) |
| FAMILY | Rød (#ef5350) |
| COLLEAGUE | Blå (#29b6f6) |
| PARTNER | Rosa (#ff6584) |
| ACQUAINTANCE | Grå (#888) |
| OTHER | Gul (#f9a825) |

---

## MVP — fase 1

1. Auth med NextAuth (Google)
2. Grafvisning med React Flow — noder og fargekodede kanter
3. Legg til / rediger person
4. Legg til relasjon mellom to personer (type + farge)
5. Logg et møte/samtale (LogEntry)
6. Tidslinje-stripe øverst med siste hendelser
7. Sidepanel med påminnelser (auto + manuell), kan skjules

## Fase 2 (etter MVP)

- Flerbrukerstøtte (egne kontoer for andre)
- Push-varsler / e-postvarsler via Vercel Cron
- Statistikk og innsikt ("du treffer Lars 2x/mnd i snitt")
- Mobilapp
- Utvidede notatfunksjoner per person
