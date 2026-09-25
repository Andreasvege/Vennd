# V2 · Delprosjekt 0–2: Visuelt fundament, datafundament og kjernesløyfen

**Dato:** 2026-09-25
**Status:** Godkjent retning (brukeren har delegert detaljbeslutninger; se «Beslutninger du kan overprøve»)
**Veikart:** [2026-09-25-vennekart-v2-roadmap.md](2026-09-25-vennekart-v2-roadmap.md)

---

## Mål for denne spesifikasjonen

Etter disse tre delprosjektene skal dette være sant:

1. Du kan åpne appen på mobilen, skrive «middag med Ingrid og Martin, Ingrid fikk jobben» og lagre på under 30 sekunder. Loggen knyttes til begge, og du kan lukke Ingrids åpne tråd om intervjuet i samme slengen.
2. Når du trykker på Ingrid, ser du først det du bør spørre om, så hva dere snakket om sist og faste fakta.
3. Når du legger til Hanna og at hun kjenner Jonas, sier appen at Hanna og Ingrid er to steg fra hverandre.
4. Hele appen ser ut som Dagbok, både lys og mørk, på mobil og PC.

Tre PR-er, stablet i rekkefølge: **0 → 1 → 2**.

---

## Delprosjekt 0 — Visuelt fundament («Dagbok»)

### Konsept

Appen er en personlig notatbok om menneskene dine. Uttrykket henter materialene sine fra den verdenen: ulinjert papir, fyllepennblekk, fargeblyanter til å markere grupper, og en rødblyant som bare brukes når noe virkelig skal fram, som en sti mellom to personer.

**Justering fra skissen:** Skissen brukte terrakotta som aksent. Krem, serif og terrakotta er et så vanlig AI-standarduttrykk at det gjør appen anonym. V2 bruker **blåsvart fyllepennblekk** som aksent. Rødblyanten er forbeholdt uthevinger. Dette ligger i fargetokens og kan byttes tilbake ved å endre én verdi.

### Fargetokens

Definert som CSS-variabler i `globals.css` og registrert i Tailwind v4 med `@theme inline`. Mørk modus følger systeminnstillingen (`prefers-color-scheme`), og `data-theme="light|dark"` på `<html>` kan overstyre.

| Token | Lys («Dagbok») | Mørk («Dagbok natt») | Bruk |
|---|---|---|---|
| `paper` | `#F3EEE4` | `#1B1916` | Bakgrunn |
| `paper-raised` | `#FAF7F1` | `#24211D` | Paneler, felt og ark |
| `ink` | `#27231E` | `#ECE5D8` | Primærtekst og streker |
| `ink-muted` | `#6B6257` | `#A69D90` | Sekundærtekst (≥4,5:1 mot `paper`) |
| `rule` | `#DDD3C3` | `#3A352F` | Skillelinjer og kanter |
| `pen` | `#26386E` | `#A9B8EE` | Aksent: primærhandlinger, fokus og lenker |
| `pen-wash` | `#E4E7F1` | `#262B3D` | Aksentflater, for eksempel valgt tilstand |
| `redpencil` | `#B23A2A` | `#EE8A78` | Uthevinger: stier, varsler og feil |

**Taggpaletten** er åtte fargeblyanttoner. Hver har en flate-farge, som brukes til nodefyll og chip-bakgrunn, og en strek-farge, som brukes til prikker og kanter. Begge finnes i lys og mørk variant. Tonene skiller seg i lyshet og ikke bare i fargetone, slik at de er lesbare også for fargeblinde. Taggens farge lagres som en nøkkel (`sage`, `ochre`, `slate`, `plum`, `rose`, `moss`, `clay`, `sky`) og ikke som en hex-verdi, så paletten kan justeres uten å migrere data.

### Typografi

- **Visning (display):** *Fraunces* med variable akser: `opsz` automatisk, `SOFT` 50 og `WONK` 1 på italic. Den brukes med måte: navn på personer, seksjonsoverskrifter i italic, loggtekst og appnavnet. Loggtekst skrives i Fraunces, fordi det er *dagboken*.
- **Brødtekst og grensesnitt:** *Instrument Sans*, brukt til knapper, etiketter, metadata og skjemaer.
- **Skala (1,25, basis 16):** 12 · 13 · 14 · 16 · 18 · 21 · 26 · 34 · 46. Linjehøyden er 1,5 for brødtekst og 1,05–1,15 for display.
- Fontene lastes med `next/font/google` og variable fonter, uten eksterne CSS-kall.

