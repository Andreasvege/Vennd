# V2 · Delprosjekt 6 — Søk og innsikt

**Dato:** 2026-09-26
**Status:** Godkjent retning. Brukeren har delegert detaljbeslutningene; se «Beslutninger du kan overprøve».
**Veikart:** [2026-09-25-vennekart-v2-roadmap.md](2026-09-25-vennekart-v2-roadmap.md)

---

## Mål

Tre spørsmål skal få et svar:

1. **«Hva var det hun sa om …?»** Søk på tvers av folk, logger, tråder og planer, fra hvor som helst.
2. **«Hvem har jeg ikke sett?»** Alle, ikke bare dem med påminnelse, sortert etter hvor lenge siden det er.
3. **«Hvor går tiden min?»** Hvordan kontakten fordeler seg på miljøer, personer og uker.

Målet om at alt skal henge sammen gjelder her også:
- Søket kjenner igjen personnavn. «ingrid intervju» gir Ingrids logger om intervjuet, ikke alle logger med ordet.
- Rytmen fra innsikten («dere ses omtrent hver 9. dag») vises også på profilen.

## Søk

### Inngang
- **Søkeknapp** (forstørrelsesglass) i toppen, på mobil og PC.
- **Tastatur:** ⌘K / Ctrl+K fra hvor som helst, og `/` når fokus ikke står i et tekstfelt. Det følger konvensjonen fra N og P.
- **Paletten** er en modal med søkefelt øverst og treff under, gruppert. På mobil er den et ark i full høyde.

### Tolkning av søket
Tolkningen er en ren funksjon: `interpretQuery(q, persons)` i `src/domain/search.ts`.
- Søket deles i ord. Ord under to tegn ignoreres, med mindre det bare finnes ett ord.
- **Personnavn:**
  - Et ord som er starten på for- eller etternavnet til en person, og som er minst tre tegn, blir et *personfilter*.
  - «ingr» treffer Ingrid Aas, og «aas» gjør det samme.
  - Treffer ordet flere personer (to som heter Ingrid), gjelder filteret alle dem.
- **Resultat:** `{ people: string[][], terms: string[] }`. Hvert ord som ble et personfilter, gir én gruppe id-er. Innenfor en gruppe er det ELLER, mellom gruppene er det OG. Resten er fritekstord.
- Sammenligningen ser bort fra store og små bokstaver. Diakritiske tegn foldes (é → e), men æ, ø og å beholdes. Det er egne bokstaver på norsk.

### Hva som søkes i

| Gruppe | Treffer når | Viser |
|---|---|---|
| **Personer** | Navnet treffer et ord, eller alle fritekstordene finnes i navn, notater, fakta (etikett og verdi) eller taggnavn | Avatar, navn, og hvor treffet var («fakta: Jobb — Statkraft») |
| **Logger** | Deltakerne oppfyller personfiltrene, og alle fritekstordene finnes i teksten | Dato, deltakere, utdrag med treffene uthevet |
| **Tråder** | Personfiltrene er oppfylt, og alle fritekstordene finnes i tittel eller løsning | Tittel, person, åpen eller lukket |
| **Planer** | Personfiltrene er oppfylt, og alle fritekstordene finnes i tittelen | Tittel, når, med hvem |

**Bare personfilter, ingen fritekstord.** «ingrid» alene gir personen, de siste loggene med henne og trådene hennes. Det er en rask vei til «hva har skjedd med Ingrid».

**Antall treff:**
- Maks 5 personer, 8 logger, 5 tråder og 3 planer.
- Logger og planer sorteres på dato, nyeste først. Tråder sorteres med åpne først.
- **«Se alle i loggen»** går til `/logg?q=…`. Dagboken filtreres da med samme tolkning og samme sideinndeling.

### Implementering
- **Søkeendepunkt:** GET `/api/sok?q=` (route handler). Det krever innlogging og gir JSON. En GET kan avbrytes (AbortController), caches ikke, og er det riktige verbet for lesing.
- **Spørringer:**
  - Prisma med `contains` + `mode: 'insensitive'` per ord (OG).
  - Datamengden er personlig: hundrevis av personer og tusenvis av logger. Da trengs ingen indeks eller fulltekstmotor.
  - Diakritisk folding skjer i spørringen for navn: personene hentes én gang og tolkes i JS. For fritekst i databasen holder `ILIKE`.
- **Utdrag:**
  - `snippet(text, terms, radius = 60)` gir segmenter `{ text, match }[]`, sentrert rundt første treff, med «…» der teksten er kuttet.
  - Uthevingen tegnes med `<mark>`, stilt som en markeringstusj i `pen-wash`.
- **Klient:** react-aria `Autocomplete` + `SearchField` + `Menu` med seksjoner.
  - Pil opp og ned flytter i treffene mens fokus blir i feltet (virtuelt fokus), Enter åpner.
  - Forsinkelse på 120 ms. Forrige forespørsel avbrytes.
- **Tomt søk:** en kort forklaring («Søk etter folk, samtaler, tråder og planer. Skriv et navn for å se alt om én person.»).
- **Ingen treff:** «Ingen treff på «x»» og en lenke til å skrive en logg med teksten. Tomrom er en invitasjon.

### Når et treff velges
- **Person:** åpner profilen.
- **Logg:** åpner profilen til første deltaker, rullet til loggen (`#logg-<id>`). Loggen er en del av personens historie.
- **Tråd:** åpner profilen til personen.
- **Plan:** åpner forberedelsesarket på «I dag».

