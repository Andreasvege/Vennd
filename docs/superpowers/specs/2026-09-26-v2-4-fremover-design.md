# V2 · Delprosjekt 4 — Fremover i tid

**Dato:** 2026-09-26
**Status:** Godkjent retning (detaljbeslutninger delegert; se «Beslutninger du kan overprøve»)

## Mål

Til nå har appen bare sett bakover: hva som skjedde, og hvem du ikke har sett. Dette delprosjektet lar den se framover, slik at den kan hjelpe deg *før* et treff og minne deg på å skrive *etterpå*.

1. **Planlagte treff og dater.** «Middag med Ingrid lørdag», eller «Date med Hanna torsdag 19:30».
2. **Før treffet.** I dag viser det som kommer. Et trykk åpner en kort oversikt for hver person: *Spør om*, *Sist gang* og *Å huske*.
3. **Etterpå.** Når tidspunktet er passert, spør I dag «Hvordan gikk det?». Et trykk åpner skriv-arket, forhåndsutfylt med personene, typen og datoen. Når loggen lagres, er treffet ferdig.
4. **Bursdager.** «Ingrid fyller 29 på lørdag» står i I dag de siste 14 dagene før, og profilen viser når neste bursdag er.
5. **Tråder med dato.** En oppfølgingslinje i skriv-arket kan få «ta opp igjen» (om en uke, om en måned eller en valgt dato). Den dukker opp under *Kommende* når dagen kommer.

## Datamodell

```prisma
model Plan {
  id        String        @id @default(cuid())
  userId    String
  at        DateTime      // tidspunkt; kl. 12:00 UTC hvis bare dato er valgt
  hasTime   Boolean       @default(false)
  title     String        // «Middag på Smalhans»
  type      LogEntryType? // MET, DATE, …
  status    PlanStatus    @default(PLANNED)
  logEntryId String?      @unique   // loggen som fulgte opp
  createdAt DateTime      @default(now())
  persons   PlanPerson[]
}
enum PlanStatus { PLANNED DONE CANCELLED }
model PlanPerson { planId String; personId String; @@id([planId, personId]) @@index([personId]) }
```

## Domene (rent og testet)

- **`birthdays.ts`:**
  - `nextBirthday(birthday, now)` gir `{ date, inDays, turns | null }`. `turns` er `null` når året er ukjent (år < 1901).
  - 29. februar feires 28. februar i år som ikke er skuddår.
  - `upcomingBirthdays(persons, now, days = 14)` sorterer etter hvor snart bursdagen kommer.
- **`plans.ts`:** `splitPlans(plans, now)` gir `{ upcoming (i dag og de neste 7 dagene, sortert), awaiting (passert, fortsatt PLANNED) }`. Et treff med tid er passert når tidspunktet er passert. Et treff uten tid er passert fra dagen etter.
- **`dueDates.ts`:** `dueFrom(choice, now)` gjør om «om en uke», «om en måned» og en valgt dato til ISO-dato.

## Handlinger

- `createPlan({ title, personIds, date, time?, type? })`
- `updatePlan`
- `cancelPlan(id)` («Ble ikke noe av»)
- `createLog` får valgfri `planId`. I samme transaksjon settes planen til `DONE`, med `logEntryId`. Eierskap og `PLANNED` sjekkes.
- `logInput.newThreads[].dueDate` finnes allerede i skjemaet, og brukes nå fra skriv-arket.

## Grensesnitt

- **Planlegg-arket:**
  - personvelger (samme som skriv-arket), tittel, dato (i dag, i morgen, lørdag, eller valgfri) og valgfritt klokkeslett
  - type-chips
  - åpnes fra I dag («Planlegg noe»), fra profilen («Planlegg») og med tasten `P`
- **I dag, i prioritert rekkefølge:**
  1. skriveboks og «Planlegg noe»
  2. **Hvordan gikk det?** (treff som venter på logg)
  3. **Kommende**: planer og tråder med dato, i dato-rekkefølge
  4. **Bursdager**
  5. Bør ta kontakt
  6. Sist logget
- **Oversikten før treffet** er et ark med én blokk per person: *Spør om* (åpne tråder), *Sist gang* (siste logg) og *Å huske* (fakta). Den har knappen «Åpne profilen».
- **Profilen** viser planlagte treff øverst («Lørdag: Middag på Smalhans»), og «Bursdag om 3 dager» i metalinjen.
- **Skriv-arket:** preset-støtte for `{ personIds, type, date, text, planId }`. Hver oppfølgingslinje får «Ta opp igjen» med valgene Ingen, Om en uke, Om en måned og Velg dato.

## Testing

Domenetester (bursdager, med skuddår og årsskifte; plansplitt rundt midnatt og med og uten tid; dueFrom), skjematester, en komponenttest for oversikten, og manuell sjekk av hele sløyfen: planlegg, se oversikten, «Hvordan gikk det?», og logg som lukker planen.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Planer er egne rader, ikke logger med framtidig dato | En plan kan avlyses og har en annen livssyklus; loggen er det som faktisk skjedde |
| Oversikten før treffet er et ark, ikke en egen side | Den brukes i farta, rett før du går |
| Bursdager vises 14 dager før | Tid til å kjøpe noe, ikke så lenge at lista blir støy |
| Ukjent fødselsår lagres som år 1900 | Ingen ny kolonne; alder vises bare når året er kjent |
