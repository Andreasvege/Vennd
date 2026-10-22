@AGENTS.md

# Vennd

Het Vennekart før oktober 2026. GitHub-repoet, Vercel-prosjektet (`vennekart`)
og lokale databasenavn har fortsatt det gamle navnet.

En personlig dagbok over menneskene du kjenner. Bare for eieren (Andreas).
Kjernesløyfen er **fange → huske → følge opp**: logg et treff på under 30
sekunder, og neste gang du skal se noen, ser du hva du bør spørre om.
Veikart og mål: `docs/superpowers/specs/2026-09-25-vennekart-v2-roadmap.md`.

## Arbeidsavtale

- **Én PR per delprosjekt eller fiks.** Eieren har gitt lov til å merge til
  `main` selv etter at testene er grønne og en reviewer har sett på det.
  `main` er sjekket ut i en annen worktree: lag alltid en branch fra
  `origin/main`.
- **Stablede PR-er:** merge aldri med `--delete-branch`. Det lukker PR-en som
  står oppå. Flytt basen til `main` (`gh pr edit N --base main`) og merge i
  rekkefølge.
- **Prod-databasen har bare testdata.** Den kan wipes om nødvendig, men spør
  først.
- **Prosess:** spesifikasjon (`docs/superpowers/specs/`) → implementering →
  tester → sjekk i nettleseren (Playwright, 390 og 1440 px, lys og mørk
  modus, axe 0 brudd) → review-subagent → PR → merge → sjekk utrullingen.
- **Modeller:** Opus orkestrerer. Sonnet-subagenter kan brukes til ferdig
  planlagte oppgaver.
- **Kvalitet:** elegant design, god brukeropplevelse, beslutninger med
  begrunnelse, ingen teknisk gjeld. Tid er ikke en begrensning.
- **Kostnad:** eieren er kostnadsbevisst når det gjelder Claude-kall. Legg
  aldri inn automatiske Claude-kall per handling uten å spørre (se AI-delen
  nederst).

## Konvensjoner

- **Språk:** norsk grensesnitt. All tekst ligger i `src/i18n/nb.ts` (klar for
  flere språk). Kommentarer og commit-meldinger: kommentarer på norsk, commits
  på engelsk.
- **Utseende: «Dagbok».** Papir og blekk, Fraunces som display og Instrument
  Sans som brødtekst. Tokens i `src/app/globals.css`: paper, paper-raised,
  ink, ink-muted, rule, pen, pen-wash, redpencil og `tag-<farge>-fill/stroke`.
  Breakpointet `desk` er 1024 px.
- **Stakk:** Next.js 16 App Router (les `node_modules/next/dist/docs/` før
  du bruker nye API-er), React 19 med React Compiler, Tailwind v4,
  react-aria-components, `@xyflow/react` 12, Prisma 7 (Postgres, `pg`-adapter)
  og zod 4.
- **Domenelogikk er rene funksjoner med tester** i `src/domain/`. Eksempler:
  freshness, layouts, search, insight, sorting, linkSuggestions, duplicates
  og import-parserne.
- **Server actions** (`src/server/actions/`):
  - validerer alt med zod
  - sjekker eierskap (`assertPersonsOwned` og lignende, `userId` i hver
    spørring)
  - returnerer `ActionResult`
  - kaller `refreshAll()`
  - klienten pakker kall i `settle()`
- **Datoer:** en dato fra et datofelt lagres kl. 12:00 UTC (`fromDateInput`).
  Alt som avhenger av leserens dag, regnes i nettleseren (`useIsClient`,
  `RelativeDay`), ellers blir det hydreringsfeil.
- **Synlighet** (`src/server/queries/visibility.ts`):
  - `sortedAt = null` betyr usortert, altså i Venter-bunken og ikke på
    kartet.
  - `archivedAt` betyr «ikke i kartet», altså skjult overalt, men importen
    kjenner personen igjen.
  - Bruk `onMap` og `notArchived` i nye spørringer.
- **Kartet:**
  - Posisjoner er midten av avataren.
  - Håndtakene er et punkt i sentrum, så strekene går midt til midt.
  - Nærhet og Kretser regnes ut. Nettverk bruker lagrede posisjoner, med
    «Rydd opp» (`tidyNetwork`).

## Lokalt og i prod

- **Lokal database:** `npx prisma dev -n vennekart-v2 --detach`, database
  `vennekart` (aldri `template1`).
- **Migreringer:** shadow-databasen fungerer ikke med prisma dev. Lag SQL
  med `prisma migrate diff --from-schema <kopi av gammelt skjema>
  --to-schema prisma/schema.prisma --script -o …`, og kjør så
  `prisma migrate deploy`.
- **Innlogging lokalt:** `npx prisma db seed` og
  `node --env-file=.env.local scripts/dev-session.mts` gir cookien
  `authjs.session-token` for dev-user (lagret i `.dev/session-token.txt`).
