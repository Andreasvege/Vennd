# V2 · Delprosjekt 1 — Datafundament · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Innføre V2-datamodellen (logger med flere personer, tråder, fakta, tagger, relasjoner med tid og romantiske faser), migrere eksisterende data uten tap, og flytte appen fra klient-`fetch` + `refreshKey` til serverkomponenter og server actions, uten at noe som virker i dag, slutter å virke.

**Architecture:**
- **Ren domenelogikk** ligger i `src/domain/` og testes med enhetstester.
- **Lesing** skjer i `src/server/queries/`, alltid scopet på `userId` fra `requireUserId()`.
- **Skriving** skjer i `src/server/actions/` (`'use server'`). Input valideres med zod, eierskapet sjekkes med `assertAllOwned`, og hver handling avsluttes med `revalidatePath`.
- **Sidene** er serverkomponenter som henter data og sender det som props til klientkomponentene. `/api/*` fjernes.

**Tech Stack:** Prisma 7 (Postgres), Next.js 16 server actions, zod 4, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-25-v2-fundament-og-kjernesloyfe-design.md` (seksjonen «Delprosjekt 1»)

**Bygger på:** PR 0 (`Andreasvege/v2-0-dagbok`). Denne branchen lages fra den.

## Global Constraints

- Hver spørring og handling tar `userId` fra `requireUserId()`, aldri fra klienten.
- Handlinger som tar imot id-er, verifiserer at *alle* tilhører brukeren (`assertAllOwned`) før de skriver noe.
- All input valideres med zod-skjemaer i `src/server/schemas.ts`. Skjemaene testes direkte.
- Ingen tekst i UI utenfor `src/i18n/nb.ts`.
- Farge på person: `primaryTag.color` hvis den finnes, ellers `stone`. `TYPE_TINT` fjernes.
- Migreringen skal bevare data: logger, manuelle påminnelser (→ tråder) og relasjoner.
- Ingen `Reminder`-tabell, ingen `color`-kolonner og ingen `/api/*`-ruter bortsett fra `auth` etter denne PR-en.

## Review Focus

- **Ingen logget kontakt:** en person som aldri har vært med i en logg, skal fortsatt gi «Ingen kontakt logget ennå» og ikke krasje, siden `participations` er tom. *Test:* `cadence.test.ts` i Task 3.
- **Logg med to personer:** kontakten teller for *begge* sin kadens, og loggen vises på begge profilene. *Test:* `lastContactByPerson` i Task 3 og manuell verifisering i Task 9.
- **Fremmede id-er:** en handling med én id som tilhører en annen bruker, skal avvises i sin helhet, uten at noe av skrivingen blir gjort. *Test:* `assertAllOwned` i Task 4.
- **Tagg-navn:** «Klatring» og «klatring» er samme tagg, tomme navn avvises, og navnet trimmes. *Test:* `tagName`-skjemaet i Task 4.
- **Plassering av nye personer:** en ny person skal ikke lande oppå en eksisterende. *Test:* `placeNewPerson` i Task 3.

---

## File Structure

```
prisma/schema.prisma                              MODIFY
prisma/migrations/<ts>_v2_foundation/migration.sql CREATE (generert + håndskrevet datamigrering)
prisma/seed.ts                                    CREATE  realistiske utviklingsdata (V2)
prisma.config.ts                                  MODIFY  migrations.seed
src/domain/cadence.ts            (flytt fra lib)   MODIFY  + lastContactByPerson
src/domain/cadence.test.ts                        MOVE+EXTEND
src/domain/reminders.ts          (flytt fra lib)   MOVE
src/domain/reminders.test.ts                      MOVE
src/domain/placement.ts + .test.ts                CREATE  placeNewPerson
src/domain/romance.ts + .test.ts                  CREATE  currentPhase, nextPhase
src/server/session.ts                             CREATE  requireUserId, getUserId
src/server/ownership.ts + .test.ts                CREATE  assertAllOwned
src/server/schemas.ts + .test.ts                  CREATE  zod-skjemaer
src/server/queries/{graph,person,log,reminders,tags}.ts  CREATE
src/server/actions/{person,relationship,log,thread,tag,phase}.ts CREATE
src/lib/palette.ts                                MODIFY  fjern TYPE_TINT; personTint()
src/types/index.ts                                MODIFY  typer fra queries (inferert)
src/app/page.tsx                                  REWRITE server component + HomeClient
src/components/HomeClient.tsx                     CREATE  (dagens klientlogikk uten refreshKey)
src/components/**                                 MODIFY  fetch → actions/props
src/components/person/TagField.tsx                CREATE  velg/opprett tagger + hovedtagg
src/app/settings/page.tsx                         MODIFY  tagger: gi nytt navn, endre farge, slett
src/app/api/{graph,persons,log,relationships,reminders}  DELETE
src/lib/person-query.ts                           DELETE  (→ server/queries/person.ts)
```

---

### Task 1: Branch, zod og skjema

**Files:** `prisma/schema.prisma` og `package.json`.

- [ ] **Step 1:** `git checkout -b Andreasvege/v2-1-datafundament` fra toppen av PR 0-branchen. `npm install zod`.
- [ ] **Step 2:** Oppdater `prisma/schema.prisma` nøyaktig slik spesifikasjonen beskriver (seksjonen «Datamodell»), med disse presiseringene:
  - `RelationshipType`: `PARTNER` → `ROMANTIC`.
  - `LogEntryType`: legg til `DATE`. `LogEntry.type` blir valgfri (`LogEntryType?`), og `notes` blir `body`.
  - Alle nye relasjoner mot `Person` og `User` får `onDelete: Cascade`. `Thread.openedBy` og `closedBy` mot `LogEntry` får `onDelete: SetNull`.
  - Indekser: `LogParticipant @@index([personId])`, `ThreadPerson @@index([personId])`, `Thread @@index([userId, status])`, `Tag @@unique([userId, name])`, `RomanticPhaseEntry @@index([personId, at])`, `LogEntry @@index([userId, date])`.
  - `Tag.name` lagres i «visningsform» (første skrivemåte). Unikheten uten hensyn til store og små bokstaver håndheves i applikasjonen (Task 4) og med en unik indeks på `lower(name)` i migrerings-SQL-en (Step 3 i Task 2).
  - `User` får relasjonene `tags` og `threads`. `reminders` fjernes.
- [ ] **Step 3:** `npx prisma validate` → OK.

### Task 2: Migrering som bevarer data

**Files:** `prisma/migrations/<ts>_v2_foundation/migration.sql`

- [ ] **Step 1:** `npx prisma migrate dev --create-only --name v2_foundation` genererer SQL-en. **Ikke kjør den ennå.**
- [ ] **Step 2: Rediger SQL-en.** Prisma genererer drop og add for kolonner som flyttes. Skriv om rekkefølgen slik at dataene flyttes før noe slettes:

```sql
-- 1. Enum: PARTNER heter nå ROMANTIC (samme verdi, nytt navn — ingen rader røres).
ALTER TYPE "RelationshipType" RENAME VALUE 'PARTNER' TO 'ROMANTIC';
ALTER TYPE "LogEntryType" ADD VALUE 'DATE';

-- 2. Nye enums og tabeller (fra Prisma sin genererte SQL: CREATE TYPE, CREATE TABLE,
--    indekser og fremmednøkler for Tag, PersonTag, LogParticipant, Thread,
--    ThreadPerson, Fact, RomanticPhaseEntry). Behold dem uendret.

-- 3. Logger: én deltaker per eksisterende logg, før personId fjernes.
INSERT INTO "LogParticipant" ("logEntryId", "personId")
SELECT "id", "personId" FROM "LogEntry";
ALTER TABLE "LogEntry" RENAME COLUMN "notes" TO "body";
ALTER TABLE "LogEntry" ALTER COLUMN "type" DROP NOT NULL;

-- 4. Manuelle påminnelser blir tråder. Avviste blir lukkede tråder.
INSERT INTO "Thread" ("id", "userId", "title", "status", "dueDate", "createdAt", "closedAt")
SELECT "id", "userId", COALESCE(NULLIF("message", ''), 'Påminnelse'),
       CASE WHEN "dismissed" THEN 'CLOSED'::"ThreadStatus" ELSE 'OPEN'::"ThreadStatus" END,
       "dueDate", "createdAt", CASE WHEN "dismissed" THEN "createdAt" END
FROM "Reminder" WHERE "type" = 'MANUAL';
INSERT INTO "ThreadPerson" ("threadId", "personId")
SELECT "id", "personId" FROM "Reminder" WHERE "type" = 'MANUAL';

-- 5. Tagger er unike per bruker uten hensyn til store og små bokstaver.
CREATE UNIQUE INDEX "Tag_userId_lower_name_key" ON "Tag" ("userId", lower("name"));

-- 6. Rydd: det som nå er flyttet eller utledet.
ALTER TABLE "LogEntry" DROP CONSTRAINT "LogEntry_personId_fkey";
ALTER TABLE "LogEntry" DROP COLUMN "personId";
ALTER TABLE "Person" DROP COLUMN "color";
ALTER TABLE "Relationship" DROP COLUMN "color";
DROP TABLE "Reminder";
DROP TYPE "ReminderType";
```

- [ ] **Step 3: Test migreringen mot data.**
  1. Lag en fersk database: `npx prisma dev rm vennekart-v2`, så `npx prisma dev -n vennekart-v2 --detach`.
  2. Kjør bare de gamle migreringene: flytt den nye mappa midlertidig ut av `prisma/migrations`, og kjør `npx prisma migrate deploy`.
  3. Kjør det gamle seed-skriptet `.dev/seed.mjs` (V1-data: 6 logger og 1 manuell påminnelse).
  4. Flytt den nye migreringen tilbake og kjør `npx prisma migrate deploy`.
  5. Verifiser med `psql` eller et lite skript:

```sql
SELECT count(*) FROM "LogParticipant";       -- 6
SELECT count(*) FROM "Thread";               -- 1
SELECT title, status FROM "Thread";          -- 'Spør om andre intervjurunde', OPEN
SELECT count(*) FROM "Relationship" WHERE type = 'ROMANTIC';  -- 1 (Ingrid–Martin)
```

- [ ] **Step 4:** `npx prisma generate`. **Commit** `Migrate to the V2 data model without losing data`. Appen bygger ikke før Task 5–8, og det er forventet. Kjør derfor ikke `npm run build` før Task 8.

### Task 3: Domenelogikk (ren, testet)

**Files:**
- Move: `src/lib/cadence.ts` → `src/domain/cadence.ts` og `src/lib/reminders.ts` → `src/domain/reminders.ts`, med testene.
- Create: `src/domain/placement.ts`, `src/domain/romance.ts`, med tester.

**Interfaces:**
- `lastContactByPerson(entries: { date: Date; personIds: string[] }[]): Map<string, Date>`: nyeste dato per person.
- `placeNewPerson(existing: { x: number; y: number }[], rng?: () => number): { x: number; y: number }`
- `currentPhase(entries: { phase: RomanticPhase; at: Date }[]): RomanticPhase | null` og `ROMANCE_ORDER: RomanticPhase[]` = `['FIRST_DATE','SEEING','EXCLUSIVE','PARTNER']` (`ENDED` er en utgang og ikke et steg).
- `DEFAULT_CADENCE_WEEKS`: `PARTNER` → `ROMANTIC: 1`.

- [ ] **Step 1: Tester (feiler)**

```ts
// src/domain/cadence.test.ts (tillegg)
describe('lastContactByPerson', () => {
  it('gir hver deltaker loggens dato, og beholder den nyeste', () => {
    const m = lastContactByPerson([
      { date: new Date('2026-09-01'), personIds: ['a', 'b'] },
      { date: new Date('2026-09-20'), personIds: ['a'] },
    ])
    expect(m.get('a')).toEqual(new Date('2026-09-20'))
    expect(m.get('b')).toEqual(new Date('2026-09-01'))
  })
  it('gir tomt kart for ingen logger', () => {
    expect(lastContactByPerson([]).size).toBe(0)
  })
})
```

```ts
// src/domain/placement.test.ts
import { describe, it, expect } from 'vitest'
import { placeNewPerson, MIN_GAP } from './placement'

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y)

describe('placeNewPerson', () => {
  it('plasserer første person i origo', () => {
    expect(placeNewPerson([])).toEqual({ x: 0, y: 0 })
  })
  it('holder minst MIN_GAP til alle eksisterende', () => {
    const existing = Array.from({ length: 30 }, (_, i) => ({ x: (i % 6) * 90, y: Math.floor(i / 6) * 90 }))
    const p = placeNewPerson(existing, () => 0.5)
    for (const e of existing) expect(dist(p, e)).toBeGreaterThanOrEqual(MIN_GAP)
  })
  it('er deterministisk gitt samme rng', () => {
    const existing = [{ x: 0, y: 0 }, { x: 100, y: 0 }]
    expect(placeNewPerson(existing, () => 0.25)).toEqual(placeNewPerson(existing, () => 0.25))
  })
})
```

```ts
// src/domain/romance.test.ts
import { describe, it, expect } from 'vitest'
import { currentPhase, nextPhase } from './romance'

describe('romanse', () => {
  it('gjeldende fase er den nyeste, uansett rekkefølge i input', () => {
    expect(currentPhase([
      { phase: 'SEEING', at: new Date('2026-09-02') },
      { phase: 'FIRST_DATE', at: new Date('2026-08-21') },
    ])).toBe('SEEING')
  })
  it('ingen faser gir null', () => {
    expect(currentPhase([])).toBeNull()
  })
  it('neste fase følger rekkefølgen og stopper ved PARTNER', () => {
    expect(nextPhase('FIRST_DATE')).toBe('SEEING')
    expect(nextPhase('PARTNER')).toBeNull()
    expect(nextPhase('ENDED')).toBeNull()
    expect(nextPhase(null)).toBe('FIRST_DATE')
  })
})
```

- [ ] **Step 2:** Kjør → FAIL.
- [ ] **Step 3: Implementer**

```ts
// src/domain/placement.ts
// Nye personer plasseres på en ring rundt tyngdepunktet av kartet, på
// første ledige plass. Før landet de på tilfeldige koordinater og kunne
// havne rett oppå noen andre.
export const MIN_GAP = 110
const RING_STEP = 120
const SLOTS = 24

type Point = { x: number; y: number }

export function placeNewPerson(existing: Point[], rng: () => number = Math.random): Point {
  if (existing.length === 0) return { x: 0, y: 0 }

  const cx = existing.reduce((s, p) => s + p.x, 0) / existing.length
  const cy = existing.reduce((s, p) => s + p.y, 0) / existing.length
  const offset = rng() * Math.PI * 2 // ulik startvinkel, så nye ikke stables i én retning

  for (let ring = 1; ring < 50; ring++) {
    const r = ring * RING_STEP
    for (let i = 0; i < SLOTS; i++) {
      const a = offset + (i / SLOTS) * Math.PI * 2
      const p = { x: Math.round(cx + r * Math.cos(a)), y: Math.round(cy + r * Math.sin(a)) }
      if (existing.every((e) => Math.hypot(e.x - p.x, e.y - p.y) >= MIN_GAP)) return p
    }
  }
  // Uoppnåelig i praksis (50 ringer ≈ 6000 px ut); faller tilbake til ytterkanten.
  return { x: Math.round(cx + 50 * RING_STEP), y: Math.round(cy) }
}
```

```ts
// src/domain/romance.ts
import type { RomanticPhase } from '@prisma/client'

export const ROMANCE_ORDER: RomanticPhase[] = ['FIRST_DATE', 'SEEING', 'EXCLUSIVE', 'PARTNER']

export function currentPhase(entries: { phase: RomanticPhase; at: Date }[]): RomanticPhase | null {
  if (entries.length === 0) return null
  return entries.reduce((a, b) => (b.at.getTime() >= a.at.getTime() ? b : a)).phase
}

/** Neste steg framover. ENDED og PARTNER har ingen neste. null = ingen fase ennå. */
export function nextPhase(current: RomanticPhase | null): RomanticPhase | null {
  if (current === null) return 'FIRST_DATE'
  const i = ROMANCE_ORDER.indexOf(current)
  return i === -1 || i === ROMANCE_ORDER.length - 1 ? null : ROMANCE_ORDER[i + 1]
}
```

`lastContactByPerson` i `cadence.ts`:

```ts
export function lastContactByPerson(entries: { date: Date; personIds: string[] }[]): Map<string, Date> {
  const out = new Map<string, Date>()
  for (const e of entries) {
    for (const id of e.personIds) {
      const prev = out.get(id)
      if (!prev || e.date > prev) out.set(id, e.date)
    }
  }
  return out
}
```

- [ ] **Step 4:** Oppdater alle imports fra `@/lib/cadence` og `@/lib/reminders` til `@/domain/...`. Kjør `npx vitest run src/domain` → PASS.
- [ ] **Step 5: Commit** `Add domain logic for multi-person logs, placement and romance`

### Task 4: Serverfundament: sesjon, eierskap og skjemaer

**Files:** Create `src/server/session.ts`, `src/server/ownership.ts` (+ test), `src/server/schemas.ts` (+ test).

**Interfaces:**
- `requireUserId(): Promise<string>`: `redirect('/')` uten sesjon.
- `assertAllOwned(requested: string[], found: { id: string }[]): void`: kaster `NotOwnedError` hvis ett requested-id mangler. Duplikater teller som ett.
- Skjemaene (zod) er: `personInput`, `personPatch`, `relationshipInput`, `logInput`, `threadCloseInput`, `tagName`, `tagInput`, `phaseInput`. Hvert skjema eksporterer også sin `z.infer`-type.

- [ ] **Step 1: Tester (feiler)**

```ts
// src/server/ownership.test.ts
import { describe, it, expect } from 'vitest'
import { assertAllOwned, NotOwnedError } from './ownership'

