# V2 · Delprosjekt 0 — Dagbok visuelt fundament · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle hele den eksisterende appen til «Dagbok» (lys og mørk), med et tokenbasert designsystem, nye UI-primitiver og i18n-klar tekst, uten å endre funksjonalitet.

**Architecture:** CSS-variabler i `globals.css` er eneste kilde til farge. De eksponeres som Tailwind v4-utilities via `@theme inline`. Fontene lastes med `next/font`. Primitivene i `src/components/ui/` bygger på react-aria-components. All synlig tekst hentes fra `src/i18n/nb.ts`. Eksisterende skjermer bytter til de nye primitivene og tokenene. Til slutt fjernes de gamle tokenene og komponentene.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, react-aria-components, @xyflow/react, lucide-react (ny), Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-25-v2-fundament-og-kjernesloyfe-design.md` (seksjonen «Delprosjekt 0»)

## Global Constraints

- Farger kommer **bare** fra tokens: `paper`, `paper-raised`, `ink`, `ink-muted`, `rule`, `pen`, `pen-wash`, `redpencil`, pluss taggpaletten `sage | ochre | slate | plum | rose | teal | clay | stone` (fill/stroke). Ingen hex-verdier i komponenter.
- Fonter: Fraunces (display, akser `SOFT`, `WONK`, `opsz`) og Instrument Sans (UI). Ingen andre familier.
- Typeskala: 12 · 13 · 14 · 15 · 16 · 18 · 21 · 26 · 34 · 46 (15 er standard for kontroller og lister; 64 brukes bare som tittel på forsiden) px.
- Radius: 10 px (felt/chips), 16 px (ark/paneler), full (avatarer). Ingen `glass-card`, ingen backdrop-blur-glass.
- Trykkflater minst 44 px på mobil. Synlig fokus: 2 px `pen`-ring med 2 px offset.
- Bevegelse: 150 ms tilstand, 250 ms ark, `ease-out`. `prefers-reduced-motion: reduce` slår av transform-animasjon.
- Mørk modus følger `prefers-color-scheme`. `html[data-theme="light"|"dark"]` overstyrer.
- All synlig tekst via `t` fra `@/i18n`. Norsk (`nb-NO`) er eneste språk.
- Ingen emoji i UI. Ikoner fra `lucide-react` med `strokeWidth={1.75}`.
- Ingen funksjonsendring i dette delprosjektet, bortsett fra at fargevelgeren for personer fjernes (farge kommer fra relasjonstype nå og fra hovedtagg i delprosjekt 1).

## Review Focus

- **Mørk modus overalt:** hver skjerm skal være lesbar i «Dagbok natt». Ingen hvit tekst på papir og ingen gamle `text-Text`-klasser igjen. *Test:* Task 10 kjører grep etter gamle klasser, som skal gi null treff.
- **Kontrast for dempet tekst:** `ink-muted` mot `paper` og `paper-raised` må være ≥ 4,5:1 i begge temaer. *Test:* `src/styles/contrast.test.ts` i Task 1.
- **Lange navn og tomt innhold:** et navn som «Kristine Margrethe Aas-Johansen» skal ikke sprenge noder, chips eller overskrifter. Nodeetiketter kuttes med ellipse, og overskrifter brytes. *Test:* Avatar-test for initialer med bindestrek og flere navn i Task 3.
- **Tastatur i ark og dialoger:** Escape lukker, fokus fanges og returneres, og Tab går rundt. *Test:* Sheet-test i Task 3.
- **Dato rundt midnatt:** relative datoer («i går») skal regnes i lokal tid, ikke UTC. *Test:* `format.test.ts` i Task 2.

---

## File Structure

```
src/app/globals.css                      REWRITE  tokens, @theme, base, reduced-motion
src/app/layout.tsx                       MODIFY   fonter, theme-color, viewport, lang="nb"
src/styles/tokens.ts                     CREATE   token-hex for tester og kart-SVG (speiler CSS)
src/styles/contrast.ts                   CREATE   WCAG-kontrastberegning
src/styles/contrast.test.ts              CREATE
src/lib/palette.ts                       CREATE   TagColor-nøkler, TYPE_TINT, tagFill/tagStroke
src/lib/relationship-colors.ts           DELETE   (erstattes av palette.ts + i18n-etiketter)
src/i18n/nb.ts                           CREATE   all tekst
src/i18n/index.ts                        CREATE   export const t = nb
src/domain/format.ts                     CREATE   relativeDay, formatDate, initialsOf
src/domain/format.test.ts                CREATE
src/components/ui/Button.tsx             REWRITE  primary | secondary | quiet | danger
src/components/ui/TextField.tsx          REWRITE  + serif-variant for TextArea
src/components/ui/Select.tsx             CREATE   react-aria Select (erstatter <select>)
src/components/ui/Chip.tsx               CREATE   ToggleChip/RadioChip-gruppe
src/components/ui/Avatar.tsx             CREATE
src/components/ui/Sheet.tsx              CREATE   (erstatter ui/Dialog.tsx og modals/Modal.tsx)
src/components/ui/SectionHeading.tsx     CREATE
src/components/ui/EmptyState.tsx         CREATE
src/components/ui/index.ts               MODIFY
src/components/ui/*.test.tsx             CREATE   Avatar, Chip, Sheet
src/components/Navbar.tsx                REWRITE  → AppHeader.tsx
src/components/ThemeToggle.tsx           CREATE   system | lys | mørk (settings)
src/components/graph/*                   RESTYLE
src/components/person/*                  RESTYLE
src/components/modals/*                  RESTYLE  → bruker Sheet; Modal.tsx slettes
src/components/RemindersSidebar.tsx      RESTYLE
src/components/TimelineStripe.tsx        RESTYLE
src/app/page.tsx                         RESTYLE  (inkl. utlogget forside)
src/app/settings/page.tsx                RESTYLE  + tema-valg
src/app/person/**, src/app/@modal/**     RESTYLE
src/app/about, src/app/contact           DELETE   (malrester, ikke lenket)
```

---

### Task 1: Tokens, fonter, mørk modus og kontrasttest

**Files:**
- Create: `src/styles/tokens.ts`, `src/styles/contrast.ts`, `src/styles/contrast.test.ts`
- Modify: `src/app/globals.css` (legg til nye tokens *ved siden av* de gamle; de gamle fjernes i Task 10)
- Modify: `src/app/layout.tsx`
- Add dep: `lucide-react`

**Interfaces:**
- Produces: Tailwind-utilities `bg-paper`, `bg-paper-raised`, `text-ink`, `text-ink-muted`, `border-rule`, `bg-pen`, `text-pen`, `bg-pen-wash`, `text-redpencil`, `border-redpencil`, `font-display`, `font-sans`. CSS-variabler `--tag-<key>-fill` og `--tag-<key>-stroke`. `TOKENS` i `src/styles/tokens.ts`: `{ light: Record<TokenName,string>, dark: Record<TokenName,string> }`. `contrastRatio(a: string, b: string): number`.

- [ ] **Step 1: Skriv kontrasttesten (feiler)**

```ts
// src/styles/contrast.test.ts
import { describe, it, expect } from 'vitest'
import { contrastRatio } from './contrast'
import { TOKENS } from './tokens'

describe('contrastRatio', () => {
  it('gir 21 for svart mot hvit', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 0)
  })
})

describe.each(['light', 'dark'] as const)('tokens (%s)', (mode) => {
  const t = TOKENS[mode]
  it.each([
    ['ink', 'paper', 7],
    ['ink', 'paper-raised', 7],
    ['ink-muted', 'paper', 4.5],
    ['ink-muted', 'paper-raised', 4.5],
    ['pen', 'paper', 4.5],
    ['pen', 'pen-wash', 4.5],
    ['redpencil', 'paper', 4.5],
  ] as const)('%s mot %s ≥ %s:1', (fg, bg, min) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(min)
  })
})
```

- [ ] **Step 2: Kjør og se at den feiler.** Run: `npx vitest run src/styles` → FAIL (moduler finnes ikke).

- [ ] **Step 3: Implementer `contrast.ts` og `tokens.ts`**

```ts
// src/styles/contrast.ts
// WCAG 2.1 relativ luminans. Brukes av testene for å holde tokenparene lovlige.
function channel(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}
```

```ts
// src/styles/tokens.ts
// Speiler CSS-variablene i globals.css. CSS er sannheten for rendering;
// denne fila finnes for testene og for SVG som trenger faktiske verdier.
// Endrer du en farge, endre den begge steder — kontrasttesten fanger feil.
export type TokenName =
  | 'paper' | 'paper-raised' | 'ink' | 'ink-muted' | 'rule' | 'pen' | 'pen-wash' | 'redpencil'

export const TOKENS: Record<'light' | 'dark', Record<TokenName, string>> = {
  light: {
    paper: '#F3EEE4', 'paper-raised': '#FAF7F1', ink: '#27231E', 'ink-muted': '#6B6257',
    rule: '#DDD3C3', pen: '#26386E', 'pen-wash': '#E4E7F1', redpencil: '#B23A2A',
  },
  dark: {
    paper: '#1B1916', 'paper-raised': '#24211D', ink: '#ECE5D8', 'ink-muted': '#A69D90',
    rule: '#3A352F', pen: '#A9B8EE', 'pen-wash': '#262B3D', redpencil: '#EE8A78',
  },
}
```

- [ ] **Step 4: Kjør testen.** Run: `npx vitest run src/styles` → PASS. Hvis et par feiler, juster verdien i *både* `tokens.ts` og CSS (Step 5) til den består, og noter endringen i commit-meldingen.

- [ ] **Step 5: Legg tokens til i `globals.css`**, øverst etter importene, *før* den gamle `:root`-blokken:

```css
/* ── Dagbok ─────────────────────────────────────────────────────────────
   Eneste kilde til farge. Lys er standard; mørk følger systemet, og
   html[data-theme] overstyrer begge veier. Hold i synk med styles/tokens.ts. */
