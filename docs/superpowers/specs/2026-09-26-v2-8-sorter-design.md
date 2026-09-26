# V2 · Delprosjekt 8 — Bygg kartet ditt (sortering)

**Dato:** 2026-09-26
**Status:** Retning valgt av brukeren: alle tre måtene, med kortstokken som hovedinngang, i stil med hvordan Letterboxd tar deg inn i appen første gang. Detaljene er delegert; se «Beslutninger du kan overprøve».

---

## Problemet

Etter en import på 99 kontakter var kartet fullt av løse prikker uten relasjoner. Det er overveldende, og det er uklart hvor man skal begynne. Kartet får først mening når folk har en plass (miljø), en nærhet og forbindelser til hverandre.

## Tre måter, ett sted

**`/sorter` — «Bygg kartet ditt»** samler alt:

| | Hva | Når |
|---|---|---|
| **Én og én** (kortstokken) | Ett kort per person: hvor nær, hvilket miljø, hvem de kjenner. Eller «Ikke i kartet». | Hovedinngangen. Engasjerende, grundig, og kan gjøres fem minutter om gangen. |
| **Miljø for miljø** | Velg et miljø, kryss av hvem som hører til, og velg om alle kjenner alle. | Raskest for vennegjenger og familie: femten personer og hele gruppa koblet på et minutt. |
| **Venter** (bunken) | Alle usorterte i en søkbar liste, med massevalg: legg i et miljø, eller ta ut av kartet. | Oversikt og opprydding, som å bli kvitt tannlegen og rørleggeren fra kontaktlista. |

## Usortert og «ikke i kartet»

**Nye felt på Person:**
- `sortedAt DateTime?`: `null` betyr usortert.
- `archivedAt DateTime?`: satt betyr «ikke i kartet».

**Hvem som er usortert:**
- **Import** lager usorterte personer.
- **Manuell oppretting** («Ny person», eller et nytt navn i skriv-arket) regnes som sortert, fordi du la dem til med vilje.
- **Når man blir sortert:**
  - når kortet lagres
  - når du legger dem i et miljø i «Miljø for miljø» eller fra bunken
  - når de får en tagg i redigering, en relasjon, eller blir med i en logg
  - felles hjelper: `markSorted(userId, personIds)`

**Migrering av eksisterende personer:** Personer som har minst én tagg, relasjon eller logg, får `sortedAt = createdAt`. Resten blir usortert, og det fanger opp de 99 som nettopp ble importert.

**Usorterte:**
- vises ikke på kartet
- vises i søk, med merket «usortert»
- gir ingen påminnelser. Det er naturlig, siden de ikke har fått en nærhet ennå.

**Ikke i kartet (arkivert):**
- vises ikke på kartet, i påminnelser, i Innsikt («Hvem har du ikke sett?») eller i søk
- gjenkjennes fortsatt av importen, så en ny import henter dem ikke inn igjen
- kan hentes tilbake fra bunken, under «Ikke i kartet (N)»

## Kortstokken (`/sorter/kort`)

Ett kort midt på skjermen: stor avatar, navn i Fraunces, og det vi vet om personen (bursdag, telefon eller e-post, notat). Kortet stiller tre spørsmål, i rekkefølge:

1. **Hvor nær?** Fire valg som setter type og påminnelse i ett:
   - *Nær* (Venn, hver 4. uke)
   - *Familie* (hver 3. uke)
   - *Innimellom* (Venn, hver 12. uke)
   - *Perifer* (Bekjent, ingen påminnelse)

   Standardene kommer fra `DEFAULT_CADENCE_WEEKS`. Justering skjer på profilen.
2. **Hvilket miljø?** Taggene som brikker (flere kan velges), og «+ Nytt miljø» på stedet.
3. **Kjenner de noen?**
   - Når et miljø er valgt: brikker for dem som alt er sortert i det miljøet.
   - Et søkefelt for alle andre.
   - Hvert valg blir en relasjon av typen Venn.

**Handlinger:**
- **Neste** (Enter): lagre og gå videre.
- **Hopp over:** kortet legges bakerst.
- **Ikke i kartet:** arkiverer personen.
- **Angre:** sist behandlede kort kommer tilbake. Det lagrede står, og du kan rette det.

**Rekkefølge:**
- De som mest sannsynlig betyr noe, kommer først: de som er med i logger, så de med bursdag, så resten alfabetisk.
- Etter at noen er sortert inn i et miljø, kommer usorterte med samme etternavn eller samme e-postdomene rett etter, fordi det ofte er familie og kollegaer. Det er et forslag til rekkefølge, ikke noe som låser.

**Fremdrift og avslutning:**
- En tynn linje øverst viser fremdriften, «12 av 99». Du kan gå ut når som helst, og neste gang fortsetter du der du slapp, fordi de usorterte står igjen.
- **Ferdig-skjerm:** «Kartet ditt: 42 personer i 5 miljøer, 60 forbindelser», med knappen «Se kartet».

**Bevegelse:** Kortet glir ut til venstre, og det neste glir inn. Med `prefers-reduced-motion` byttes kortet uten animasjon.