### Rom, form og bevegelse

- **Grid:** 4 px-grid. Avstander på 4, 8, 12, 16, 20, 24, 32, 40, 56 og 72.
- **Radius:** 10 (felt og chips), 16 (ark og paneler) og full (avatarer).
- **Skygger:** Nesten ingen. Paneler skilles med `rule`-linjer og `paper-raised`. Bare flytende elementer, som rask logging og ark på mobil, får en myk, varm skygge.
- **Bevegelse:** 150 ms for tilstandsendringer og 250 ms for ark og dialoger, med `ease-out`. Ingen dekorativ animasjon. `prefers-reduced-motion` slår av transform-animasjoner.

### Signaturelement

**Kartet som blekktegning.** Personer er tintede sirkler med blekkstrek. Grupper tegnes som stiplede blyantomriss rundt klyngene, og kanter mellom personer bærer håndskriftlignende etiketter i Fraunces italic («klatrer sammen»). Når en sti vises, tegnes den med rødblyant. Alt annet i appen holdes stille og disiplinert rundt dette.

### Komponenter (i `src/components/ui/`)

Alle bygget på react-aria-components, som allerede brukes i dag, og stylet med tokens:

- `Button`: variantene `primary` (blekkflate), `secondary` (papir med strek) og `quiet`. Størrelsene `md` og `lg`. `lg` er minst 44 px.
- `TextField` og `TextArea`, der `TextArea` har en `serif`-variant for loggtekst.
- `Chip` og `ToggleChip`, for tagger, loggtype og deltakere.
- `Avatar`, med bilde eller initialer, fargetone fra hovedtagg og størrelsene `sm`, `md` og `lg`.
- `Sheet`, som er et nederste ark på mobil og en sentrert dialog på PC. Den erstatter `Dialog` og `Modal`.
- `SectionHeading`, i Fraunces italic.
- `Icon`: `lucide-react`, strek 1,75. Emoji fjernes overalt.
- `EmptyState`, som alltid peker på én handling.

### Opprydding

- Fjerne malrester fra `globals.css`: `spin-3d`, `hover-glitch`, `glass-card` og variablene `--Primary`, `--Accent`, `--Glass` og `--GlassBorder`.
- Fjerne `Modal.tsx`, som erstattes av `Sheet`, og `relationship-colors.ts`, som erstattes av taggfarger og relasjonstypefarger i tokens.
- Fjerne `about`- og `contact`-sidene fra malen hvis de ikke brukes. De er ikke lenket fra navigasjonen i dag.

### i18n

All synlig tekst flyttes til `src/i18n/nb.ts`, et typet objekt med funksjoner der teksten trenger variabler: `profile.lastSeen(days)`. Komponentene importerer `t` fra `@/i18n`. Datoer og flertall håndteres av `Intl` (`Intl.RelativeTimeFormat` og `Intl.PluralRules`) med `nb-NO`. En senere overgang til `next-intl` blir da mekanisk. Vi tar ikke inn `next-intl` nå, fordi språkruting (`/en/...`) ville vært kompleksitet uten nytte før det finnes et språk nummer to.

### Levering i PR 0

Eksisterende skjermer, altså kart, profil, skjemaer, påminnelser og tidslinje, restyles til Dagbok uten å endre funksjonalitet. Da blir PR 0 en ren visuell endring som er lett å se gjennom.

---

## Delprosjekt 1 — Datafundament

### Datamodell (Prisma)

Endringer i forhold til dagens skjema:

```prisma
enum RelationshipType {
  FRIEND
  FAMILY
  COLLEAGUE
  ROMANTIC        // var PARTNER; dekker alt fra første date til kjæreste og eks
  ACQUAINTANCE
  OTHER
}

enum LogEntryType { MET  CALLED  MESSAGE  DATE  OTHER }

enum RomanticPhase { FIRST_DATE  SEEING  EXCLUSIVE  PARTNER  ENDED }

enum ThreadStatus { OPEN  CLOSED }

model Person {
  // uendret: id, userId, name, birthday, type, cadenceWeeks, snoozedUntil, positionX/Y, createdAt
  notes         String?   @db.Text    // beholdes som fritt notat; faste fakta flyttes til Fact
  photoUrl      String?               // Vercel Blob (delprosjekt 2, siste steg)
  primaryTagId  String?               // styrer farge nå, gren i Kretser-kartet senere
  primaryTag    Tag?      @relation("PrimaryTag", fields: [primaryTagId], references: [id], onDelete: SetNull)
  tags          PersonTag[]
  facts         Fact[]
  participations LogParticipant[]
  threads       ThreadPerson[]
  phases        RomanticPhaseEntry[]
  // FJERNET: color, logEntries (via LogParticipant), reminders
}

model Tag {
  id        String  @id @default(cuid())
  userId    String
  name      String
  color     String            // palettnøkkel: sage | ochre | slate | plum | rose | moss | clay | sky
  sortOrder Int     @default(0)
  persons   PersonTag[]
  primaryOf Person[] @relation("PrimaryTag")
  @@unique([userId, name])
}

model PersonTag {
  personId String
  tagId    String
  @@id([personId, tagId])
}

model Relationship {
  // uendret: id, fromPersonId, toPersonId, type, createdAt
  label     String?     // «klatrer sammen», vises på kanten
  since     DateTime?
  until     DateTime?   // satt = historisk (f.eks. eks)
  // FJERNET: color (utledes av type i presentasjonslaget)
}

model LogEntry {
  id        String       @id @default(cuid())
  userId    String
  date      DateTime     @default(now())
  type      LogEntryType?          // valgfri: fritekst er nok
  body      String?      @db.Text  // var notes
  createdAt DateTime     @default(now())
  participants  LogParticipant[]
  threadsOpened Thread[] @relation("OpenedBy")
  threadsClosed Thread[] @relation("ClosedBy")
  // FJERNET: personId
}

model LogParticipant {
  logEntryId String
  personId   String
  @@id([logEntryId, personId])
  @@index([personId])
}

model Thread {
  id          String       @id @default(cuid())
  userId      String
  title       String                 // «Andre intervjurunde i Statkraft»
  status      ThreadStatus @default(OPEN)
  resolution  String?                // «Fikk jobben»
  dueDate     DateTime?              // «ta opp etter 1. nov»; null = aktuell nå
  openedById  String?                // loggen tråden kom fra
  closedById  String?                // loggen som lukket den
  createdAt   DateTime     @default(now())
  closedAt    DateTime?
  persons     ThreadPerson[]
}

model ThreadPerson {
  threadId String
  personId String
  @@id([threadId, personId])
  @@index([personId])
}

model Fact {
  id        String   @id @default(cuid())
  personId  String
  label     String            // «Jobb»
  value     String            // «Statkraft (fra november)»
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

model RomanticPhaseEntry {
  id       String        @id @default(cuid())
  personId String
  phase    RomanticPhase
  at       DateTime                 // når overgangen skjedde
  @@index([personId, at])
}
```

Alle nye relasjoner har `onDelete: Cascade` mot `User` og `Person`, slik som i dag. `Reminder`-tabellen og enumen `ReminderType` **fjernes** (se under).

**Viktige beslutninger:**

- **Én logg kan ha flere personer.** Det er selve grunnlaget for at ting henger sammen. Når du sist hadde kontakt med noen (brukt av kadensen), regnes det nå ut fra `LogParticipant`.
- **Manuelle påminnelser blir tråder.** En manuell påminnelse («spør om X») *er* en oppfølgingstråd. Én med dato er en tråd med `dueDate`. Å ha to konsepter for det samme er teknisk og mental gjeld. Automatiske påminnelser, altså kadensen, er fortsatt beregnet og lagres ikke.
- **Fargen kommer fra hovedtaggen.** `Person.color` fjernes. En person uten tagg får en nøytral blekktone. Én fargekilde gir et konsistent kart.
- **Romantikk har faser for deg og intervall for andre.** For deg er `Person.type = ROMANTIC`, og faseloggen i `RomanticPhaseEntry` sier hvor dere er. Den gjeldende fasen er den nyeste raden, og `ENDED` betyr at det er historisk. Mellom andre er `Relationship.type = ROMANTIC` med `since` og `until`. Faser mellom andre er det ingen som trenger.
- **Fakta er fri nøkkel og verdi**, uten et fast skjema. Bursdag blir liggende på `Person`, siden den brukes til beregning i delprosjekt 4.

### Migrering

Én Prisma-migrering med SQL som bevarer data, selv om prod-dataene bare er testdata. Da er migreringen riktig for alle som noen gang kjører den.