describe('assertAllOwned', () => {
  it('godtar når alle finnes', () => {
    expect(() => assertAllOwned(['a', 'b'], [{ id: 'a' }, { id: 'b' }])).not.toThrow()
  })
  it('avviser når én mangler', () => {
    expect(() => assertAllOwned(['a', 'x'], [{ id: 'a' }])).toThrow(NotOwnedError)
  })
  it('teller duplikater som ett', () => {
    expect(() => assertAllOwned(['a', 'a'], [{ id: 'a' }])).not.toThrow()
  })
})
```

```ts
// src/server/schemas.test.ts
import { describe, it, expect } from 'vitest'
import { tagName, logInput, personInput } from './schemas'

describe('tagName', () => {
  it('trimmer og avviser tomme', () => {
    expect(tagName.parse('  Klatring ')).toBe('Klatring')
    expect(tagName.safeParse('   ').success).toBe(false)
  })
  it('avviser over 40 tegn', () => {
    expect(tagName.safeParse('x'.repeat(41)).success).toBe(false)
  })
})

describe('logInput', () => {
  it('krever minst én deltaker', () => {
    expect(logInput.safeParse({ personIds: [], date: '2026-09-25' }).success).toBe(false)
  })
  it('godtar logg uten type og uten tekst', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '2026-09-25' }).success).toBe(true)
  })
  it('avviser ugyldig dato', () => {
    expect(logInput.safeParse({ personIds: ['a'], date: '25.09.2026' }).success).toBe(false)
  })
})