## Miljø for miljø (`/sorter/miljo`)

1. **Velg miljø:** taggene med antall personer, eller «Nytt miljø».
2. **Hvem hører til?**
   - Søkbar liste der de usorterte står først, med avkrysning.
   - De som allerede er i miljøet, er krysset av, og kan fjernes.
3. **Kjenner de hverandre?**
   - **Alle kjenner alle:** lager relasjoner mellom alle par som mangler. Anbefalt, og standard opp til 12 personer.
   - **Jeg velger:** en liste der hver person får brikker for hvem de kjenner i gruppa.
   - **Bare miljøet:** ingen relasjoner. Standard over 12 personer.
4. **Oppsummering** med «Neste miljø» eller «Til kortstokken».

Alt lagres i én transaksjon ved steg 3. Nye i miljøet får taggen (og hovedtaggen hvis de ikke har en), blir sortert, og får nærhet *Innimellom* hvis de var usorterte.

## Venter-bunken (`/sorter/venter`)

- Søkbar liste over de usorterte, med avkrysning og «Velg alle».
- **Massehandlinger:**
  - **Legg i miljø …** åpner «Miljø for miljø» med de valgte ferdig krysset av.
  - **Ikke i kartet** arkiverer de valgte.
  - **Sorter én og én** åpner kortstokken med bare de valgte.
- Nederst står «Ikke i kartet (N)», som kan åpnes, og der hver person kan få «Tilbake».

## Innganger

- **Kartet:**
  - Når noen er usorterte, vises en brikke øverst: «99 venter på en plass», som åpner `/sorter`.
  - Tomt kart med usorterte gir en tom tilstand med «Bygg kartet ditt».
- **I dag:** et kort øverst når det er usorterte: «99 personer venter på en plass i kartet» med «Begynn».
- **Etter import:** kvitteringen lenker til «Sorter dem nå» i stedet for «Se kartet».
- **Innstillinger:** «Bygg kartet ditt», med antall usorterte.

## Bedre import av mange kontakter

- Søkefelt over forhåndsvisningen.
- Et hint: «Du kan importere alle og sortere dem etterpå — de havner i Venter, ikke i kartet.»

## Arkitektur

- **Rene funksjoner** i `src/domain/sorting.ts`, med tester:
  - `deckOrder(persons, …)` gir rekkefølgen.
  - `nextAfter(sorted, deck)` flytter slekt og kolleger fram.
  - `missingPairs(ids, existing)` gir parene som mangler.
  - `closenessPreset(choice)` gir `{ type, cadenceWeeks }`.
- **Handlinger** i `src/server/actions/sort.ts`:
  - `sortPerson({ personId, closeness, tagIds, knows })`
  - `assignGroup({ tagId, personIds, connect: 'all' | 'pairs' | 'none', pairs? })`
  - `archivePersons(ids)`, `restorePersons(ids)`
  - `createTagInline(name)` gjenbruker `createTag`.
  - Alt er validert med zod og har eierskapssjekk. Hver handling kjører i én transaksjon.
- **`markSorted`** i `src/server/actions/shared.ts` brukes også av `updatePerson` (tagger), `createRelationship` og `createLog`.
- **Spørringer:** `getSortingData(userId)` henter usorterte, sorterte med tagger, tagger og relasjoner.
  - Graf, påminnelser, innsikt og søk filtrerer bort arkiverte.
  - Grafen filtrerer også bort usorterte.
- **Migrering:** `20260926170000_sorting` legger til kolonnene og fyller dem ut etter regelen over.

## Testing

- **Enhetstester:**
  - rekkefølgen i kortstokken
  - slekt og kolleger flyttes fram
  - manglende par (ingen duplikater, uansett retning)
  - nærhetsvalg
- **Komponenttester:** kortstokken (Neste med Enter, Hopp over, Ikke i kartet, Angre) og miljøflyten (velg, kryss av, «Alle kjenner alle»).
- **I nettleseren:**
  - importer 200 kontakter, og se at kartet er tomt med brikken «Venter»
  - sorter ti med kortstokken
  - legg en gruppe i et miljø med «Alle kjenner alle»
  - se kartet
- **Axe:** 0 brudd, lys og mørk modus, 390 og 1440 px.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Usorterte vises ikke på kartet | Kartet skal vise nettverket ditt, ikke kontaktlista. Løse prikker er støy til de har en plass |
| «Ikke i kartet» arkiverer i stedet for å slette | Angrbart, og en ny import henter dem ikke inn igjen |
| Nærhet som fire enkle valg | Ett trykk per kort, ikke type pluss kadens. Detaljene justeres på profilen |
| Relasjoner fra kortet er «Venn» | Det vanligste. Typen kan endres på relasjonen |
| «Alle kjenner alle» som standard opp til 12 | Små grupper er som regel slik. I store grupper blir det uriktig og tett |
| Eksisterende uten tagg, relasjon og logg blir usortert | Fanger opp importen som allerede er gjort, uten å røre folk du har jobbet med |