1. `PARTNER` → `ROMANTIC` i begge kolonnene.
2. `LogEntry.personId` → én `LogParticipant`-rad per logg. `notes` → `body`.
3. `Reminder` med `type = MANUAL` og `dismissed = false` → `Thread` (`title = message`, `dueDate` beholdes) med én `ThreadPerson`. Avviste påminnelser blir `CLOSED`.
4. Kolonnene `Person.color` og `Relationship.color`, `LogEntry.personId` og `Reminder` fjernes.

Migreringen kjøres først mot en Neon-branch (`dev-v2`), og deretter mot prod med brukerens tillatelse, siden prod bare har testdata.

### Serverlag

I dag henter klienten data med `fetch` og oppdaterer ved å endre en `refreshKey`. Det er gjeld, fordi hver komponent vet om hver annen. V2 flytter til App Router-mønsteret:

```
src/server/
  session.ts          requireUserId(): kaster/omdirigerer uten sesjon
  queries/            ren lesing, alltid scopet på userId (server components kaller disse)
    graph.ts  person.ts  today.ts  log.ts  tags.ts
  actions/            'use server'-funksjoner, validert med zod, avsluttes med revalidatePath
    log.ts  person.ts  relationship.ts  thread.ts  fact.ts  tag.ts  phase.ts
src/domain/           ren logikk uten database, fullt enhetstestet
  mentions.ts         finn kjente personer i fritekst
  paths.ts            korteste vei og «nye nærhetsvarsler»
  cadence.ts          (flyttet fra lib) + siste kontakt fra deltakelse
  romance.ts          gjeldende fase, lovlige overganger
  format.ts           relative datoer via Intl
```

- **Eierskap sjekkes på ett sted per spørring.** Hver spørring og handling tar `userId` fra `requireUserId()`, aldri fra klienten. Handlinger som tar imot id-er (`personIds` og `threadIds`) verifiserer at alle tilhører brukeren i samme spørring (`where: { id: { in }, userId }` og at antallet stemmer).
- **API-rutene** under `src/app/api/` fjernes når ingen kaller dem lenger. `auth`-ruten beholdes.
- **zod** tas inn som avhengighet til validering av input.

### Levering i PR 1

Skjema, migrering, serverlaget og den eksisterende funksjonaliteten portet til det nye laget: kart, profil, logging via person og påminnelser. De nye flatene kommer i PR 2, men alt som fungerte, fungerer fortsatt. Tagger kan settes på personer i redigeringsskjemaet, og de farger kartet.

---

## Delprosjekt 2 — Kjernesløyfen

### Informasjonsarkitektur

| Rute | Mobil (< 1024 px) | PC (≥ 1024 px) |
|---|---|---|
| `/` | **I dag** | Kart til venstre, sidepanel til høyre som viser **I dag** |
| `/kart` | Kart i full skjerm | Omdirigerer til `/` |
| `/logg` | Alle logger som dagbok, nyeste først | Samme, i en lesbar kolonne |
| `/person/[id]` | Profil (full side ved direkte lenke; som helskjermsark ved navigasjon inne i appen) | Kart, med profilen i sidepanelet |

Avskjæringen (`@panel/(.)person/[id]`) er den samme på begge bredder. Det er bare *presentasjonen* av sporet som styres av CSS: sidepanel ved ≥ 1024 px, helskjermsark under. Det gir én rute og én datakilde, og ingen JavaScript-sjekk av skjermbredde.
| `/innstillinger` | Tagger, konto, tema | Samme |

- **Mobil:** Nederst er det en fanelinje med *I dag*, *Kart* og *Logg*, med en tydelig **Skriv**-knapp i midten.
- **PC:** Øverst er det en topplinje. Tasten `N` åpner rask logging hvor som helst, bortsett fra når du står i et tekstfelt.
- På PC er sidepanelet *kontekstuelt*. Det viser I dag når ingen er valgt, og profilen når noen er valgt. Da er kartet og det du bør gjøre, alltid synlige samtidig.

### I dag

I prioritert rekkefølge, fordi det viktigste skal stå øverst:

1. **Skriveboks:** «Hva skjedde, og med hvem?». Et trykk åpner rask logging.
2. **Kommende:** tråder som har `dueDate` i dag eller er passert.
3. **Bør ta kontakt:** kadens-påminnelser med utsett-knapp. For hver person vises den eldste åpne tråden deres som «spør om …», slik at påminnelsen blir konkret.
4. **Sist logget:** de 5 siste loggene. Loggteksten vises i Fraunces, med deltakernes navn og en relativ dato.

