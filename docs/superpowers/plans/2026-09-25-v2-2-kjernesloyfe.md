# V2 · Delprosjekt 2 — Kjernesløyfen · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjøre sløyfen fange → huske → følge opp skarp:
- rask logging fra hvor som helst, som kjenner igjen folk i teksten og lukker og åpner tråder i samme slengen
- «I dag» som startskjerm på mobil og som sidepanel på PC
- en profil der fakta og faser kan redigeres
- koblingsvarsel («Hanna og Ingrid er to steg fra hverandre»)
- PWA
- bilder, når en Blob-lagring finnes

**Architecture:** Bygger på serverlaget fra delprosjekt 1.
- **Ny domenelogikk:** `mentions.ts` og `paths.ts`, som er rene og testet.
- **Handlinger:** `createLog` utvides til å åpne og lukke tråder i én transaksjon.
- **Navigasjon:** et nytt parallellspor `@panel` erstatter `@modal`. Profilen vises i sidepanelet på PC og som helskjermsark på mobil, bare styrt av CSS.
- **Klientkomponenter:** skriv-arket (`Composer`), og en `AppShell` med fanelinje på mobil.

**Tech Stack:** Som delprosjekt 1, pluss `@vercel/blob` (bare Task 9), og Next `app/manifest.ts`.

**Spec:** `docs/superpowers/specs/2026-09-25-v2-fundament-og-kjernesloyfe-design.md` (seksjonen «Delprosjekt 2»)

**Bygger på:** PR 1 (`Andreasvege/v2-1-datafundament`).

## Global Constraints

- Alt fra planene for delprosjekt 0 og 1 gjelder fortsatt: tokens, i18n, `requireUserId`, zod, `assertAllOwned` og revalidering.
- `createLog` er én transaksjon: loggen, deltakerne, nye tråder og lukkede tråder lagres sammen, eller ingenting lagres.
- Rask logging må kunne gjøres på under 30 sekunder på mobil. Det betyr: ingen påkrevde felt bortsett fra minst én person, fokus i tekstfeltet når arket åpnes, og lagring med ⌘/Ctrl+Enter.
- Kladden lagres i `localStorage` (try/catch) til loggen er lagret.
- Tastaturet: `N` åpner skriv-arket overalt, bortsett fra når du står i et tekstfelt.

## Review Focus

- **Navn som er vanlige ord:** en person som heter «Vår» eller «Mai» skal ikke bli foreslått når du skriver «vår tur i mai», med mindre det skjer ved ordgrense og med stor forbokstav. *Test:* `mentions.test.ts` i Task 1.
- **To med samme fornavn:** «Ingrid» med to Ingrid-er foreslår begge, og legger ikke til noen av dem automatisk. *Test:* `mentions.test.ts` i Task 1.
- **Sti via meg:** varselet skal aldri si at to personer er «to steg fra hverandre via deg». Stier går bare gjennom relasjoner mellom andre. *Test:* `paths.test.ts` i Task 1.
- **Å lukke en tråd som tilhører en annen persons logg:** er tråden ikke brukerens, skal hele loggen avvises. *Test:* skjemaet og eierskapet i Task 2.
- **Dobbeltklikk på «Lagre»:** gir ikke to logger. Knappen deaktiveres mens lagringen pågår, og kladden tømmes først når lagringen har lyktes. Dekkes av komponenttesten i Task 4.

---

### Task 1: Domenelogikk: nevnte personer og stier

**Files:** Create `src/domain/mentions.ts` og `src/domain/paths.ts`, med tester.

**Interfaces:**
- `findMentions(text: string, persons: { id: string; name: string }[]): { sure: string[]; maybe: { word: string; ids: string[] }[] }`
- `shortestPath(edges: [string, string][], from: string, to: string, maxHops = 4): string[] | null`
- `newProximities(before: [string,string][], after: [string,string][], interesting: Set<string>, maxHops = 3): { a: string; b: string; path: string[] }[]`