:root {
  --paper: #F3EEE4; --paper-raised: #FAF7F1; --ink: #27231E; --ink-muted: #6B6257;
  --rule: #DDD3C3; --pen: #26386E; --pen-wash: #E4E7F1; --redpencil: #B23A2A;
  --shadow-float: 0 12px 32px rgb(39 35 30 / 0.12);

  --tag-sage-fill: #D5DDC8;  --tag-sage-stroke: #6E8559;
  --tag-ochre-fill: #EBD9AE; --tag-ochre-stroke: #9A7426;
  --tag-slate-fill: #CCD7E0; --tag-slate-stroke: #4F6E86;
  --tag-plum-fill: #DDD0E3;  --tag-plum-stroke: #7A5A8C;
  --tag-rose-fill: #EDCFCB;  --tag-rose-stroke: #A2544C;
  --tag-teal-fill: #C7DEDA;  --tag-teal-stroke: #3F7F77;
  --tag-clay-fill: #E6D0BD;  --tag-clay-stroke: #9A5F33;
  --tag-stone-fill: #DAD6CF; --tag-stone-stroke: #6B655C;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #1B1916; --paper-raised: #24211D; --ink: #ECE5D8; --ink-muted: #A69D90;
    --rule: #3A352F; --pen: #A9B8EE; --pen-wash: #262B3D; --redpencil: #EE8A78;
    --shadow-float: 0 12px 32px rgb(0 0 0 / 0.45);
    --tag-sage-fill: #2E3628;  --tag-sage-stroke: #A3B98D;
    --tag-ochre-fill: #3A3120; --tag-ochre-stroke: #D9B266;
    --tag-slate-fill: #243039; --tag-slate-stroke: #93B1C8;
    --tag-plum-fill: #33283A;  --tag-plum-stroke: #C0A2D2;
    --tag-rose-fill: #3D2826;  --tag-rose-stroke: #E0A097;
    --tag-teal-fill: #203533;  --tag-teal-stroke: #86C4BA;
    --tag-clay-fill: #3A2B20;  --tag-clay-stroke: #D6A27A;
    --tag-stone-fill: #2F2C28; --tag-stone-stroke: #B4ADA2;
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  /* identisk med blokken over */
}
```

Kopier alle deklarasjonene fra media-blokken inn i `:root[data-theme="dark"]` (gjentakelsen er bevisst, fordi CSS ikke kan dele en deklarasjonsblokk mellom en media query og en attributtselektor uten preprosessor).

Legg til i den eksisterende `@theme inline`-blokken:

```css
  --color-paper: var(--paper);
  --color-paper-raised: var(--paper-raised);
  --color-ink: var(--ink);
  --color-ink-muted: var(--ink-muted);
  --color-rule: var(--rule);
  --color-pen: var(--pen);
  --color-pen-wash: var(--pen-wash);
  --color-redpencil: var(--redpencil);
  --font-display: var(--font-fraunces), Georgia, serif;
  --font-sans: var(--font-instrument), system-ui, sans-serif;
  --shadow-float: var(--shadow-float);
  --breakpoint-desk: 1024px;