describe('personInput', () => {
  it('trimmer navn og tillater kadens null («aldri»)', () => {
    const p = personInput.parse({ name: ' Ingrid ', type: 'FRIEND', cadenceWeeks: null })
    expect(p.name).toBe('Ingrid')
    expect(p.cadenceWeeks).toBeNull()
  })
})
```

- [ ] **Step 2:** FAIL. **Step 3: Implementer.** `schemas.ts` bruker `z.enum` med verdier fra `@prisma/client` sine enums. Dato som `z.string().regex(/^\d{4}-\d{2}-\d{2}$/)`, og kadens som `z.number().int().min(1).max(52).nullable()`. `tagInput` er `{ name: tagName, color: z.enum(TAG_COLORS) }`.

```ts
// src/server/ownership.ts
export class NotOwnedError extends Error {
  constructor() {
    super('Én eller flere av ressursene finnes ikke eller tilhører en annen bruker')
  }
}

/** Kast hvis ikke hver forespurt id ble funnet i brukerens egne rader. */
export function assertAllOwned(requested: string[], found: { id: string }[]): void {
  const have = new Set(found.map((f) => f.id))
  if (new Set(requested).size !== have.size || requested.some((id) => !have.has(id))) {
    throw new NotOwnedError()
  }
}
```

```ts
// src/server/session.ts
import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function getUserId(): Promise<string | null> {
  return (await auth())?.user?.id ?? null
}