## Innsikt (`/innsikt`)

Ny side. På mobil blir den femte fanen i det tomme feltet til høyre for Skriv. På PC ligger den i toppmenyen etter Logg.

**Periode:** 30 dager, 3 måneder (standard) eller 12 måneder. Perioden ligger i URL-en (`?periode=30|90|365`), så siden kan rendres på serveren og deles med deg selv mellom enheter.

### 1. Hvem har du ikke sett?
- Alle personer, fordelt i bånd etter tid siden sist kontakt: **Over et år**, **Et halvt år**, **Tre måneder** og **Aldri logget**.
  - Personer med kontakt siste tre måneder er ikke med. De er ikke svaret på spørsmålet.
- Innenfor hvert bånd står de som har lengst siden først.
- **Hver rad:**
  - avatar, navn, «sist 14. mars»
  - hovedtaggen som farget prikk
  - handlingene «Logg» og «Planlegg»
- Personer uten påminnelse (kadens null) tones litt ned, med teksten «ingen påminnelse». Det gjør det tydelig at det er et valg, ikke glemsel.
- Hvert bånd viser maks 6, med «Vis alle N».
- Delen gjelder alltid *nå* og avhenger ikke av perioden.

### 2. Hvor tiden går
- **Fordeling på miljø:** andel av loggene i perioden per hovedtagg.
  - En logg med flere personer teller én gang per *distinkt* hovedtagg blant deltakerne.
  - Personer uten hovedtagg havner i «Uten tagg».
  - Andelene summerer da til over 100 % når en logg spenner over flere miljøer. Det er riktig, siden kvelden var med begge miljøene, og det sies i en fotnote.
  - Tegnes som vannrette søyler med skravert blyantfyll i taggens farge (SVG-mønster), med antallet til høyre.
- **Typer:** én setning, for eksempel «18 treff, 6 samtaler, 2 dater».
- **Oftest:** de 8 du har sett mest i perioden, med antall og rytme («hver ~9. dag»).

### 3. Uke for uke (signaturen)
- Hver uke i perioden får en kolonne med **tellestreker**, slik man teller for hånd: fire loddrette og én på skrå over.
  - Tellestreker er dagbokens egen måte å telle på. De gjør et diagram til noe som ser skrevet ut.
- **I 12 måneder** blir strekene til prikker (én per logg, stablet), siden 52 kolonner med tellestreker blir for tett.
- **Etiketter:** månedsnavn under første uke i hver måned.
- **Tilgjengelighet:** diagrammet har en tekstlig oppsummering («Snitt 2,3 logger i uka. Travleste uke: uke 37, 7 logger.») og en skjult tabell med uke og antall.

### Rytme
- `rhythm(dates)` gir medianen av intervallene mellom de siste 10 loggene. Det krever minst tre logger, ellers blir resultatet null.
- Medianen tåler én lang pause bedre enn snittet.
- Rytmen vises:
  - i «Oftest»
  - i profilens hode, som «Dere ses omtrent hver 9. dag» / «… hver 3. uke» / «… hver 2. måned»

## Data

- **`getInsight(userId, days)`:**
  - logger i perioden, med dato, type og deltakernes id-er
  - alle personer med hovedtagg, kadens og siste kontakt (bruker `getLastContact`)
  - taggene
- **`searchAll(userId, q)`:**
  - personene (id, navn) hentes for tolkningen
  - deretter fire spørringer i parallell
- **`getLogPage`** får et valgfritt filter `{ people, terms }`.
- **Rytme på profilen:** datoene til de siste 10 loggene. Spørringen `getPerson` utvides med dem.

Uker regnes som ISO-uker i UTC. Loggdatoer lagres kl. 12:00 UTC, så uken er entydig.

## Rene funksjoner (testet)

- **`src/domain/search.ts`:** `fold`, `interpretQuery`, `snippet`
- **`src/domain/insight.ts`:** `unseenBands`, `byPrimaryTag`, `byType`, `topPeople`, `weekly` og `rhythm`

## Testing

- **Enhetstester:**
  - tolkning: prefiks, flere treff, korte ord, folding med æøå bevart
  - utdrag: kanter, flere treff, ingen treff
  - bånd: grenser
  - fordeling: logg med to miljøer
  - uker: tomme uker tas med, årsskifte
  - rytme: færre enn tre logger, median
- **Komponenttest:** paletten viser grupper og navigerer med piltaster.
- **Endepunkt:** krever innlogging og ser bare egne data.
- **Manuelt:** 390 og 1440 px, lys og mørk, axe 0 brudd.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Personnavn i søket blir filter | «ingrid intervju» betyr nesten alltid «det Ingrid sa om intervjuet» |
| `ILIKE` framfor Postgres fulltekst | Personlig datamengde. Fulltekst med norsk stemming gir lite, og krever migrering og vedlikehold |
| Innsikt som egen fane | «Hvem har jeg ikke sett» er et spørsmål man stiller med vilje, ikke daglig støy |
| Fordeling på *hovedtagg* | Den samme inndelingen som kartets sektorer, så innsikten og kartet forteller det samme |
| Tellestreker som signatur | Et diagram i dagbokens eget formspråk |
| Median som rytme | Tåler ferier og lange pauser |