```

Legg til nederst:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: Fonter og metadata i `layout.tsx`**

```tsx
import { Fraunces, Instrument_Sans } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
})
const instrument = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument' })

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3EEE4' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1916' },
  ],
}
```

`<html lang="nb" className={`${fraunces.variable} ${instrument.variable}`} suppressHydrationWarning>`. `suppressHydrationWarning` trengs fordi temaskriptet i Task 9 setter `data-theme` før hydrering. `<body className="bg-paper text-ink font-sans antialiased">`. Fjern Geist.

- [ ] **Step 7:** `npm install lucide-react`.

- [ ] **Step 8: Verifiser.** Run: `npx vitest run && npm run build`. Forventet: grønt. (Siden ser fortsatt gammel ut, fordi komponentene bruker de gamle klassene.)

- [ ] **Step 9: Commit** `Add Dagbok design tokens, fonts and dark mode`

---

### Task 2: i18n-ordbok og formateringshjelpere

**Files:**
- Create: `src/i18n/nb.ts`, `src/i18n/index.ts`, `src/domain/format.ts`, `src/domain/format.test.ts`

**Interfaces:**
- Produces: `t` (typet objekt, se under). `relativeDay(date: Date, now?: Date): string` («i dag», «i går», «3 dager siden», «12. sep», «12. sep 2025» for et annet år). `formatDate(date: Date): string` («14. mars 2026»). `initialsOf(name: string): string` (maks 2 tegn, store bokstaver).

- [ ] **Step 1: Test (feiler)**

```ts
// src/domain/format.test.ts
import { describe, it, expect } from 'vitest'
import { relativeDay, initialsOf } from './format'

// 25. sep 2026 kl. 00:30 lokal tid — rett etter midnatt, der UTC-baserte
// beregninger feilaktig sier at gårsdagens logg var «i dag».
const NOW = new Date(2026, 8, 25, 0, 30)

describe('relativeDay', () => {
  it('sier «i dag» for tidligere samme lokale døgn', () => {
    expect(relativeDay(new Date(2026, 8, 25, 0, 5), NOW)).toBe('i dag')
  })
  it('sier «i går» for sent i går kveld', () => {
    expect(relativeDay(new Date(2026, 8, 24, 23, 50), NOW)).toBe('i går')
  })
  it('teller dager innen en uke', () => {
    expect(relativeDay(new Date(2026, 8, 21, 12), NOW)).toBe('4 dager siden')
  })
  it('viser dato for eldre i år', () => {
    expect(relativeDay(new Date(2026, 5, 3), NOW)).toBe('3. juni')
  })
  it('tar med år for tidligere år', () => {
    expect(relativeDay(new Date(2025, 11, 24), NOW)).toBe('24. des. 2025')
  })
})

describe('initialsOf', () => {
  it('tar første bokstav i to første ord', () => {
    expect(initialsOf('Ingrid Aas')).toBe('IA')
  })
  it('behandler bindestrek som ett ord og kutter til to', () => {
    expect(initialsOf('Kristine Margrethe Aas-Johansen')).toBe('KM')
  })
  it('tåler ett navn og ekstra mellomrom', () => {
    expect(initialsOf('  mamma ')).toBe('M')
  })
})
```

- [ ] **Step 2:** `npx vitest run src/domain` → FAIL.

- [ ] **Step 3: Implementer**

```ts
// src/domain/format.ts
const LOCALE = 'nb-NO'
const DAY_MS = 86_400_000