Tom tilstand: «Kartet ditt er tomt. Legg til en person du har truffet i det siste.», med én knapp.

### Rask logging (skriv-arket)

Ett ark med samme komponent på mobil og PC. Det kan åpnes tomt, eller med personer allerede valgt fra en profil.

```
┌──────────────────────────────────────────┐
│ Ny logg                     I dag ▾  ✕   │
│ [Møtte] [Ringte] [Melding] [Date] [Annet]│  valgfri type
│ ┌──────────────────────────────────────┐ │
│ │ Middag med Ingrid og Martin. Ingrid  │ │  Fraunces, fritekst
│ │ fikk jobben!                         │ │
│ └──────────────────────────────────────┘ │
│ Med  (Ingrid ✓) (Martin ✓) (+ person)    │  foreslått fra teksten
│                                          │
│ Åpne tråder med dem                      │  vises når deltakere er valgt
│  ○ Andre intervjurunde · Ingrid          │  kryss av → lukk, valgfritt «hvordan gikk det»
│  ○ Budet på Løkka · Ingrid, Martin       │
│                                          │
│ + Noe å følge opp?                       │  én linje per ny tråd
│                                          │
│                              [ Lagre ]   │
└──────────────────────────────────────────┘
```

- **Deltakere:**
  - `domain/mentions.ts` finner kjente personer i teksten mens du skriver. Den matcher på fullt navn og på fornavn som er unikt blant personene dine, uten å bry seg om store og små bokstaver, og tåler norsk genitiv («Ingrids»).
  - Fornavn som flere har, gir en forslagschip for hver av dem, som du velger mellom.
  - Forslag legges til automatisk *bare* ved entydig treff, og kan fjernes med ett trykk.
  - «+ person» åpner et søkbart valg, der du også kan opprette en ny person bare med navn.
- **Åpne tråder:** Så snart en deltaker er valgt, vises de åpne trådene deres. Du krysser av for tråder som skal lukkes, og kan skrive én linje om utfallet. Det er dette som gjør at det henger sammen: loggen lukker tråden, og tråden husker hvilken logg som lukket den.
- **Nye tråder:** «+ Noe å følge opp?» legger til én linje per tråd. Trådene knyttes til alle deltakerne som standard, og du kan justere det med chips.
- **Lagring:** Én serverhandling (`createLog`) lagrer loggen, deltakerne, nye tråder og lukking av tråder i én transaksjon. Selve loggen er aldri avhengig av noe annet enn seg selv.
- **Dato:** Du kan velge «I dag», «I går» eller en egen dato. Datoen følger lokal tid, slik den nåværende `today()` allerede håndterer.
- **Kladd:** Teksten som er skrevet, lagres i `localStorage` til loggen er lagret, så en mobil som lukker arket, ikke mister den.

### Profilen

Rekkefølgen følger det du trenger i øyeblikket før et treff:

1. **Topp:** avatar (bilde eller initialer), navn i Fraunces 46, tagger som chips og en linje med «Venn · sist sett i går · neste innsjekk om 20 dager». For romantiske relasjoner vises en fasestripe, der du kan trykke for å gå til neste fase.
2. **Spør om:** åpne tråder. Et trykk på sirkelen lukker tråden med en valgfri linje om utfallet.
3. **Sist gang:** den siste loggen i Fraunces, med dato og andre deltakere.
4. **Å huske:** fakta i to kolonner, som kan redigeres der de står. «+ Legg til» gir etikett og verdi, der etiketten foreslås fra etiketter du har brukt før.
5. **Verden er liten:** koblinger (se under), vist bare når det finnes noen.
6. **Historikk:** alle logger og lukkede tråder («Andre intervjurunde → Fikk jobben»).
7. **Handlinger:** «Logg med [navn]» som primærknapp, og «Rediger».

Redigering gjøres i samme ark som i dag: navn, type, tagger (kombinasjonsfelt som kan opprette nye), hovedtagg, kadens, bursdag, bilde og relasjoner til andre, med type, etikett og fra/til.

### Koblingsvarsel («Verden er liten»)

