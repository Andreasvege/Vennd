# V2 · Delprosjekt 7 — Import

**Dato:** 2026-09-26
**Status:** Godkjent retning. Brukeren har delegert detaljbeslutningene; se «Beslutninger du kan overprøve».
**Veikart:** [2026-09-25-vennekart-v2-roadmap.md](2026-09-25-vennekart-v2-roadmap.md)

---

## Mål

Å komme i gang skal ikke kreve at du skriver inn alle du kjenner for hånd. To kilder dekker mest:

1. **Kontakter** (vCard, `.vcf`): personer med bursdag, telefon, e-post og notat.
2. **Kalender** (iCalendar, `.ics`): treff du har hatt blir logger, og treff som kommer blir planer. Det gjelder bare hendelser der noen du kjenner er med.

Begge eksporteres av iPhone, Google og Outlook uten innlogging eller API-nøkler. Import fra fil er derfor valgt framfor OAuth-integrasjoner: ingen nye hemmeligheter, ingen tredjepart og ingen bakgrunnssynk å vedlikeholde.

## Flyt (`/import`, lenket fra Innstillinger)

1. **Velg fil.** Du kan dra filen inn eller velge den. Filen leses *i nettleseren* og lastes aldri opp som helhet. Bare radene du velger, sendes til serveren.
2. **Forhåndsvisning.** Hver rad har en avkrysningsboks. Det som kan importeres, er krysset av. Det som allerede finnes, er ikke krysset av og har forklaringen «finnes».
3. **Importer.** Én servertransaksjon, og så en kvittering: «Importerte 34 personer. 5 fantes fra før.» Kvitteringen har en lenke til kartet eller loggen.

### Kontakter
- **Felter:**
  - Navn fra `FN`, ellers satt sammen av `N`.
  - Bursdag fra `BDAY`. Formatene er `YYYY-MM-DD`, `YYYYMMDD` og `--MM-DD`. Uten år lagres år 1900, som betyr ukjent år, slik bursdagsmodulen allerede forstår det.
  - Første `TEL` og første `EMAIL` blir fakta: «Telefon» og «E-post».
  - `NOTE` blir notat.
- **Hoppes over:**
  - Kontakter uten navn, og kontakter som bare er en organisasjon (`X-ABShowAs:COMPANY`, eller `ORG` uten `FN`/`N`).
  - Bilder. De venter på bildelagring.
- **Duplikater:** Et navn som allerede finnes, med samme sammenligning som søket (små bokstaver, aksenter foldet), vises som «finnes».
  - Har den eksisterende personen ikke bursdag, men kontakten har det, tilbys «Legg til bursdag» i stedet.
- **Felles for alle importerte:**
  - Du kan velge én eller flere tagger.
  - Kadens er standard (4 uker) eller «ingen påminnelse». Standardvalget for en stor import er **ingen påminnelse**, ellers ville I dag druknet i 300 purringer.
- **Plassering:** Folk plasseres på kartet med `placeNewPerson`, én etter én, så de ikke havner oppå hverandre.

### Kalender
- **Hendelser:** `VEVENT` med `SUMMARY`, `DTSTART`, `DESCRIPTION` og `ATTENDEE` (`CN` eller e-post).
- **Gjentakende hendelser** (`RRULE`) hoppes over, og antallet vises. En ukentlig trening er ikke 52 treff.
- **Personer i hendelsen:**
  - Et deltakernavn som matcher en person, gir treff. E-post matcher mot e-post-faktaene.
  - Ord i tittelen som er for- eller etternavnet til noen, gir også treff: «Kaffe med Ingrid» blir Ingrid, med samme prefiksregel som søket, men på hele ord.
  - Hendelser uten noen kjent person vises ikke. De er møter på jobb, tannlegen og slikt.
- **Passert** (før i dag) blir en logg: type «Møttes», dato, og tekst = tittel (+ beskrivelse, avkortet til 500 tegn).
- **Kommende** blir en plan: tittel, tidspunkt og personer. `hasTime` er usann for heldagshendelser.
- **Duplikater:**
  - En logg samme dag med samme personer finnes allerede, eller en plan med samme tittel og samme tidspunkt finnes.
  - Slike rader vises som «finnes» og er ikke krysset av.