**Regler for `findMentions`:**
- Treff på *fullt navn* (alle ordene i rekkefølge) uten hensyn til store og små bokstaver.
- Treff på *fornavn* bare hvis ordet starter med stor bokstav i teksten og står ved ordgrense. Genitiv er tillatt («Ingrids», «Ingrid's»).
- Fornavn som bare én person har → `sure`. Fornavn flere har → `maybe`.
- Fullt navn vinner over fornavn for samme person.
- Ordgrense håndteres med Unicode (`\p{L}`), slik at «Åse» og «Øyvind» fungerer.

- [ ] **Step 1: Tester (feiler)**

```ts
// src/domain/mentions.test.ts
import { describe, it, expect } from 'vitest'
import { findMentions } from './mentions'

const P = [
  { id: 'ingrid', name: 'Ingrid Aas' },
  { id: 'martin', name: 'Martin Nilsen' },
  { id: 'mai', name: 'Mai Berg' },
  { id: 'ingrid2', name: 'Ingrid Lie' },
  { id: 'oyv', name: 'Øyvind Moe' },
]

describe('findMentions', () => {
  it('finner fullt navn uten hensyn til store og små bokstaver', () => {
    expect(findMentions('middag med ingrid aas', P).sure).toEqual(['ingrid'])
  })
  it('entydig fornavn med stor forbokstav er sikkert', () => {
    expect(findMentions('Middag med Martin', P).sure).toEqual(['martin'])
  })
  it('tåler genitiv', () => {
    expect(findMentions('Martins nye jobb', P).sure).toEqual(['martin'])
  })
  it('vanlige ord med liten forbokstav er ikke navn', () => {
    expect(findMentions('tur i mai', P)).toEqual({ sure: [], maybe: [] })
  })
  it('tvetydig fornavn blir et spørsmål, ikke et valg', () => {
    expect(findMentions('Kaffe med Ingrid', P)).toEqual({ sure: [], maybe: [{ word: 'Ingrid', ids: ['ingrid', 'ingrid2'] }] })
  })
  it('fullt navn løser tvetydigheten', () => {
    expect(findMentions('Kaffe med Ingrid Lie', P).sure).toEqual(['ingrid2'])
  })
  it('treffer ikke inni andre ord', () => {
    expect(findMentions('Martinsen kom også', P).sure).toEqual([])
  })
  it('håndterer norske bokstaver', () => {
    expect(findMentions('Ringte Øyvind', P).sure).toEqual(['oyv'])
  })
})
```

```ts
// src/domain/paths.test.ts
import { describe, it, expect } from 'vitest'
import { shortestPath, newProximities } from './paths'

describe('shortestPath', () => {
  const edges: [string, string][] = [['hanna', 'jonas'], ['jonas', 'ingrid'], ['ingrid', 'martin']]
  it('finner korteste vei i begge retninger', () => {
    expect(shortestPath(edges, 'hanna', 'ingrid')).toEqual(['hanna', 'jonas', 'ingrid'])
    expect(shortestPath(edges, 'martin', 'hanna')).toEqual(['martin', 'ingrid', 'jonas', 'hanna'])
  })
  it('gir null når det ikke finnes vei, eller den er for lang', () => {
    expect(shortestPath(edges, 'hanna', 'ola')).toBeNull()
    expect(shortestPath(edges, 'hanna', 'martin', 2)).toBeNull()
  })
})

describe('newProximities', () => {
  it('melder par som ble nærmere, når minst én er interessant', () => {
    const before: [string, string][] = [['jonas', 'ingrid']]
    const after: [string, string][] = [...before, ['hanna', 'jonas']]
    expect(newProximities(before, after, new Set(['hanna']))).toEqual([
      { a: 'hanna', b: 'ingrid', path: ['hanna', 'jonas', 'ingrid'] },
    ])
  })
  it('er stille når ingen interessante er involvert', () => {
    const after: [string, string][] = [['jonas', 'ingrid'], ['ola', 'jonas']]
    expect(newProximities([['jonas', 'ingrid']], after, new Set(['hanna']))).toEqual([])
  })
  it('melder ikke direkte naboer (det vet du allerede)', () => {
    expect(newProximities([], [['hanna', 'jonas']], new Set(['hanna']))).toEqual([])
  })
})
```

- [ ] **Step 2:** FAIL. **Step 3:** Implementer:
  - `paths.ts`: bredde-først-søk over en tilstøtingsliste. `newProximities` ser på par der minst én er interessant, der avstanden i `after` er ≥ 2 og ≤ maxHops, og der avstanden i `before` er lengre eller mangler. Par normaliseres som `a < b`, der den interessante står først hvis bare én er det.
  - `mentions.ts`: kompiler regex per navn med `new RegExp(\`(?<![\\p{L}])${escape(name)}(?:s|'s)?(?![\\p{L}])\`, 'iu')` for fullt navn. Fornavn bruker samme mønster uten `i`-flagget, og krever stor forbokstav.
- [ ] **Step 4:** PASS. **Commit** `Find mentioned people and short paths between them`

### Task 2: Utvid `createLog`: tråder inn og ut

**Files:** `src/server/schemas.ts` og `src/server/actions/log.ts`, med tester for skjemaet.

- `logInput` får:
  - `closeThreads: { id, resolution? }[]` (maks 50)
  - `newThreads: { title (1–200), personIds (≥1, ⊆ personIds i loggen), dueDate? }[]` (maks 20)
- Skjematest: en ny tråd med en person som ikke er med i loggen, avvises (`refine`).
- Handlingen:
  1. Eierskap for personene og for trådene som skal lukkes (`thread.findMany({ where: { id: { in }, userId, status: 'OPEN' } })`).
  2. Deretter `prisma.$transaction([...])`: opprett loggen med deltakerne, lukk tråder med `closedById = entry.id` og resolution, og opprett nye tråder med `openedById = entry.id`.
  3. Bruk interaktiv transaksjon (`prisma.$transaction(async (tx) => …)`), siden de nye trådene trenger loggens id.
- [ ] Commit `Open and close threads in the same save as the log`

### Task 3: Navigasjon: AppShell, fanelinje og panelspor

**Files:**
- Create: `src/components/AppShell.tsx`, `src/components/BottomTabs.tsx`, `src/app/@panel/**`, `src/app/kart/page.tsx`, `src/app/logg/page.tsx`
- Delete: `src/app/@modal/**` (erstattes)
- Modify: `layout.tsx`

- **`layout.tsx`** tar `children` og `panel`. `AppShell` legger dem ut slik:
  - På PC (`desk:`) står `children` (kartet) i venstre kolonne, og `panel` fyller høyre kolonne (440 px). Når panelsporet er tomt (`default.tsx`), viser det «I dag».
  - På mobil viser `children` innholdet for ruta. Panelsporet rendres som et helskjermsark med tilbake-knapp, når det har innhold.
- **`@panel/default.tsx`** rendrer `<TodayPanel />`, og `@panel/(.)person/[id]/page.tsx` rendrer profilen.
  - Lukk-knappen i panelet går til `/`.
  - `@panel/[...catchAll]/page.tsx` returnerer `null` (samme knep som i dag).
- **Forsiden `/`:**
  - Mobil: «I dag» (`TodayView`).
  - PC: kartet. «I dag» ligger i panelet.
  - Samme rute håndterer begge: `page.tsx` rendrer `<div class="desk:hidden"><TodayView/></div><div class="hidden desk:block"><Map/></div>`. Dataene hentes én gang og deles.
- **`/kart`:** kartet i full skjerm på mobil. På PC går den til `/` med `redirect`.
- **`/logg`:** alle logger nyeste først, i en lesbar kolonne på 640 px, paginert med «Vis eldre» (cursor = dato + id).
- **BottomTabs** (bare mobil, fast nederst, `pb-[env(safe-area-inset-bottom)]`): I dag, Kart, Logg, og en midtknapp «Skriv» som er en blekkfylt sirkel på 56 px. Aktiv fane markeres med `aria-current="page"`.
- **Header på PC:** Kart, Logg og Innstillinger, pluss knappen «Skriv (N)».
- [ ] Verifiser: navigasjon mellom alle ruter på 390 og 1440 px, og at tilbake i nettleseren lukker profilpanelet.
- [ ] Commit `Give phones a Today screen and tabs; give desktop a context panel`

### Task 4: Skriv-arket (Composer)

**Files:** Create `src/components/composer/{Composer,ComposerProvider,ParticipantPicker,ThreadChecklist,NewThreadLines}.tsx` og `src/components/composer/useDraft.ts`, med en komponenttest.

- **`ComposerProvider`** ligger i `Providers` og gir `openComposer({ personIds? })`. Den eier arket og tastaturet (`N`). Data (personer og åpne tråder) hentes fra en server action `getComposerData()` når arket åpnes, og caches til neste revalidering.
- **Oppsettet følger spesifikasjonen:**
  - dato-chips (I dag, I går, Velg …)
  - valgfri type (ingen er valgt som standard)
  - Fraunces-tekstfelt med autofokus
  - «Med»: chips for sikre deltakere og forslag for tvetydige. Forslag fra `findMentions` legges til automatisk bare når de er sikre, og en person du selv har fjernet, legges ikke til igjen fra samme tekst.
  - «+ person»: ComboBox med søk, der «Legg til «X» som ny person» oppretter personen via `createPerson` med type venn.
  - «Åpne tråder med dem»: avkrysning pluss et valgfritt felt for utfallet som vises når tråden er krysset av
  - «+ Noe å følge opp?»: linjer med tekstfelt og person-chips (alle deltakerne som standard)
  - «Lagre» (⌘/Ctrl+Enter)
- **Kladden** (`useDraft`) lagrer tekst, deltakere og nye tråd-linjer i `localStorage['composer-draft']`. Den gjenopprettes når arket åpnes uten forhåndsvalgte personer, og tømmes etter vellykket lagring.
- **Etter lagring:** arket lukkes og viser en melding (react-aria `Toast`, eller en enkel `role="status"`-region i `AppShell`): «Lagret. 1 tråd lukket, 1 ny.»
- **Komponenttest:**
  - Skriv «Middag med Martin». Martin-chipen dukker opp, og «Lagre» sender `personIds: ['martin']`.
  - Dobbeltklikk på «Lagre» gir ett kall.
- [ ] Erstatt `LogEntryModal` og `LogContactPanel` med `openComposer`. Slett dem.
- [ ] Commit `Log anything from anywhere, with people found in the text`

### Task 5: I dag

**Files:** `src/components/today/TodayView.tsx` og `src/server/queries/today.ts`.

- `getToday(userId)` → `{ due: ReminderItem[] (tråder med dato ≤ i dag), reach: ReminderItem[] (kadens, med ask), recent: RecentLog[] (5) }`. Gjenbruker `getReminders` og `getRecentLogs`.
- Oppsett i prioritert rekkefølge:
  1. Skriveboksen, som er en knapp stylet som et tekstfelt: «Hva skjedde, og med hvem?» i Fraunces italic. Den åpner Composer.
  2. «Kommende»
  3. «Bør ta kontakt»: hver rad har navn, «3 uker siden sist», «Spør om: …» og knappene «Logg» og «Utsett».
  4. «Sist logget», med lenke til `/logg`.
- Tom tilstand for ny bruker: «Kartet ditt er tomt. Legg til en person du har truffet i det siste.», med én knapp.
- `RemindersPanel` erstattes av `TodayView` (PC-panelet) og slettes.
- [ ] Commit `Show what matters today first`

### Task 6: Profilen: fakta, faser og relasjoner

**Files:** `src/components/person/{FactList,PhaseControl,RelationshipList}.tsx` og `src/server/actions/{fact,relationship}.ts` (utvid).

- **Fakta:** lista kan redigeres der den står. Et klikk gir to felt (etikett og verdi) som lagres ved blur eller Enter, med en slett-knapp. «+ Legg til» foreslår etiketter fra `getFactLabels(userId)`, altså de brukeren har brukt, pluss standardene Jobb, Partner, Barn, Bor, Liker og Obs. Handlingene er `addFact`, `updateFact` og `deleteFact`, med eierskap via `person.userId`.
- **Faser:**
  - Under stripen står «Neste: Eksklusive →», som kaller `addPhase(nextPhase)` med dagens dato.
  - En sekundærknapp «Avslutt» gir `ENDED`, med bekreftelse.
  - Er personen `ROMANTIC` uten faser, vises «Start: Første date».
- **Relasjoner på profilen:**
  - En liste over personens relasjoner til andre (type, etikett, siden/til).
  - Å legge til velger en person og en type. Å redigere endrer etikett og datoer.
  - Å avslutte setter `until` til i dag, og det er dette som gjør et forhold historisk.
  - Handlingen `updateRelationship` legges til i `relationship.ts`.
- **Historikk:** lukkede tråder vises i tidslinjen som «Andre intervjurunde → Fikk jobben», sortert inn etter `closedAt`.
- [ ] Commit `Edit facts, phases and relationships where you read them`

### Task 7: Koblingsvarsel og stier på kartet

**Files:** `src/server/queries/proximity.ts`, `src/components/person/SmallWorld.tsx` og `VennekartCanvas`.

- `createRelationship` returnerer `{ id, proximities }`, der `newProximities` er beregnet med kantene før og etter. Interessante personer er de med `type ROMANTIC`, pluss de som har en romantisk relasjon til noen andre.
- Klienten viser en melding: «Verden er liten: Hanna og Ingrid er to steg fra hverandre.», med «Se stien».
- «Se stien» navigerer til `/?sti=hanna,jonas,ingrid`, og kartet tegner stien med `redpencil`, bredde 2,4. Alle andre kanter dempes til 30 %.
- På profilen viser «Verden er liten» alle stier på ≤ 3 steg til interessante personer (`getProximities(userId, personId)`).
- [ ] Commit `Notice when the world gets smaller`

### Task 8: PWA

**Files:** `src/app/manifest.ts`, `src/app/icon.tsx` og `src/app/apple-icon.tsx` (ImageResponse, Dagbok-ikon: en blekksirkel med tre små sirkler).

- Manifest:
  - `name` er «Vennekart» og `short_name` «Vennekart»
  - `display: 'standalone'`
  - `background_color` og `theme_color` er `TOKENS.light.paper`
  - `start_url: '/'`
  - ikoner på 192 og 512 px, samt en maskable variant
- [ ] Verifiser med Chrome DevTools → Application → Manifest (ingen feil).
- [ ] Commit `Install Vennekart on the home screen`

### Task 9: Bilder (krever Blob-lagring)

**Forutsetning:** `BLOB_READ_WRITE_TOKEN` finnes i `.env.local` eller i Vercel. **Finnes den ikke, hoppes denne oppgaven over**, og PR-beskrivelsen sier hva brukeren må gjøre: opprett en Blob-lagring i Vercel og koble den til prosjektet.

- En server action `uploadPhoto(personId, formData)`:
  - Eierskap sjekkes, og bare `image/jpeg`, `image/png` og `image/webp` på maks 2 MB godtas.
  - Filen lastes opp med `put(\`people/${userId}/${personId}.webp\`, …, { access: 'public', addRandomSuffix: true })`.
  - En eventuell gammel fil slettes med `del`, og `photoUrl` settes.
- Klienten skalerer bildet ned til et kvadrat på 512 px (canvas, `toBlob('image/webp', 0.85)`) før opplasting.
- `next.config.ts`: `images.remotePatterns` for `*.public.blob.vercel-storage.com`.
- [ ] Commit `Add photos of people`

### Task 10: Verifisering, gjennomgang og PR

- [ ] `npm run lint && npx vitest run && npm run build`
- [ ] **Manuelt i nettleseren**, på 390 og 1440 px i lys og mørk modus, hele kjernesløyfen:
  1. Åpne på mobil og se «I dag».
  2. Skriv «Middag med Ingrid og Martin. Ingrid fikk jobben!», lukk tråden «Andre intervjurunde» med «Fikk jobben», legg til «Første uke i ny jobb» som ny tråd, og lagre.
  3. Åpne Ingrid: tråden er borte fra «Spør om», den nye står der, og historikken viser «→ Fikk jobben».
  4. Legg Hanna–Jonas-relasjonen på nytt og se varselet og stien.
- [ ] axe (WCAG A/AA) = 0 brudd på `/`, `/logg`, en profil og Composer, i begge temaer.
- [ ] Kodegjennomgang (superpowers:requesting-code-review), og rett funnene.
- [ ] Push og åpne en PR mot PR 1-branchen (stablet).
