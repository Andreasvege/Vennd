# Vennekart fase 2 — «meg i midten» og kadens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjøre Vennekart til et kart over *dine* relasjoner ved å flytte relasjonstype og kontaktkadens ned på `Person`, og erstatte lagrede auto-påminnelser med påminnelser som beregnes ved lesing.

**Architecture:** `Person` får `type`, `cadenceWeeks` og `snoozedUntil`. Auto-påminnelser lagres ikke lenger i databasen — de beregnes fra siste `LogEntry` per person hver gang `/api/reminders` leses. `Relationship` (Person↔Person) beholdes urørt, men er ikke lenger det grafen primært handler om. UI-et får et lag med react-aria-primitiver under `src/components/ui/`.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack), React 19.2.3, TypeScript strict, Tailwind CSS v4, Prisma 7.10 mot Prisma Postgres, Auth.js v5, `react-aria-components` 1.21.1, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-05-06-vennekart-design.md` (fase 1), utvidet av beslutningene under.

## Global Constraints

- Alle spørringer scopes på `session.user.id`. Databasen har fire brukere med data — 20 personer fordelt som 10/7/2/1.
- Ingen semikolon, enkle apostrofer, 2 mellomrom innrykk, navngitte eksporter.
- `npm run lint` har `react-hooks/set-state-in-effect` som feilnivå. Ingen `setState` synkront i en effect.
- `npx tsc --noEmit`, `npm run lint` og `npm test` skal være grønne før hver commit.
- Kadensprofil «Tett»: PARTNER 1 · FAMILY 3 · FRIEND 4 · COLLEAGUE 8 · ACQUAINTANCE 26 · OTHER 12 uker.
- `cadenceWeeks = null` betyr eksplisitt «aldri auto-påminn om denne personen».

---

## Beslutninger tatt før planen

1. `Relationship` beholdes, men blir sekundær. Ikke-destruktivt — kan promoteres til eget lag senere.
2. Migrasjonen sletter de 23 lagrede `AUTO`-radene i `Reminder`. `MANUAL` beholdes (det finnes null av dem i dag).
3. Alle 20 eksisterende personer får `type = FRIEND` og kadens 4 uker. Kan ikke gjettes bedre; brukeren justerer selv etterpå.
4. `/reminders`-siden bygges ikke. Navbar-lenken er allerede fjernet i `ab58f9e`; sidepanelet dekker behovet.

---

## File Structure

**Endres:**
- `prisma/schema.prisma` — tre felt på `Person`
- `src/types/index.ts` — `PersonWithCadence`, `ComputedReminder`
- `src/lib/reminders.ts` — kadenslogikk erstatter `WEEKS_THRESHOLD`
- `src/lib/reminders.test.ts` — nye tester
- `src/app/api/reminders/route.ts` — beregn ved lesing, fjern `generate-auto`
- `src/app/api/persons/route.ts` — ta imot `type` og `cadenceWeeks` ved opprettelse
- `src/app/api/persons/[id]/route.ts` — `PATCH` støtter `snoozedUntil`, `type`, `cadenceWeeks`
- `src/components/RemindersSidebar.tsx` — «Utsett» i stedet for «Avvis»
- `src/components/modals/AddPersonModal.tsx` — felt for type og kadens
- `src/components/graph/VennekartCanvas.tsx` — `onConnect`

**Opprettes:**
- `prisma/migrations/<tidsstempel>_person_cadence/migration.sql`
- `src/lib/cadence.ts` — standardverdier per type
- `src/lib/cadence.test.ts`
- `src/components/ui/{Button,TextField,Dialog}.tsx` + `index.ts`

---

## Task 1: Kadens-standardverdier

**Files:** Create `src/lib/cadence.ts`, `src/lib/cadence.test.ts`

**Produces:** `DEFAULT_CADENCE_WEEKS: Record<RelationshipType, number>`, `defaultCadenceFor(type): number`

- [ ] **Steg 1: Skriv testen**

```ts
import { describe, it, expect } from 'vitest'
import { DEFAULT_CADENCE_WEEKS, defaultCadenceFor } from './cadence'

