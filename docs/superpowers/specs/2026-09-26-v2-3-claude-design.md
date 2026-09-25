# V2 · Delprosjekt 3 — Claude-laget

**Dato:** 2026-09-26
**Status:** Godkjent retning. Brukeren har delegert detaljbeslutningene; se «Beslutninger du kan overprøve». Funksjonen er avslått til `ANTHROPIC_API_KEY` er satt.
**Veikart:** [2026-09-25-vennekart-v2-roadmap.md](2026-09-25-vennekart-v2-roadmap.md)

---

## Mål

Når du har skrevet en logg, foreslår Claude det du ellers måtte ha gjort selv:

- **Tråder:** «Spør om andre intervjurunde» (om en uke).
- **Fakta:** «Jobb — Statkraft» på Ingrid.
- **Personer:**
  - Noen du nevner i teksten, men ikke la til som deltaker: «Martin var med?»
  - Noen du ikke har i kartet ennå: «Legg til Kari?»

Hvert forslag godtas eller avvises med ett trykk.

To prinsipper fra veikartet styrer utformingen:
1. **Loggen lagres alltid først.** Claude kjører *etter* at loggen er lagret og svaret er sendt. Er Claude tregt, feiler eller mangler nøkkel, merker du ingenting.
2. **Claude er et lag oppå, ikke et fundament.** Uten nøkkel fungerer alt som før. Ingen skjerm skal se tom eller ødelagt ut.

## Flyt

1. `createLog` lagrer loggen som i dag. Er nøkkelen satt, planlegges forslag med `after()` fra `next/server`. Det kjører etter at svaret er sendt, så skriv-arket lukkes like raskt som før.
2. **I bakgrunnen:**
   - Hent kontekst: deltakerne (navn, fakta, åpne tråder), navnene på alle personene og loggteksten.
   - Kall Claude med strukturert utdata (zod-skjema).
   - Valider svaret mot databasen: navn → id, og bare egne personer.
   - Lagre forslagene som `Suggestion`-rader, og `revalidatePath`.
3. **Forslagene vises:**
   - **I dag:** seksjonen «Forslag» øverst under skriveboksen, gruppert per logg med loggens første linje som overskrift. Når du lagrer en logg og kommer tilbake til I dag, er de der.
   - **Profilen:** forslag som gjelder personen, over «Spør om».
3. **Godta** utfører endringen:
   - lager tråden (åpnet av loggen), faktumet, deltakeren eller personen
   - markerer forslaget som godtatt
   - viser en kort bekreftelse («La til tråd»)
4. **Avvis** markerer forslaget som avvist. Det kommer ikke tilbake.

Forslag eldre enn 14 dager som verken er godtatt eller avvist, vises ikke lenger. Da er de ikke relevante.

## Modell og kostnad

- **Modell:** Standard er `claude-sonnet-5`. Den kan overstyres med miljøvariabelen `CLAUDE_MODEL` (for eksempel `claude-haiku-4-5` for enda lavere kostnad), som brukeren ba om.
- **Innstillinger:**
  - `output_config: { effort: 'low', format: zodOutputFormat(schema) }` med `messages.parse`. Oppgaven er uttrekk, ikke resonnering.
  - `max_tokens: 2000`.
- **Promptcaching:** Systemprompten er stabil og caches.
- **Kostnad:** Hver logg gir et par tusen inn-tokens og noen hundre ut. Det blir noen øre per logg, og noen titalls kroner i måneden ved daglig bruk, som anslått i veikartet.
- **Feil:** API-feil, avslag og ugyldig utdata logges på serveren og gir ingen forslag. Det skjer ingen ny prøving. Loggen er uansett lagret, og et manglende forslag er ingen feil.

## Skjema for utdata

```ts
{
  threads: { people: string[]; title: string; due: 'none' | 'week' | 'month' }[] // maks 3
  facts: { person: string; label: string; value: string }[]                     // maks 5
  people: { name: string }[]                                                     // nevnt i teksten, ikke deltaker; maks 3
}
```

**Hvordan svaret tolkes:**
- `people` / `person` er navn slik de står i konteksten.
- Serveren slår opp navnene:
  - En kjent person som ikke er deltaker, blir forslaget «legg til som deltaker».
  - Et ukjent navn blir forslaget «legg til ny person».