- **Dev-serveren:** start den på nytt etter skjemaendringer, ellers får du
  foreldet Prisma-klient («reading 'findMany'» eller «Unknown field»). Stopp
  bare denne worktreeens server (sjekk `cwd` med `lsof`), aldri
  `pkill -f "next dev"`.
- **Prod:** Vercel-prosjektet `vennekart` og Prisma Postgres (db.prisma.io).
  Produksjonsbygg kjører `prisma migrate deploy` automatisk
  (`scripts/migrate-on-deploy.mjs`), men forhåndsvisninger gjør det aldri.
  Etter en merge: sjekk byggeloggen for migreringer, og runtime-loggene.
- **Databasetilkoblinger:** poolen er begrenset til 5 per instans, med
  `attachDatabasePool`. Ellers går Prisma Postgres tom for tilkoblinger.
- **Miljøvariabler:**
  - `ANTHROPIC_API_KEY` er satt i Vercel.
  - `CLAUDE_MODEL` er valgfri (standard `claude-sonnet-5`).
  - `BLOB_READ_WRITE_TOKEN` er ikke satt, så bilder er av.

## Hva som er bygget (logg)

V1 var en enkel tech demo. V2 ble bygget 25.–27. september 2026, med
spesifikasjoner i `docs/superpowers/specs/`.

| PR | Hva |
|---|---|
| #1 | Visuelt fundament «Dagbok»: tokens, typografi, komponenter |
| #4 | Datafundament: tagger, tråder, logger med flere personer, relasjoner med tid, romantiske faser |
| #3 | Kjernesløyfen: skriv-arket (N), I dag, tråder («spør om»), koblingsvarsel («verden er liten»), PWA |
| #5 | Kartet: Nærhet (ferskhet), Nettverk (egne plasser, miljøer som omriss), Kretser (kantbunting). Tagfilter, lagrede visninger, «ofte sammen» fra logger |
| #6 | Fremover i tid: planer (P), forberedelse før treff, «Hvordan gikk det?», bursdager |
| #7 | Søk (⌘K, navn blir filter) og Innsikt (hvem du ikke har sett, hvor tiden går, tellestreker, rytme) |
| #8 | Import av kontakter (.vcf) og kalender (.ics), lest i nettleseren |
| #9 | Forslag fra Claude etter en logg: tråder, fakta, personer (se AI-delen) |
| #10 | Bilder av personer (krever Vercel Blob, ikke slått på) |
| #11 | Rette og slette logger, endre planer, eksport av alle data som JSON |
| #12–14 | Drift: migrering ved produksjonsbygg, riktig database, begrenset tilkoblingspool |
| #15 | Import: skjulte avkrysningsfelt ga tom plass og hopp |
| #16 | Bygg kartet ditt: kortstokken (én og én), miljø for miljø, Venter-bunken, «ikke i kartet» |
| #17 | Forslag til forbindelser (regler og Claude) |
| #18, #20 | Kortstokken: «Kjenner allerede», forslag som vokser med kryssene, «Hvem er de for deg?» (type og egen etikett eller fase, inkludert eks), «Hvor ofte?» |
| #19 | En ny person vises ikke to ganger (`uniqueById`) |
| #21–23 | Kartet: «Rydd opp» i Nettverk, familier samlet i Nærhet, strekene midt til midt, roligere og fokus ved valg, øyer i stedet for nøster, deg i midten |
| #24 | «Bygg kartet» i navigasjonen, med antall som venter |
| #25–27 | Claude-forbindelser: mindre sløsing, hele nettverket i ett kall ved behov, forslag som grupper (innsikter) i stedet for par |
| #28 | Regelforslag gruppert etter miljø (knutepunkter teller ikke), duplikater med sammenslåing |
| #30 | «Rydd opp» som pakkede øyer rundt deg (`tidyNetwork`), deg i origo i Nettverk. Dra fra en person gir et kort (`ConnectCard`): oppå en annen = koble med type, ut i tomrommet = ny person de kjenner. Aldri en stille «Venn» |
| #31 | Valgt person på kartet åpner profilen i sidepanelet (PC), personlinje med Logg/Koble til/Profil (mobil) |
| #32 | «Fyll inn kartet» (`/sorter/fyll`): kortstokk over folk på kartet med bare det som mangler (sist sett, hvem, miljø, kjenner, bursdag, fakta), økter på 15. Folk uten logget kontakt samles i én linje på I dag |
| #33 | Claude i flyten: «Fortell om» (fritekst → forslag du krysser av), relasjoner i loggforslag, forslagsskuff rett etter lagret logg |
| #34 | Samme ord: én rytme («Hvor ofte», `CADENCE_WEEKS`), «miljø» i stedet for «tagg», lesbar startzoom på mobil |
| #35 | Klikk på en strek for å endre eller fjerne koblingen |
| #36 | Spørsmålskort (`/sorter/sporsmal`): folk hentes ut av hukommelsen, med miljø, koblinger, rytme eller påminnelse |
| #37 | Søkefelt og månedskapitler i loggen |
| #38 | «Finn … i kartet» fra profilen, `/kart?person=`, miljøer i Innstillinger åpner «Fyll inn» |
| #41 | «Rydd opp» etter felles kjente: øyer med sterke bånd blir naboer, løse folk står ved dem de kjenner, de uten forbindelser i alfabetisk blokk, folk med bånd utover på kanten som vender dit |
| #42 | Nærhet: frastøtingspasset (`relax`, `minRadius`) skyver ingen innenfor den innerste ringen og oppå deg |
| #43 | Nytt navn: Vennd. README med skjermbilder (lys og mørk), GIF av kartet og teknisk del. Utstillingsdata i `scripts/seed-showcase.mts` |