- `domain/paths.ts` bruker bredde-først-søk over relasjonene mellom andre, *uten* «meg», ellers ville alle vært to steg fra hverandre via deg.
- **Når varselet vises:** Når en relasjon opprettes, regnes avstandene ut før og etter. Et par vises hvis avstanden mellom dem ble kortere og nå er ≤ 3 steg, og minst én av dem er *interessant*. Interessant betyr at du har en romantisk relasjon til personen (nå eller før), eller at personen har en romantisk relasjon til noen andre.
- **Hvor det vises:** Varselet vises som en melding (toast) etter lagring, med «Se stien». På profilen vises alle slike stier med interessante personer. Stien tegnes med rødblyant i kartet.
- Beregningen er ren og tar under 1 ms for noen hundre personer. Den skjer på serveren ved lesing og lagres ikke.

### Kartet i PR 2

Kartet restyles i PR 0. I PR 2 kommer disse endringene:

- Noder viser bilde eller initialer, farget etter hovedtagg.
- Gruppeomriss tegnes for hovedtagger. Omrisset er et konvekst skall rundt nodene, glattet og stiplet.
- Kanter kan ha etiketter, og stier vises med rødblyant.
- Tagfilter, lagrede visninger, falming og de tre kartvisningene kommer i delprosjekt 5.

### Bilder (siste steg i PR 2)

Bilder lastes opp til Vercel Blob fra redigeringsskjemaet. Før opplasting beskjæres bildet til kvadrat og skaleres ned til 512 px på klienten. `photoUrl` lagres, og visningen går gjennom `next/image`. **Dette krever en Blob-lagring og tokenet `BLOB_READ_WRITE_TOKEN`.** Opprettelsen er en kontohandling som brukeren gjør, eller godkjenner. Uten token skjules bildefeltet, og initialene brukes.

### PWA

Appen får `app/manifest.ts` med navn, ikoner i Dagbok-stil, `display: standalone` og en temafarge fra `paper`. Den får også riktige `viewport`- og `theme-color`-metadata for lys og mørk modus. Det blir ingen offline-cache nå, fordi en service worker med cache-invalidering er kompleksitet uten tydelig gevinst for en app som alltid er på nett.

---

## Tilgjengelighet og kvalitetsgulv

- WCAG 2.1 AA: kontrast (sjekket for alle tokenpar), tastaturnavigasjon, synlig fokus (2 px `pen`-ring) og `aria-label` på ikonknapper.
- Trykkflater er minst 44 px på mobil.
- Alle skjemaer har ekte `<label>` og feilmeldinger som sier hva som er galt og hva du kan gjøre.
- `prefers-reduced-motion` og `prefers-color-scheme` respekteres.

## Testing

- **Enhetstester (Vitest)** for alt i `src/domain/`: mentions (genitiv, tvetydighet, fullt navn, delord som ikke skal treffe), paths (ingen sti, sti gjennom historiske relasjoner, varsler bare ved forkortelse), romance (gjeldende fase, rekkefølge), cadence (siste kontakt via flere deltakere) og format.
- **Validering av handlinger:** zod-skjemaene testes direkte.
- **Komponenttester (Testing Library)** for skriv-arket (forslag, avkryssing av tråder og innsending) og for Chip og Sheet (tastatur).
- **Manuell verifisering** i nettleseren mot Neon-branchen før hver PR, med skjermbilder i lys og mørk modus og på mobil- og PC-bredde i PR-beskrivelsen.
- `npm run lint`, `npm test` og `npm run build` er grønne før hver PR.

## Utenfor denne spesifikasjonen

Claude-forslag (3), planlagte treff og bursdagsvarsler (4), tagfilter, visninger og de tre kartvisningene (5), søk og innsikt (6) og import (7).

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse | Å snu den koster |
|---|---|---|
| Blåsvart blekk som aksent i stedet for terrakotta | Unngår AI-standarduttrykket, og passer dagbok-verdenen | Ett token |
| Manuelle påminnelser slås sammen med tråder | Ett konsept i stedet for to | Middels (ny tabell) |
| Personens farge kommer fra hovedtaggen | Konsistent kart, og færre valg når du legger til en person | Lite |
| Server actions i stedet for API-ruter | Fjerner `refreshKey`-koblingene og gir færre rundturer | Stort, derfor gjort nå |
| Egen ordbok i stedet for next-intl | Ingen språkruting før det finnes et språk nummer to | Lite |
| `lucide-react` til ikoner | Konsistent strek som passer blekkuttrykket | Lite |
| Ingen offline-cache i PWA | Kompleksitet uten tydelig gevinst | Lite |