- Fakta som er identiske med et eksisterende faktum (samme etikett og verdi), forkastes.
- Tråder med samme tittel som en åpen tråd forkastes.

**Systemprompten** er på norsk og gir tre instrukser:
- Foreslå bare det teksten faktisk sier.
- Tråder er ting det er naturlig å spørre om *neste gang*, formulert kort som et tema («Andre intervjurunde i Statkraft»). Formen følger dagens tråder.
- Fakta er varige ting (jobb, bosted, partner, allergi), ikke hendelser.

## Data

```prisma
model Suggestion {
  id         String           @id @default(cuid())
  userId     String
  logEntryId String
  kind       SuggestionKind   // THREAD, FACT, PARTICIPANT, PERSON
  payload    Json             // validert med zod per kind ved lesing
  status     SuggestionStatus @default(PENDING) // PENDING, ACCEPTED, DISMISSED
  createdAt  DateTime         @default(now())
  @@index([userId, status, createdAt])
}
```

- **Payload per kind:**
  - `THREAD {title, personIds, dueDate|null}`
  - `FACT {personId, label, value}`
  - `PARTICIPANT {personId}`
  - `PERSON {name}`
- **Sletting:** Forslagene slettes med loggen (`onDelete: Cascade`).

## Kode

- **`src/server/claude/client.ts`:**
  - `isClaudeEnabled()` returnerer om nøkkelen er satt.
  - `suggestModel()` gir `CLAUDE_MODEL ?? 'claude-sonnet-5'`.
  - Klienten opprettes lat, bare på serveren.
- **`src/server/claude/suggest.ts`:**
  - `buildContext(userId, logId)`
  - `askClaude(context)` → utdata etter skjemaet
  - `resolveSuggestions(context, output)` → rader. Ren funksjon, testet.
  - `generateSuggestions(userId, logId)` binder dem sammen.
- **`src/server/actions/suggestion.ts`:**
  - `acceptSuggestion(id)` og `dismissSuggestion(id)`, med eierskap og status-sjekk (`updateMany` med PENDING, så to trykk ikke gir to tråder).
  - `acceptSuggestion` gjenbruker samme logikk som å lage tråd, faktum eller person i dag. Den kopieres ikke.
- **`src/server/queries/suggestions.ts`:** `getPendingSuggestions(userId, personId?)`.
- **Grensesnitt:**
  - `src/components/suggestions/SuggestionList.tsx`, én rad per forslag: ikon, tekst, og knappene «Legg til» og ×.
  - Seksjonsoverskriften er «Forslag fra Claude», med en diskret merking av kilden, så du vet hvor forslaget kommer fra.
- **Innstillinger:** en linje under «Konto»:
  - «Forslag fra Claude: på (claude-sonnet-5)», eller «av — sett ANTHROPIC_API_KEY for å slå på».
  - En kort merknad om at loggteksten sendes til Anthropic når funksjonen er på.

## Testing

- **`resolveSuggestions`:**
  - navneoppslag (fornavn, fullt navn, ukjent navn, tvetydig)
  - duplikater (eksisterende fakta og tråder) forkastes
  - maks antall
  - deltaker vs. ny person
- **Handlingene:**
  - godta hver type
  - dobbelt godta gir én endring
  - eierskap
  - avvis
- **Uten nøkkel:** `createLog` planlegger ingenting, og ingen forslag vises. Testes ved at modulen for `after` ikke kalles.
- **Manuelt med nøkkel:**
  - skriv en logg og se forslagene på I dag
  - godta en tråd og se den under «Spør om»
- **Axe:** 0 brudd.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Forslag lagres i databasen, vises på I dag og profilen | Skriv-arket skal lukkes umiddelbart (mål: under 30 sek). Forslagene venter på deg der du ser uansett |
| `after()` i stedet for kø/jobb | Én bruker, få logger. `after` holder funksjonen i live til kallet er ferdig, uten ny infrastruktur |
| Sonnet 5 med `effort: low`, kan byttes med `CLAUDE_MODEL` | God norsk og presist uttrekk til lav pris. Haiku er et billigere alternativ |
| Ingen ny prøving ved feil | Et manglende forslag koster ingenting. En ny prøving koster tokens og kompleksitet |
| Forslag forsvinner etter 14 dager | Gamle forslag blir støy |