// Kalenderdager i lokal tid: midnatt til midnatt, ikke 24-timersvinduer.
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function relativeDay(date: Date, now: Date = new Date()): string {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)
  if (days === 0) return 'i dag'
  if (days === 1) return 'i går'
  if (days > 1 && days < 7) return `${days} dager siden`
  const sameYear = date.getFullYear() === now.getFullYear()
  return date.toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: sameYear ? 'long' : 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })
}

export function initialsOf(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}
```

Hvis `toLocaleDateString` i Node gir en litt annen form enn forventet (for eksempel «3. juni» mot «3. juni»), juster *testens* forventning til Nodes faktiske `nb-NO`-utdata og kommenter det. Oppførselen, altså dag, måned og år når det trengs, er det som testes.

- [ ] **Step 4: `src/i18n/nb.ts`**: flytt *alle* synlige strenger fra komponentene hit mens hver komponent restyles (Task 5–9). Start med denne strukturen og utvid den per task:

```ts
// src/i18n/nb.ts
// All synlig tekst. Nøkler grupperes etter skjerm; funksjoner der teksten
// har variabler. Et annet språk er en fil med samme form.
export const nb = {
  app: { name: 'Vennekart', tagline: 'En dagbok over menneskene dine.' },
  nav: { map: 'Kart', settings: 'Innstillinger', signOut: 'Logg ut', signIn: 'Logg inn med Google' },
  common: {
    save: 'Lagre', saving: 'Lagrer …', cancel: 'Avbryt', close: 'Lukk', edit: 'Rediger',
    delete: 'Slett', optional: 'Valgfritt', loading: 'Laster …',
  },
  relationType: {
    FRIEND: 'Venn', FAMILY: 'Familie', COLLEAGUE: 'Kollega', PARTNER: 'Partner',
    ACQUAINTANCE: 'Bekjent', OTHER: 'Annet',
  },
  logType: { MET: 'Møttes', CALLED: 'Ringte', MESSAGE: 'Melding', OTHER: 'Annet' },
  cadence: {
    label: 'Minn meg på å ta kontakt',
    every: (w: number) => (w === 1 ? 'Hver uke' : `Hver ${w}. uke`),
    never: 'Aldri',
    summary: (w: number | null) =>
      w === null ? 'ingen påminnelser' : w === 1 ? 'påminnelse hver uke' : `påminnelse hver ${w}. uke`,
  },
} as const

export type Messages = typeof nb
```

```ts
// src/i18n/index.ts
import { nb } from './nb'
export const t = nb
export type { Messages } from './nb'
```

- [ ] **Step 5:** `npx vitest run` → PASS. **Commit** `Add i18n dictionary and locale-aware formatting`

---

### Task 3: UI-primitiver

**Files:**
- Rewrite: `src/components/ui/Button.tsx`, `src/components/ui/TextField.tsx`
- Create: `src/components/ui/{Select,Chip,Avatar,Sheet,SectionHeading,EmptyState}.tsx`
- Create: `src/components/ui/{Avatar,Chip,Sheet}.test.tsx`
- Create: `src/lib/palette.ts`
- Modify: `src/components/ui/index.ts`. Behold `Dialog.tsx` til Task 10, der den slettes.

**Interfaces:**
- Produces:
  - `Button({ variant?: 'primary'|'secondary'|'quiet'|'danger', size?: 'md'|'lg', ...AriaButtonProps })`
  - `TextField({ label, description?, errorMessage?, multiline?, serif?, placeholder?, rows?, ... })`
  - `Select<T extends string>({ label, value: T, onChange: (v: T) => void, options: { value: T; label: string }[] })`
  - `ChipGroup<T extends string>({ label, value: T, onChange, options: { value: T; label: string; tint?: TagColor }[] })`: ett valg, radio-semantikk
  - `Avatar({ name: string, tint?: TagColor, src?: string|null, size?: 'sm'|'md'|'lg'|'xl' })`: sm 28, md 40, lg 56, xl 88 px
  - `Sheet({ isOpen, onOpenChange, title, children, size?: 'md'|'lg' })`: bunnark under 640 px, sentrert dialog over
  - `SectionHeading({ children, action?: ReactNode })`: Fraunces italic 21
  - `EmptyState({ title, body?, action?: ReactNode })`
  - `palette.ts`: `type TagColor = 'sage'|'ochre'|'slate'|'plum'|'rose'|'teal'|'clay'|'stone'`, `TAG_COLORS: TagColor[]`, `tagFill(c)` → `'var(--tag-c-fill)'`, `tagStroke(c)` → `'var(--tag-c-stroke)'`, `TYPE_TINT: Record<RelationshipType, TagColor>` = `{ FRIEND: 'ochre', FAMILY: 'slate', COLLEAGUE: 'teal', PARTNER: 'rose', ACQUAINTANCE: 'stone', OTHER: 'clay' }`

- [ ] **Step 1: Tester (feiler)**

```tsx
// src/components/ui/Avatar.test.tsx
import { render, screen } from '@testing-library/react'
import { Avatar } from './Avatar'

it('viser initialer og har navnet som tilgjengelig etikett', () => {
  render(<Avatar name="Ingrid Aas" />)
  expect(screen.getByRole('img', { name: 'Ingrid Aas' })).toHaveTextContent('IA')
})