export async function requireUserId(): Promise<string> {
  const id = await getUserId()
  if (!id) redirect('/')
  return id
}
```

`npm install server-only`.

- [ ] **Step 4:** PASS. **Commit** `Add server session, ownership check and input schemas`

### Task 5: Spørringer (queries)

**Files:** `src/server/queries/{graph,person,log,reminders,tags}.ts`. Hver fil starter med `import 'server-only'`.

**Interfaces** (returtypene eksporteres med `Awaited<ReturnType<…>>` fra `src/types/index.ts`):
- `getGraph(userId)` → `{ persons: MapPerson[]; relationships: MapRelationship[] }`. `MapPerson` = `{ id, name, type, photoUrl, positionX, positionY, primaryTag: { color } | null }`. `MapRelationship` = `{ id, fromPersonId, toPersonId, type, label, until }`.
- `getPersonProfile(userId, id)` → person med `tags`, `primaryTag`, `facts`, `phases` (sortert etter `at`), `logs` (via `participations`, nyeste først, med alle deltakerne) og `openThreads`. Gir `null` hvis personen ikke finnes eller ikke eies av brukeren.
- `getPersonForEdit(userId, id)` → person, `tags` (id-er), `primaryTagId` og alle brukerens tagger.
- `getRecentLogs(userId, limit)` → `{ id, date, type, body, participants: { id, name }[] }[]`.
- `getReminders(userId, now?)` → `ReminderItem[]` = automatiske (kadens, fra `lastContactByPerson`) pluss tråder med `dueDate <= now` som «kommende». Én spørring for personene og én for loggene med deltakere (`select: { date, participants: { select: { personId } } }`), og kadensen beregnes i minnet.
- `getTags(userId)` → `{ id, name, color, _count: { persons } }[]`, sortert etter `sortOrder` og så `name`.

- [ ] **Step 1:** Skriv spørringene. Hver av dem har `where: { userId }` på rota. Relasjoner filtreres på `fromPerson: { userId }, toPerson: { userId }`, slik som i dag.
- [ ] **Step 2:** `npx tsc --noEmit` (bare `src/server`, `src/domain` og `src/types`. Resten feiler fram til Task 6–8).
- [ ] **Step 3: Commit** `Add scoped server queries`

### Task 6: Handlinger (server actions)

**Files:** `src/server/actions/{person,relationship,log,thread,tag,phase}.ts`, hver med `'use server'` øverst.

**Mønster (alle handlinger):**

```ts
'use server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/server/session'
import { assertAllOwned } from '@/server/ownership'
import { logInput, type LogInput } from '@/server/schemas'