**Kjente hull og idéer som ikke er bygget:** bilder (venter på Blob),
kalender-synk (bare fil i dag), og redigering av forslag før de legges til.
Importen fanger ikke alle duplikater, men sammenslåing finnes. «Fortell om»
hopper over fakta om *nye* personer (bare koblingen foreslås). «Rydd opp»
flytter også folk du har plassert selv (Angre finnes).

**Testdata:** `.dev/seed-real.mts` lager brukeren `real-user` med 122
personer (50 i samme krets, med undergjenger), for å teste mot et ekte stort
kart. Sesjonscookien skrives til `.dev/session-token-real.txt`.
`scripts/seed-showcase.mts` lager `showcase-user` med 42 oppdiktede personer,
logger, tråder, planer og Claude-forslag (uten API-kall). Det er dataene bak
skjermbildene i `docs/screenshots/`. Cookien skrives til
`.dev/session-token-showcase.txt`.

## Åpent for debatt: AI-integrasjonen (Claude)

Dette er **ikke avgjort**. Eieren vil diskutere hvordan Claude skal brukes,
og hvor mye det skal koste, før mer bygges her. Spør før du endrer
oppførselen eller legger til nye Claude-kall.

**Hvordan det er i dag:**
- **Forslag fra logger** (`src/server/claude/suggest.ts`): etter hver lagret
  logg, via `after()`, foreslår Claude tråder, fakta, personer og
  *forbindelser* («Liv og Brage: kjærester», ikke faktumet «Kjæreste:
  Brage»). Et kall per logg, noen øre. Rett etter lagring viser en skuff
  (`SuggestionTray`) «Claude leser loggen …» og så forslagene til akkurat den
  loggen, med «Legg til alle». Det du ikke svarer på, står på I dag og
  profilen.
- **«Fortell om»** (`src/server/claude/tell.ts`, `src/domain/tell.ts`): på
  profilen og i «Fyll inn kartet». Du skriver fritt; Claude foreslår
  etikett, bursdag, miljø, fakta, hvem som kjenner hvem (også nye personer)
  og tråder, og du krysser av. Bare når du trykker «Les», ett kall, rundt
  2–3k tokens inn.
- **Forbindelser** (`src/server/claude/links.ts`): bare når du trykker «Spør
  Claude» under Bygg kartet → Forslag til forbindelser.
  - Hele nettverket sendes komprimert (`summarizeNetwork`). En tett gruppe
    blir én linje, så 71 personer og 813 relasjoner blir rundt 700 tokens.
  - Svaret er maks 12 *innsikter* (`LinkInsight`), for eksempel
    «Vege-søsknene» eller «Gjengen fra Danvik», med valgfritt nytt miljø.
  - Maks én kjøring per 5 minutter (`User.linksAssessedAt`).
- **Modell:** `claude-sonnet-5` med `effort: low`, strukturert utdata
  (zod) og systemprompt med cache. Kan byttes med `CLAUDE_MODEL`, for
  eksempel til `claude-haiku-4-5`.

**Historikk som bør informere debatten:**
- Første versjon av forbindelser kalte Claude etter hvert kort og hver
  relasjon, med opptil 30 par og all felles kontekst. Det kostet 1,25 dollar
  på én sorteringsøkt, med overlappende kall. Det ble rettet i #25–26.
- Første versjon av visningen ga en liste med rundt 450 enkeltpar («er x
  venner med y?»). Eieren syntes det var tungvint og ikke en god bruk av
  Claude, og ønsket samlede, meningsfulle forslag. Det ble rettet i #27–28.

**Åpne spørsmål:**
- Hvor skal Claude gi mest verdi? Uttrekk fra logger, mønstre i nettverket,
  forberedelse før treff («hva bør jeg spørre Ingrid om?»), innsikt over tid,
  eller noe annet?
- Automatisk eller bare når du ber om det? I dag er loggforslag automatiske
  og forbindelser manuelle.
- Kostnadstak: skal det finnes et månedlig budsjett eller en teller i
  Innstillinger?
- Modellvalg: Sonnet 5 eller Haiku, eventuelt ulikt per oppgave.
- Personvern: loggtekst og navn sendes til Anthropic. Innstillinger sier
  fra, men bør det være en egen av/på-bryter?
- Kvalitet: innsiktene er ikke testet grundig mot ekte data. Trenger vi en
  enkel evaluering før vi bygger videre?