describe('kadens-standardverdier', () => {
  it('følger «Tett»-profilen', () => {
    expect(DEFAULT_CADENCE_WEEKS.PARTNER).toBe(1)
    expect(DEFAULT_CADENCE_WEEKS.FAMILY).toBe(3)
    expect(DEFAULT_CADENCE_WEEKS.FRIEND).toBe(4)
    expect(DEFAULT_CADENCE_WEEKS.COLLEAGUE).toBe(8)
    expect(DEFAULT_CADENCE_WEEKS.ACQUAINTANCE).toBe(26)
    expect(DEFAULT_CADENCE_WEEKS.OTHER).toBe(12)
  })

  it('dekker alle relasjonstyper', () => {
    expect(Object.keys(DEFAULT_CADENCE_WEEKS)).toHaveLength(6)
  })

  it('defaultCadenceFor slår opp riktig', () => {
    expect(defaultCadenceFor('PARTNER')).toBe(1)
  })
})
```

- [ ] **Steg 2: Kjør — forvent FAIL** (`npm test` — "Cannot find module './cadence'")
- [ ] **Steg 3: Implementer**

```ts
import type { RelationshipType } from '@/types'

// Profil «Tett», valgt 2026-09-06. Tallet er antall uker uten kontakt før
// appen sier fra. null på Person.cadenceWeeks betyr «aldri påminn».
export const DEFAULT_CADENCE_WEEKS: Record<RelationshipType, number> = {
  PARTNER: 1,
  FAMILY: 3,
  FRIEND: 4,
  COLLEAGUE: 8,
  ACQUAINTANCE: 26,
  OTHER: 12,
}

export function defaultCadenceFor(type: RelationshipType): number {
  return DEFAULT_CADENCE_WEEKS[type]
}
```

- [ ] **Steg 4: Kjør — forvent PASS**
- [ ] **Steg 5: Commit** `git commit -m "Add per-type cadence defaults"`

---

## Task 2: Skjema og migrasjon

**Files:** Modify `prisma/schema.prisma`; Create migrasjon

**Consumes:** `DEFAULT_CADENCE_WEEKS` (kun som referanse for SQL-verdiene)
**Produces:** `Person.type`, `Person.cadenceWeeks`, `Person.snoozedUntil`

- [ ] **Steg 1: Legg til feltene på `Person`**

```prisma
  type          RelationshipType @default(FRIEND)
  cadenceWeeks  Int?             @default(4)
  snoozedUntil  DateTime?
```

- [ ] **Steg 2: Lag migrasjonen**

`npx prisma migrate dev --name person_cadence --create-only`

- [ ] **Steg 3: Legg til opprydding i migrasjonen**

Etter de genererte `ALTER TABLE`-setningene:

```sql
-- Auto-påminnelser beregnes nå ved lesing. De lagrede radene er ugyldige.
DELETE FROM "Reminder" WHERE "type" = 'AUTO';
```

- [ ] **Steg 4: Kjør migrasjonen** `npx prisma migrate dev`
- [ ] **Steg 5: Verifiser** at alle 20 personer har `type='FRIEND'` og `cadenceWeeks=4`, og at `Reminder` er tom.
- [ ] **Steg 6: Commit**

---

## Task 3: Beregnede påminnelser

**Files:** Modify `src/lib/reminders.ts`, `src/lib/reminders.test.ts`, `src/types/index.ts`

**Consumes:** `defaultCadenceFor`
**Produces:** `computeAutoReminders(persons: PersonWithCadence[], now?: Date): ComputedReminder[]`

Typer i `src/types/index.ts`:

```ts
export type PersonWithCadence = {
  id: string
  name: string
  userId: string
  cadenceWeeks: number | null
  snoozedUntil: Date | null
  lastContactDate: Date | null
}