- **Tid:**
  - `DTSTART` med `Z` er UTC.
  - Med `TZID`, eller uten sone, tolkes tiden som lokal tid i nettleseren. Brukeren bor i den tidssonen kalenderen er laget i.
  - En heldagsdato (`VALUE=DATE`) lagres kl. 12:00 UTC, som alle datoer i appen.
- **Periode:** Standard er de siste 12 månedene og framover. Et valg utvider til «alt». Eldre historikk er mest støy.

## Arkitektur

- **`src/domain/import/`** (rene funksjoner, testet):
  - **`lines.ts`:** linjebretting (unfolding), escaping (`\n`, `\,`, `\;`) og parametre (`ATTENDEE;CN=Ingrid Aas:mailto:…`). Delt av begge formatene.
  - **`vcard.ts`:** `parseVCards(text) → Contact[]`.
  - **`ics.ts`:** `parseEvents(text) → CalEvent[]`, med `{ uid, title, description, start: Date, allDay, attendees: {name?, email?}[], recurring }`.
  - **`match.ts`:**
    - `contactStatus(contact, persons)` gir «ny», «finnes» eller «legg til bursdag».
    - `matchEvent(event, persons)` gir personId-er.
    - `eventStatus(...)` finner duplikater.
- **`src/server/actions/import.ts`:**
  - `importContacts(rows, { tagIds, remind })` og `importEvents(rows)`.
  - Validert med zod. Maks 1000 rader, så én transaksjon forblir rimelig.
  - Eierskap sjekkes for tagger og personer. Én transaksjon per import, og `refreshAll()`.
  - Duplikatsjekken gjøres på nytt på serveren. Klientens forhåndsvisning er bare et forslag.
- **`src/app/import/page.tsx`** (server): henter personer (id, navn, bursdag, e-post-fakta), tagger og eksisterende logger/planer for duplikatsjekk. Klientkomponenten `ImportFlow` gjør resten.

## Grensesnitt

- To faner øverst, «Kontakter» og «Kalender» (react-aria `Tabs`), hver med en slippsone. Slippsonen er en `DropZone` + `FileTrigger`, tilgjengelig med tastatur.
- Forhåndsvisningen er en tabell med avkrysning (react-aria `Table` med `selectionMode="multiple"`), og «Velg alle nye» øverst.
  - Kolonnene for kontakter er navn, bursdag og status.
  - Kolonnene for kalender er dato, tittel, personer og blir (logg eller plan).
- Knappen sier nøyaktig hva som skjer: «Importer 34 personer» / «Importer 12 logger og 3 planer».
- Feil i filen (ikke vCard/ics, eller tom) gir en melding i arket som sier hva som var galt og hva du kan gjøre: «Fant ingen kontakter i filen. Eksporter som vCard (.vcf) fra Kontakter.»

## Testing

- **Parserne**, med ekte eksempler fra iPhone, Google og Outlook som fiksturer:
  - bretting, escaping og parametre
  - bursdag uten år
  - UTC, TZID og heldag
  - `RRULE`
  - ødelagt fil
- **`match`:**
  - navn i tittel (hele ord, prefiks)
  - e-post
  - duplikater: samme dag og samme personer
- **Handlingene:** zod-grenser og eierskap.
- **Manuelt:** importer en eksportert fil i nettleseren på 390 og 1440 px. Axe skal gi 0 brudd.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Fil i stedet for Google/iCloud-API | Ingen OAuth, nøkler eller synk-vedlikehold. Det er en engangsjobb |
| Parsing i nettleseren | Hele adresseboka forlater aldri enheten. Bare det du velger, lagres |
| Egen parser, ikke et bibliotek | Formatene er små. Bibliotekene (ical.js m.fl.) er store og dekker mye vi ikke trenger |
| Standard «ingen påminnelse» for importerte | Hindrer at I dag drukner. Kadens settes når noen faktisk betyr noe |
| Bare hendelser med kjente personer | Kalenderen er mest jobb og avtaler. Vennekart handler om folk |
| Telefon og e-post som fakta | Ingen ny modell. Faktaene vises allerede under «Å huske» |