it('viser bilde når src finnes', () => {
  render(<Avatar name="Ingrid Aas" src="/ingrid.jpg" />)
  expect(screen.getByRole('img', { name: 'Ingrid Aas' }).querySelector('img')).toBeInTheDocument()
})
```

```tsx
// src/components/ui/Chip.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChipGroup } from './Chip'

it('velger med mus og piltaster', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(
    <ChipGroup label="Type" value="MET" onChange={onChange}
      options={[{ value: 'MET', label: 'Møttes' }, { value: 'CALLED', label: 'Ringte' }]} />,
  )
  await user.click(screen.getByRole('radio', { name: 'Ringte' }))
  expect(onChange).toHaveBeenLastCalledWith('CALLED')
})
```

```tsx
// src/components/ui/Sheet.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Sheet } from './Sheet'

it('har tittel, fanger fokus og lukkes med Escape', async () => {
  const user = userEvent.setup()
  const onOpenChange = vi.fn()
  render(
    <Sheet isOpen onOpenChange={onOpenChange} title="Ny person">
      <input aria-label="Navn" />
    </Sheet>,
  )
  expect(screen.getByRole('dialog', { name: 'Ny person' })).toBeInTheDocument()
  await user.keyboard('{Escape}')
  expect(onOpenChange).toHaveBeenCalledWith(false)
})
```

- [ ] **Step 2:** `npx vitest run src/components/ui` → FAIL.

- [ ] **Step 3: Implementer.** Stilregler, der alle klassene bruker tokens:

- **Button:** `inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors duration-150 outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen data-[focus-visible]:ring-offset-2 data-[focus-visible]:ring-offset-paper data-[disabled]:opacity-40`
  - primary: `bg-ink text-paper data-[hovered]:bg-ink/90 data-[pressed]:bg-ink/80`
  - secondary: `bg-paper-raised text-ink border border-rule data-[hovered]:border-ink-muted`
  - quiet: `text-ink-muted data-[hovered]:text-ink`
  - danger: `bg-paper-raised text-redpencil border border-redpencil/50`
  - størrelser: md `h-10 px-4 text-[14px]`, lg `h-12 px-5 text-[15px]`
- **TextField:** etikett `text-[13px] text-ink-muted mb-1.5`. Kontroll `w-full rounded-[10px] bg-paper-raised border border-rule px-3 py-2.5 text-ink placeholder:text-ink-muted/70 outline-none data-[focused]:border-pen data-[focused]:ring-2 data-[focused]:ring-pen/20 data-[invalid]:border-redpencil`. `serif` legger til `font-display text-[18px] leading-relaxed`. Feilmelding `text-[13px] text-redpencil`.
- **Select:** react-aria `Select` + `Popover` + `ListBox`. Knappen er stylet som TextField-kontrollen med en `ChevronDown`-ikon. Popoveren bruker `bg-paper-raised border border-rule rounded-[10px] shadow-float`, og elementene `px-3 py-2 data-[focused]:bg-pen-wash data-[selected]:font-medium`.
- **ChipGroup:** react-aria `RadioGroup` + `Radio`. Chip: `h-9 px-3.5 rounded-full border border-rule bg-paper-raised text-[13px] text-ink inline-flex items-center gap-2 data-[selected]:bg-ink data-[selected]:text-paper data-[selected]:border-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-pen`. Hvis `tint` er satt, vises en prikk på 8 px med `style={{ background: tagStroke(tint) }}`.
- **Avatar:** `<span role="img" aria-label={name}>` som er rund, med `style={{ background: tagFill(tint ?? 'stone'), color: 'var(--ink)', boxShadow: 'inset 0 0 0 1.25px var(--ink)' }}` og initialer i `font-sans font-semibold`. Når `src` finnes, vises `next/image` `fill` med `object-cover` og `alt=""`, siden etiketten allerede ligger på omslaget. Størrelsene bestemmer tekststørrelsen (sm 11, md 13, lg 16, xl 26).
- **Sheet:** `ModalOverlay` med `fixed inset-0 z-50 bg-ink/30 flex items-end sm:items-center justify-center sm:p-6` og fade-animasjon på 250 ms. `Modal` med `w-full sm:max-w-lg (lg: sm:max-w-2xl) max-h-[92dvh] overflow-y-auto bg-paper rounded-t-[16px] sm:rounded-[16px] shadow-float`. Den glir opp på mobil (`data-[entering]:translate-y-6`) og skaleres fra 0,98 på PC. Innholdet er en `Dialog` med en topplinje (`Heading` i `font-display text-[21px] italic`) og en lukkeknapp (`Button quiet` med `X`-ikon og `aria-label={t.common.close}`). Padding er `px-5 pb-6 pt-4 sm:px-7`.
- **SectionHeading:** `flex items-baseline justify-between`, `h2.font-display italic text-[21px] text-ink`.
- **EmptyState:** sentrert, med tittel i `font-display text-[21px]`, brødtekst i `text-ink-muted text-[14px] max-w-xs` og en valgfri handling under.

- [ ] **Step 4:** `npx vitest run src/components/ui` → PASS.
- [ ] **Step 5: Commit** `Add Dagbok UI primitives`

---

### Task 4: App-header og utlogget forside

**Files:** Create `src/components/AppHeader.tsx`. Delete `src/components/Navbar.tsx`. Modify `src/app/layout.tsx` og `src/app/page.tsx` (bare grenen for utlogget tilstand), og `src/i18n/nb.ts`.

- [ ] **Step 1:**
  - **Header:**
    - Høyde 64 px, `border-b border-rule`, `px-4 desk:px-8`, `flex items-center gap-6`.
    - Til venstre står «Vennekart» i `font-display italic text-[24px] tracking-tight` som en lenke til `/`.
    - Navigasjonslenkene (`t.nav.map` og `t.nav.settings`) er `text-[14px] text-ink-muted`. Den aktive lenken (`usePathname`) får `text-ink` og en understrek på 1,5 px med `underline-offset-[6px]`.
    - Til høyre står en Avatar (`md`) med brukerens bilde, og en «Logg ut»-knapp (`quiet`) som er synlig fra `desk:`.
  - **Mobil:** navigasjonslenkene skjules under `desk:`. Header viser bare logo og avatar. En avatarmeny med Innstillinger og Logg ut bruker react-aria `MenuTrigger`.
  - **Utlogget forside (`page.tsx`):**
    - Sentrert kolonne, `max-w-md`.
    - Tittelen «Vennekart» står i `font-display italic text-[46px] desk:text-[64px] leading-none`.
    - Under står en ingress i `font-display text-[21px] text-ink-muted`: «En dagbok over menneskene dine: hva dere snakket om, og hva du bør spørre om neste gang.»
    - Så en `Button primary lg` med teksten `t.nav.signIn`.
    - Over tittelen står en liten SVG-illustrasjon (120×80) av fem blekksirkler med streker, altså kartets signatur i miniatyr. Den bruker `stroke="var(--ink)"` og `fill` med to taggfarger.
- [ ] **Step 2:** `npm run build`. Start dev-serveren, åpne `/` utlogget og ta skjermbilder i lys og mørk modus (Chrome DevTools > Rendering > prefers-color-scheme).
- [ ] **Step 3: Commit** `Restyle header and signed-out page`

---

### Task 5: Kartet i blekk

**Files:** Modify `src/components/graph/{VennekartCanvas,PersonNode,MeNode,RelationshipEdge}.tsx`. Bruk `src/lib/palette.ts` og `src/domain/format.ts`.

- [ ] **Step 1: PersonNode**
  - `Avatar size="lg"` (56 px) med `tint={TYPE_TINT[d.type]}`. `PersonNodeData` får `type: RelationshipType`. Personens `color` brukes ikke lenger.
  - Valgt node får en ring med `outline: 1.5px solid var(--pen)` og `outline-offset: 4px`. Ved hover skaleres noden til 1,04 over 150 ms.
  - Navnet står under i `font-display text-[14px] text-ink`, maks 120 px bredt, med `truncate`. Ingen pille-bakgrunn: teksten står rett på papiret, med `paint-order: stroke` og en 3 px tekstkant i `var(--paper)`, slik at teksten er lesbar over streker.
  - Dra-knotten beholdes, men stylet som `bg-pen border-2 border-paper`, 12 px.
  - Hurtighandlinger når noden er valgt: to små `Button secondary`-knapper med ikonene `PenLine` («Logg») og `User` («Profil»), med tekst fra i18n.
- [ ] **Step 2: MeNode:** en fylt blekksirkel på 72 px (`bg-ink text-paper`), eller bildet med blekkring. Etiketten «Deg» står i `font-display italic text-[14px]`.
- [ ] **Step 3: RelationshipEdge**
  - Eiker (spoke) fra deg har `stroke: var(--ink)`, `strokeOpacity: 0.55`, `strokeWidth: 1.5` og `strokeLinecap: round`, uten stiplet linje.
  - Kanter mellom andre (between) har `stroke: var(--ink-muted)`, `strokeOpacity: 0.6` og `strokeWidth: 1`.
  - Er typen `PARTNER`, får kanten `stroke: tagStroke('rose')` og `strokeDasharray: '6 4'`.
  - Etiketter (brukes fra delprosjekt 1) står i `font-display italic text-[13px] text-ink-muted` uten bakgrunn.
  - Kanten får `data.type` i stedet for `data.color`.
- [ ] **Step 4: VennekartCanvas**
  - Ingen prikk-bakgrunn: bruk `Background variant={BackgroundVariant.Dots}` med `color="var(--rule)"`, `gap={28}` og `size={1.2}`, altså diskret papirstruktur.
  - `Controls` restyles i `globals.css` med `.react-flow__controls` og `-button` til `bg-paper-raised border-rule text-ink`, med 10 px radius.
  - Flytende knapper nederst til høyre:
    - `Button secondary` med `Link2`-ikon og teksten «Relasjon».
    - `Button primary lg` med `UserPlus`-ikon og teksten «Ny person».
  - Fargeforklaringen nederst til venstre blir en kompakt liste med prikker (`tagStroke`) og etiketter fra `t.relationType`, med `bg-paper-raised/90 border border-rule rounded-[10px]`.
  - Den tomme tilstanden bruker `EmptyState` med tittel «Kartet ditt er tomt», brødtekst «Legg til en du har truffet i det siste.» og knappen «Ny person».
- [ ] **Step 5:** Kjør dev-serveren og sjekk kartet i begge temaer: dra en node, lag en relasjon ved å dra fra knotten, og åpne en profil. Ta skjermbilder.
- [ ] **Step 6: Commit** `Draw the map in ink`

---

### Task 6: Profil, profilskall og loggpanel

**Files:** Modify `src/components/person/{PersonProfile,PersonModalShell,LogContactPanel,EditPersonForm}.tsx`, `src/app/person/[id]/page.tsx`, `src/app/person/[id]/edit/page.tsx` og `src/app/@modal/(.)person/[id]/edit/page.tsx`.

- [ ] **Step 1: PersonModalShell:** bruk samme overlegg og ark som `Sheet` (`size="lg"`). Behold rutelogikken (`EXIT_MS`, `router.push('/')`). Du kan ikke bruke `Sheet` direkte, fordi skallet styrer `isOpen` selv, så trekk ut stilstrengene til `src/components/ui/sheet-styles.ts` og bruk dem begge steder.
- [ ] **Step 2: PersonProfile.** Layouten følger skissen (artifact `Main.dc.html`, høyre panel):
  - **Øverst:**
    - En linje med små bokstaver: `text-[12px] tracking-[0.14em] uppercase text-ink-muted` med typen fra `t.relationType`.
    - Navnet i `font-display text-[34px] desk:text-[46px] leading-[1.05] tracking-tight`.
    - En metalinje: `cadence.summary` og bursdag.
    - Avataren (`xl`) står til venstre på PC og over navnet på mobil.
    - «Rediger» er en `Button secondary` med `Pencil`-ikon.
  - **Notat:** `SectionHeading` («Notat»), og teksten i `font-display text-[17px] leading-relaxed whitespace-pre-wrap`.
  - **Påminnelser:** `SectionHeading` og en liste der hvert element har `Bell`-ikon (manuell) eller `Clock`-ikon (automatisk) og tekst i `text-[15px]`.
  - **Kontaktlogg:**
    - `SectionHeading` med `action` = «Logg kontakt».
    - Hver logg har en tidslinje-prikk på 6 px `bg-ink` og en loddrett linje `border-l border-rule`.
    - Typen står i `text-[13px] font-medium`, og datoen med `relativeDay` i `text-ink-muted`.
    - Notatet står i `font-display text-[16px]`.
    - Emoji erstattes med lucide-ikoner: MET `Coffee`, CALLED `Phone`, MESSAGE `MessageCircle`, OTHER `PenLine`.
  - Det blir ingen kort i kort. Seksjonene skilles med 32 px luft og `border-t border-rule pt-6`.
- [ ] **Step 3: LogContactPanel:** bruk `ChipGroup` til typen, `TextField` med `type="date"` og `TextField multiline serif` til notatet. Tekstene kommer fra i18n, og feilmeldingen står i `text-redpencil`.
- [ ] **Step 4: EditPersonForm:** Fjern fargevelgeren og `color` fra PATCH-kallet. Bruk `ChipGroup` til typen med `tint={TYPE_TINT[t]}`, og `Select` til kadensen. Bekreftelse av sletting skjer i to trinn: «Slett» er en `quiet`-knapp, og «Slett for godt» en `danger`-knapp. Forklaringsteksten står i `text-ink-muted`.
- [ ] **Step 5: Sidene** (`person/[id]`, `edit`) får en `max-w-2xl`-kolonne med en tilbakelenke (`ArrowLeft`-ikon) i `text-ink-muted`.
- [ ] **Step 6:** Sjekk i nettleseren: åpne en profil fra kartet (vises som modal), rediger, lagre, logg kontakt og lukk. Test i begge temaer og på 390 px bredde.
- [ ] **Step 7: Commit** `Restyle profile and person editing`

---

### Task 7: Ark for ny person, ny relasjon og ny logg

**Files:** Modify `src/components/modals/{AddPersonModal,AddRelationshipModal,LogEntryModal}.tsx`. Delete `src/components/modals/Modal.tsx`.

- [ ] **Step 1:** Alle tre bruker `Sheet`. Native `<select>` byttes til `Select`, og knapperader til `ChipGroup`. Fargevelgeren i AddPersonModal fjernes, og `color` sendes ikke lenger. APIet setter da standardfargen, og kolonnen fjernes i delprosjekt 1.
- [ ] **Step 2:** Den hardkodede teksten «14 av personene dine har ingen logg …» i AddPersonModal fjernes. Den er utdatert data i kopien. Hjelpeteksten blir: «Foreslått fra relasjonstypen. Velg «Aldri» for folk du bare vil ha på kartet.»
- [ ] **Step 3:** LogEntryModal får samme datofiks som LogContactPanel: `new Date().toLocaleDateString('sv-SE')` i stedet for `toISOString()`, som gir feil dato etter midnatt. Legg `today()` i `src/domain/format.ts` som `todayISO(now?: Date): string`, og skriv en test for den: `todayISO(new Date(2026, 8, 25, 0, 30))` skal gi `'2026-09-25'`. Bruk den begge steder.
- [ ] **Step 4:** Sjekk i nettleseren: legg til en person, en relasjon og en logg fra kartet, på mobilbredde (arket nederst) og PC-bredde (sentrert).
- [ ] **Step 5: Commit** `Move creation flows to sheets`

---

### Task 8: Forsiden, påminnelser og tidslinje

**Files:** Modify `src/app/page.tsx`, `src/components/RemindersSidebar.tsx` og `src/components/TimelineStripe.tsx`.

- [ ] **Step 1: Layout (innlogget):**
  - Under 1024 px: tidslinje-stripen øverst, kartet med full høyde (`h-[calc(100dvh-64px-52px)]`), og påminnelsene som en knapp med merke som åpner dem i et `Sheet`.
  - Fra 1024 px (`desk:`) er det to kolonner: kartet (`flex-1`) og et sidepanel på 400 px (`bg-paper-raised border-l border-rule`) med påminnelsene.
- [ ] **Step 2: RemindersSidebar** blir `RemindersPanel`:
  - `SectionHeading` «Bør ta kontakt».
  - Hvert element er en `Link` til profilen med Avatar (`sm`, `TYPE_TINT` hentes ikke, så bruk `stone` til personens type finnes i responsen. Legg til `personType` i `ReminderResponse` fra `/api/reminders`, som er en endring på én linje i ruta).
  - Hvert element viser meldingen i `text-[15px]` og «Utsett en uke» eller «Avvis» som en `quiet`-knapp som alltid er synlig. Hover-skjulte kontroller fungerer ikke på touch, og har dårlig oppdagbarhet.
  - Tom tilstand: «Ingen du bør ta kontakt med akkurat nå.»
- [ ] **Step 3: TimelineStripe:**
  - Linje: `border-b border-rule bg-paper px-4 desk:px-8 h-[52px]`.
  - Hver logg viser navnet i `font-display` og datoen med `relativeDay`. Ikonet kommer fra samme `LOG_ICON`-tabell som i Task 6, som legges i `src/components/log-icons.ts`.
  - Utvidet liste med `Disclosure` fra react-aria. En `<div onClick>` er ikke tilgjengelig.
  - «Logg kontakt» er en `Button quiet` med `PenLine`-ikon.
- [ ] **Step 4:** Sjekk i nettleseren i begge temaer og begge bredder: utsett en påminnelse, og utvid og lukk tidslinjen med tastaturet.
- [ ] **Step 5: Commit** `Restyle home, reminders and timeline`

---

### Task 9: Innstillinger og temavalg

**Files:** Modify `src/app/settings/page.tsx` og `src/app/layout.tsx`. Create `src/components/ThemeToggle.tsx` og `src/components/theme-script.ts`.

- [ ] **Step 1: Temaskript:** et lite inline-skript i `<head>` (`dangerouslySetInnerHTML`) leser `localStorage.getItem('theme')`. Er verdien `'light'` eller `'dark'`, settes `document.documentElement.dataset.theme` før maling, så siden ikke blinker. Skriptet er pakket i `try/catch`. Innholdet ligger som konstant i `theme-script.ts`.
- [ ] **Step 2: ThemeToggle:** en `ChipGroup` med «System», «Lys» og «Mørk». Valget skrives til `localStorage` og `data-theme`. Ved «System» fjernes både nøkkelen og attributtet.
- [ ] **Step 3: Settings:**
  - Konto: Avatar `lg`, navn og e-post.
  - «Utseende» med ThemeToggle.
  - «Relasjonstyper» med prikk og etikett per type. Hex-kolonnen fjernes, siden den ikke er noe brukeren styrer.
  - Seksjonene bruker `SectionHeading`.
- [ ] **Step 4:** Sjekk: bytt tema, last siden på nytt (ingen blink) og sett systemtemaet tilbake.
- [ ] **Step 5: Commit** `Add theme setting and restyle settings`

---

### Task 10: Rydd bort det gamle

**Files:**
- Delete `src/components/ui/Dialog.tsx`, `src/lib/relationship-colors.ts` (og testen), `src/app/about/` og `src/app/contact/`.
- `globals.css`: fjern `spin-3d`, `hover-glitch`, `glass-card` og den gamle `:root`-blokken (`--Primary`, `--Accent`, `--Text`, `--Glass`, `--GlassBorder`), samt de tilhørende `--color-*` og `--breakpoint-navbar` i `@theme`.
- Fjern også font-kommentarblokken fra malen.

- [ ] **Step 1:** `relationship-colors.ts` brukes fortsatt av API-ruta `relationships` (`getRelationshipColor`). Ruta skal fortsatt skrive `color`, fordi kolonnen finnes til delprosjekt 1. Legg `LEGACY_EDGE_COLOR = '#27231E'` inline i ruta med en kommentar om at kolonnen fjernes i delprosjekt 1, og slett modulen og testen.
- [ ] **Step 2: Grep etter rester. Hver av disse skal gi 0 treff:**

```bash
grep -rnE "Primary|Accent|text-Text|bg-Glass|GlassBorder|glass-card|hover-glitch|spin-3d|navbar:" src
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src
grep -rnE "#[0-9a-fA-F]{6}" src/components src/app --include=*.tsx
```

Den siste kan gi treff for SVG-illustrasjonen i Task 4, som skal bruke `var(--…)`. Erstatt alle treff.
- [ ] **Step 3:** `npm run lint && npm test && npm run build` skal være grønt.
- [ ] **Step 4: Commit** `Remove legacy theme, template leftovers and emoji`

---

### Task 11: Verifisering og PR

- [ ] **Step 1:** Kjør dev-serveren mot dev-databasen og gå gjennom alle flyter i nettleseren på 390 px og 1440 px, i lys og mørk modus: utlogget forside, kart (dra, koble), ny person, ny relasjon, ny logg, profil, rediger, slett, påminnelser, tidslinje og innstillinger.
- [ ] **Step 2:** Sjekk tilgjengeligheten med tastaturet alene gjennom en hel logging. Kjør Lighthouse Accessibility på `/` og en profil, og målet er ≥ 95.
- [ ] **Step 3:** Push branchen og åpne en PR mot `main` med skjermbilder: 4 varianter av kart og profil (lys og mørk, mobil og PC). Beskriv beslutningene fra «Beslutninger du kan overprøve» som gjelder delprosjekt 0.