export type ComputedReminder = {
  id: string            // syntetisk: `auto:${personId}` — ikke en databaserad
  personId: string
  personName: string
  type: 'AUTO'
  message: string
  weeksSinceContact: number | null
}
```

- [ ] **Steg 1: Skriv testene** — dekk: kadens null hopper over, snoozet i fremtiden hopper over, snoozet i fortiden tas med, aldri logget gir egen melding, akkurat på grensen tas med, under grensen hoppes over, ulik kadens per person respekteres.
- [ ] **Steg 2: Kjør — forvent FAIL**
- [ ] **Steg 3: Implementer** `computeAutoReminders`. Fjern `WEEKS_THRESHOLD` og `generateAutoReminders`.
- [ ] **Steg 4: Kjør — forvent PASS**
- [ ] **Steg 5: Commit**

---

## Task 4: Reminders-API-et

**Files:** Modify `src/app/api/reminders/route.ts`, `src/app/api/persons/[id]/route.ts`

**Consumes:** `computeAutoReminders`

- [ ] **Steg 1:** `GET /api/reminders` henter personer med `logEntries: { take: 1, orderBy: { date: 'desc' } }`, kaller `computeAutoReminders`, og slår resultatet sammen med lagrede `MANUAL`-rader.
- [ ] **Steg 2:** Fjern hele `action === 'generate-auto'`-grenen fra `POST`.
- [ ] **Steg 3:** `PATCH /api/persons/[id]` godtar `snoozedUntil`, `type` og `cadenceWeeks` med eierskapssjekk.
- [ ] **Steg 4:** Verifiser at `tsc`, `lint` og `test` er grønne, og at `GET /api/reminders` gir 401 uten sesjon.
- [ ] **Steg 5: Commit**

---

## Task 5: UI-primitiver

**Files:** Create `src/components/ui/{Button,TextField,Dialog}.tsx`, `index.ts`

Bygget på `react-aria-components`. Bruker tokenene i `globals.css` (`bg-Accent`, `text-Text`, `glass-card`). `Dialog` gir focus trap, focus-restore, Escape og scroll-lock som `Modal.tsx` mangler i dag.

- [ ] **Steg 1:** `Button` med `variant: 'accent' | 'glass' | 'ghost'`, tilstand via `data-[hovered]`, `data-[pressed]`, `data-[focus-visible]`.
- [ ] **Steg 2:** `TextField` med `label`, `description`, `errorMessage`, `multiline`.
- [ ] **Steg 3:** `Dialog` på `ModalOverlay` + `Modal` + `Dialog` + `Heading slot="title"`.
- [ ] **Steg 4:** Verifiser og commit.

---

## Task 6: AddPersonModal med type og kadens

**Files:** Modify `src/components/modals/AddPersonModal.tsx`

**Consumes:** `Button`, `TextField`, `Dialog`, `DEFAULT_CADENCE_WEEKS`

- [ ] **Steg 1:** Bytt til `Dialog` og `TextField`.
- [ ] **Steg 2:** Legg til `RadioGroup` for relasjonstype (6 valg, fargeprikk per type fra `RELATIONSHIP_COLORS`).
- [ ] **Steg 3:** Kadensfelt som forhåndsutfylles fra valgt type, med et eksplisitt «Aldri påminn»-valg som sender `null`.
- [ ] **Steg 4:** Verifiser og commit.

---

## Task 7: Sidepanel med utsettelse

**Files:** Modify `src/components/RemindersSidebar.tsx`

- [ ] **Steg 1:** Fjern `generate-auto`-kallet i effekten — `GET` gjør nå alt.
- [ ] **Steg 2:** «Avvis» blir «Utsett», og gjør `PATCH /api/persons/{personId}` med `snoozedUntil = nå + cadenceWeeks`.
- [ ] **Steg 3:** Verifiser og commit.

---

## Task 8: Graf — onConnect

**Files:** Modify `src/components/graph/VennekartCanvas.tsx`, `src/components/graph/PersonNode.tsx`

- [ ] **Steg 1:** Gjør håndtakene i `PersonNode` synlige ved hover i stedet for `opacity: 0` og 1×1 px.
- [ ] **Steg 2:** Legg til `onConnect` som POSTer til `/api/relationships` og oppdaterer grafen.
- [ ] **Steg 3:** Verifiser og commit.

---

## Self-Review

- **Spec-dekning:** Fase 2-punktene i speccen — flerbrukerstøtte (allerede på plass via `userId`), varsler (ikke i denne planen, krever cron), statistikk (ikke i denne planen). Kadens og «meg i midten» er nye krav fra 2026-09-06 og dekkes av Task 1–4, 6, 7.
- **Typekonsistens:** `PersonWithCadence` og `ComputedReminder` defineres i Task 3 og brukes i Task 4 og 7. `defaultCadenceFor` defineres i Task 1, brukes i Task 2 (SQL-verdi) og Task 6.
- **Utelatt bevisst:** `/reminders`-side (Task 8 i den opprinnelige skissen) droppet etter avtale.
