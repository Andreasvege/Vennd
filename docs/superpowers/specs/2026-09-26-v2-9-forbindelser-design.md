# V2 · Delprosjekt 9 — Forslag til forbindelser

**Dato:** 2026-09-26
**Status:** Retning fra brukeren: «Nora er kusinen til Håvard, Hanne, Selma og August. Da burde Claude kunne si at Håvard er fetteren til resten.» Detaljene er delegert.

---

## Mål

Når du tegner relasjoner, skal kartet hjelpe deg med resten. Forslagene kommer i to lag:

1. **Regler:** *hvem* som sannsynligvis henger sammen. Reglene virker alltid, uten nøkkel.
2. **Claude:** *hva* forbindelsen er («søsken», «søskenbarn», «kolleger»), med en kort begrunnelse. Claude luker også bort forslag som ikke gir mening.

Forslaget legges til eller avvises med ett trykk. Det du avviser, kommer ikke tilbake.

## Lag 1: kandidater fra strukturen (`src/domain/linkSuggestions.ts`)

To personer A og B uten relasjon er en kandidat når:

- **Felles naboer:**
  - de har minst to felles naboer, eller
  - én felles nabo og i tillegg samme etternavn eller et felles miljø (tagg).
- **Poeng:**
  - 2 per felles nabo
  - +2 for samme etternavn
  - +1 per felles miljø
  - Høyest først.
- **Typegjetning uten Claude:**
  - Er alle relasjonene til de felles naboene *Familie*, eller har de samme etternavn og minst én familierelasjon, blir forslaget *Familie*.
  - Ellers blir det *Venn*.
- **Hvem som er med:** bare personer på kartet (sortert og ikke arkivert). Par du har avvist, forkastes.

Resultatet er `{ a, b, score, shared: id[], sameSurname, sharedTags: id[], type }`. Funksjonen er ren og testet, og kjøres ved lesing.

## Lag 2: Claude gir betydning (`src/server/claude/links.ts`)

- **Når:**
  - Etter handlinger som endrer relasjoner, via `after()`:
    - `createRelationship`, `updateRelationship`, `deleteRelationship`
    - `sortPerson`, `assignGroup`
    - å godta et forslag
  - Bare når `ANTHROPIC_API_KEY` er satt.
- **Hva som sendes:**
  - Kandidater som ikke allerede har en vurdering, maks 30 per kall.
  - For hver kandidat: navnene, relasjonene til de felles naboene med type, etikett og retning (for eksempel «Nora → Håvard: Familie, kusine»), og felles miljøer.
- **Svar per par** (strukturert utdata):
  - `{ a, b, keep: boolean, type, label: string|null, reason: string }`
  - `keep: false` betyr at forslaget ikke gir mening, for eksempel to tilfeldige kolleger av samme venn. Da skjules det.
  - `label` er kort og norsk: søsken, søskenbarn, fetter, kusine, kolleger, kjærester.
  - `reason` er én setning, for eksempel «Begge er søskenbarn av Nora og heter Hjorthaug.»
- **Modell og innstillinger:** Samme som forslag fra logger. Standard er `CLAUDE_MODEL ?? claude-sonnet-5`, med `effort: low` og systemprompt med cache. Feil gir bare ingen vurdering, så regelforslaget står.

## Data

```prisma
model LinkSuggestion {
  id        String   @id @default(cuid())
  userId    String
  aId       String   // a < b, så paret er entydig
  bId       String
  status    LinkStatus @default(OPEN)   // OPEN, ACCEPTED, DISMISSED
  keep      Boolean  @default(true)      // Claude: gir forslaget mening?
  type      RelationshipType?
  label     String?
  reason    String?
  assessed  Boolean  @default(false)     // Claude har vurdert paret
  createdAt DateTime @default(now())
  @@unique([userId, aId, bId])
}
```

- **Radene:** Én rad per par som er vurdert eller besvart. Kandidatene selv regnes fortsatt ut ved lesing.
- **Ved lesing:**
  - Kandidatene flettes med radene.
  - `DISMISSED`, `ACCEPTED` og `keep: false` skjules.
  - Claudes type, etikett og begrunnelse vinner over regelgjetningen.
- **Sletting:** Radene slettes med personene (Cascade via relasjonsfelt til Person).

## Grensesnitt

- **Profilen, seksjonen «Kjenner kanskje»:**
  - Opptil fem forslag som gjelder personen.
  - Hver rad viser avatar, navn, forslaget (Claudes etikett, eller «Familie» / «kjenner hverandre») og begrunnelsen. Uten Claude er begrunnelsen «Begge kjenner Nora og Martin».
  - Knappene er «Legg til» og ×.
- **Bygg kartet ditt, fjerde vei «Forslag til forbindelser (N)»** (`/sorter/forbindelser`):
  - Alle forslagene, med de sterkeste først.
  - «Legg til alle synlige» for store familier.
- **Kilde:** Forslag fra Claude merkes diskret med «fra Claude», som forslagene fra logger.

## Handlinger (`src/server/actions/links.ts`)

- **`acceptLink(a, b)`:**
  - Lager relasjonen med type og etikett. Kilden er vurderingen hvis den finnes, ellers regelen.
  - Setter status `ACCEPTED`.
  - Planlegger en ny vurdering, siden en ny forbindelse kan åpne for nye forslag.
- **`dismissLink(a, b)`:** setter status `DISMISSED`, med upsert.
- **`acceptAllLinks(pairs)`:** det samme som `acceptLink`, i én transaksjon.
- **Eierskap:** Begge personene må være brukerens. Finnes paret allerede som relasjon, blir det ingen ny.

## Testing

- **Kandidatene:**
  - felles naboer
  - etternavn: «Hjorthaug»-eksempelet gir alle par blant de fire
  - miljø
  - avviste par
  - arkiverte personer
  - typegjetning
  - rekkefølge
- **Tolkningen av svaret fra Claude:** ukjente par ignoreres, `keep: false` skjules, og etiketten kuttes.
- **Handlingene:** godta gir én relasjon, og dobbelt godta gir ingen duplikat.
- **Komponent:** «Kjenner kanskje» med godta og avvis.
- **I nettleseren:** Noras familie i lokal database. Uten nøkkel vises regelforslag. Med nøkkel testes vurderingen i produksjon og kontrolleres i Vercel-loggene.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Regler finner kandidatene, Claude vurderer dem | Billig og forutsigbart, og Claude ser bare nye par, ikke hele nettverket hver gang |
| Minst to felles naboer, eller én pluss etternavn/miljø | Én felles venn alene gir for mange falske forslag |
| Claude kan skjule forslag (`keep: false`) | «Begge kjenner Martin» er ofte tilfeldig. Claude ser konteksten |
| Avviste par kommer aldri tilbake | Ellers blir forslagene mas |