export type ActionResult = { ok: true } | { ok: false; error: 'invalid' | 'not-found' | 'failed' }

export async function createLog(raw: LogInput): Promise<ActionResult> {
  const userId = await requireUserId()
  const parsed = logInput.safeParse(raw)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  const { personIds, date, type, body } = parsed.data

  const owned = await prisma.person.findMany({ where: { id: { in: personIds }, userId }, select: { id: true } })
  try { assertAllOwned(personIds, owned) } catch { return { ok: false, error: 'not-found' } }

  await prisma.logEntry.create({
    data: {
      userId,
      date: new Date(`${date}T12:00:00`), // midt på dagen: tåler tidssoner i begge retninger
      type: type ?? null,
      body: body?.trim() || null,
      participants: { create: [...new Set(personIds)].map((personId) => ({ personId })) },
    },
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}
```

`ActionResult` og feilkodene ligger i `src/server/actions/result.ts`. Klientene oversetter feilkoden til tekst via `t.errors[code]`, som legges til i `nb.ts`: invalid = «Noe i skjemaet er ikke fylt ut riktig.», not-found = «Fant ikke personen. Last siden på nytt.», failed = «Det ble ikke lagret. Sjekk nettforbindelsen og prøv igjen.».

**Handlinger:**
- **`person.ts`:**
  - `createPerson(input) → { ok, id }`: posisjonen settes med `placeNewPerson`, og tagger kobles på.
  - `updatePerson(id, patch)`: tagger erstattes med `set`. `primaryTagId` må være blant personens tagger, ellers settes den til `null`.
  - `deletePerson(id)`.
  - `movePerson(id, x, y)`: revaliderer ikke, fordi posisjonen allerede står der klienten har den.
  - `snoozePerson(id, weeks)`.
- **`relationship.ts`:** `createRelationship({ fromPersonId, toPersonId, type, label?, since?, until? })`, `updateRelationship`, `deleteRelationship`.
- **`log.ts`:** `createLog` (som over) og `deleteLog(id)`.
- **`thread.ts`:** `closeThread(id, resolution?)`. Brukes av «Avvis» for tråder med forfall, og er grunnlaget for PR 2.
- **`tag.ts`:**
  - `createTag({ name, color }) → { ok, id }`: sjekker om navnet finnes uten hensyn til store og små bokstaver. Finnes det, returneres den eksisterende id-en.
  - `renameTag`, `recolorTag` og `deleteTag`.
- **`phase.ts`:** `addPhase(personId, phase, at)`. Personens type må være `ROMANTIC`.

- [ ] **Step 1:** Skriv handlingene etter mønsteret. Hver av dem kaller `requireUserId`, validerer, sjekker eierskap og revaliderer.
- [ ] **Step 2:** `npx tsc --noEmit` for `src/server` → OK.
- [ ] **Step 3: Commit** `Add validated, ownership-checked server actions`

### Task 7: Farge fra tagger, og taggfelt

**Files:**
- Modify `src/lib/palette.ts`: fjern `TYPE_TINT`, og legg til `personTint(p: { primaryTag: { color: string } | null }): TagColor`, som gir `primaryTag.color` hvis den er en gyldig nøkkel, ellers `'stone'`.
- Create `src/components/person/TagField.tsx`.
- Modify settings: taggseksjonen.

- [ ] **Step 1: `personTint`-test:** en gyldig farge gir fargen, en ugyldig eller manglende gir `stone`.
- [ ] **Step 2: TagField**
  - Et react-aria `ComboBox` med filtrering og valget «Opprett «X»» når teksten ikke matcher en eksisterende tagg. Oppretting kaller `createTag`, med neste ubrukte farge fra `TAG_COLORS`.
  - Valgte tagger vises som chips med en farget prikk og ×-knapp (`aria-label` «Fjern X»).
  - Én av chipsene kan markeres som hovedtagg med en stjerne-knapp (`aria-pressed`). Den første taggen blir hovedtagg automatisk.
  - Etiketter i i18n: `tags.label` «Tagger», `tags.add` «Legg til tagg», `tags.create(name)`, `tags.primary` «Hovedtagg», `tags.remove(name)`.
- [ ] **Step 3: Settings → «Tagger»:**
  - Liste med farge, navn og antall personer.
  - Nytt navn redigeres der det står (TextField som lagres ved blur eller Enter).
  - Fargen velges i en popover med de 8 fargene.
  - «Slett» med bekreftelse: «Taggen fjernes fra N personer.».
  - Seksjonen «Relasjonstyper» fjernes. Farge kommer nå fra tagger.
- [ ] **Step 4: Commit** `Colour people by their primary tag; add tag field and tag settings`

### Task 8: Flytt skjermene til serverdata og handlinger

**Files:** `src/app/page.tsx`, `src/components/HomeClient.tsx`, kart, modaler, profil, redigering, påminnelser og tidslinje. Delete `/api/*` (unntatt auth) og `src/lib/person-query.ts`.

- [ ] **Step 1: `page.tsx`** blir en serverkomponent:
  - Uten sesjon vises `<Landing />`.
  - Ellers hentes `getGraph`, `getReminders` og `getRecentLogs` parallelt med `Promise.all`, og sendes til `<HomeClient graph reminders logs />`.
  - `HomeClient` beholder bare UI-tilstand (hvilket ark som er åpent). All `refreshKey` forsvinner. Etter en handling oppdaterer `revalidatePath` serverkomponenten, og de nye props strømmer inn.
- [ ] **Step 2: VennekartCanvas** tar `persons` og `relationships` som props. Effekten som bygger noder fra props beholdes, og noder får `tint: personTint(p)` og `photoUrl`. `onConnect` kaller `createRelationship`, og `onNodeDragStop` kaller `movePerson`.
- [ ] **Step 3: Modalene:** `AddPersonModal` bruker `createPerson` med TagField. `AddRelationshipModal` og `LogEntryModal` får personene som props (ingen henting) og bruker handlingene. `LogEntryModal` sender `personIds: [id]`, og flere deltakere kommer i PR 2.
- [ ] **Step 4: Profilen og redigeringen:**
  - `getPersonProfile` erstatter `getOwnedPerson`.
  - Loggene vises med *alle* deltakerne («med Martin»).
  - «Påminnelser» blir «Spør om», med de åpne trådene og en knapp som lukker dem via `closeThread`.
  - `EditPersonForm` får TagField og bruker `updatePerson` og `deletePerson`.
  - Romantiske personer viser en enkel fasestripe (read-only nå. Å gå videre til neste fase kommer i PR 2).
- [ ] **Step 5: RemindersPanel og TimelineStripe** tar data som props. Utsettelse bruker `snoozePerson`, og å avvise en tråd bruker `closeThread`.
- [ ] **Step 6:** Slett `src/app/api/{graph,persons,log,relationships,reminders}` og `src/lib/person-query.ts`. Grep etter `fetch('/api` skal gi 0 treff.
- [ ] **Step 7:** `npm run lint && npx vitest run && npm run build` skal være grønt.
- [ ] **Step 8: Commit** `Serve pages from scoped queries and mutate through server actions`

### Task 9: Seed, verifisering og PR

- [ ] **Step 1: `prisma/seed.ts`** med V2-data og samme personer som `.dev/seed.mjs`, pluss:
  - tagger (Studentradio, Klatring, Familie, Folkehøgskole, Romantisk, Jobb) med hovedtagger
  - en logg med to deltakere (Ingrid og Martin)
  - tre åpne tråder
  - fakta for Ingrid
  - faser for Hanna (FIRST_DATE 21.08 og SEEING 02.09)
  - en historisk relasjon (Line–Erik, `until` 2024)

  Skriptet sletter bare brukeren `dev-user` og dataene til den. `prisma.config.ts`: `migrations.seed = 'node prisma/seed.ts'`, siden Node 24 kjører TypeScript direkte. **Skriptet nekter å kjøre hvis `DATABASE_URL` ikke peker på localhost.**
- [ ] **Step 2: Manuell verifisering i nettleseren** (390 og 1440 px, lys og mørk modus):
  - legg til en person med tagger (fargen følger hovedtaggen, og personen lander ikke oppå noen)
  - logg kontakt (tidslinjen og påminnelsene oppdateres uten ny lasting)
  - lukk en tråd fra profilen
  - dra en node og last siden på nytt (posisjonen står)
  - lag en relasjon ved å dra
  - gi taggen nytt navn og ny farge i innstillingene (kartet følger etter)
  - slett en person
- [ ] **Step 3: Kodegjennomgang** (superpowers:requesting-code-review) av hele branchen, og rett funnene.
- [ ] **Step 4: Push og PR** mot PR 0-branchen (stablet), med beskrivelse av migreringen, hva som ble flyttet, og at prod-migreringen skjer etter merge. Prod har bare testdata, men migreringen bevarer uansett alt.
