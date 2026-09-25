# V2 · Delprosjekt 5 — Kartet

**Dato:** 2026-09-26
**Status:** Godkjent retning (brukeren har delegert detaljbeslutninger; se «Beslutninger du kan overprøve»)
**Veikart:** [2026-09-25-vennekart-v2-roadmap.md](2026-09-25-vennekart-v2-roadmap.md)

---

## Mål

Kartet skal svare på tre spørsmål. Hvert spørsmål får sitt eget syn på de samme dataene:

| Syn | Oppsett | Svarer på |
|---|---|---|
| **Nærhet** (standard) | Ringer rundt deg. Jo nærmere midten, jo ferskere er kontakten. | Hvem står meg nær, og hvem glipper? |
| **Nettverk** | Fritt oppsett. Du plasserer folk selv, og gruppene tegnes som blyantomriss. | Hvem kjenner hvem? |
| **Kretser** | Personene står på en sirkel, gruppert etter hovedtagg, og relasjonene er buntet gjennom midten. | Hvordan henger miljøene sammen? |

**Felles for alle tre synene:**
- samme personer, relasjoner, tagfilter og valgt person
- bare *plasseringen* endres, og personene glir til nye plasser når du bytter syn
- kontakt som er lenge siden, falmer i alle tre

**Tagfilter og lagrede visninger:**
- Tagfilteret virker som å skru kalendere av og på.
- Filtre kan lagres som visninger, for eksempel «Vis til andre», som skjuler det romantiske.
- Dette erstatter en egen diskret modus.

**Utledede relasjoner:** folk som ofte er med i samme logg, får en svak prikket kant, selv om ingen har registrert en relasjon mellom dem.

## Ferskhet: den ene verdien alt bygger på

`freshness(lastContact, cadenceWeeks, now) → 0..1` ligger i `src/domain/freshness.ts` og er ren og testet.

- **Grunnlag:** hvor lenge siden du sist hadde kontakt, sett mot personens kadens. `cadenceWeeks = null`, altså aldri påminn, bruker 26 uker som mål, så også «perifere» folk kan falme.
- **Verdien:**
  - 1 når det er under halve kadensen siden sist.
  - Faller lineært til 0 ved tre ganger kadensen.
  - 0 hvis du aldri har hatt kontakt.
- **I Nærhet:** avstanden fra midten er `R_MIN + (1 − freshness) · (R_MAX − R_MIN)`.
- **I alle syn:** nodens opasitet er `0,35 + 0,65 · freshness`. Aldri usynlig: kartet skal vise alle, bare dempe de gamle.

Ferskhet er valgt som mål på nærhet fordi den er *forklarbar*: «Du har ikke sett Nora på fire måneder.» En sammensatt poengsum (type + frekvens + ferskhet) ville vært vanskelig å forstå og vanskelig å stole på.

## Layout-motorene (`src/domain/layouts/`)

Alle er rene funksjoner. De tar personer (med id, hovedtagg og ferskhet), relasjoner og størrelse, og gir tilbake posisjoner. Kretser gir i tillegg kontrollpunkter for kantene.

- **`nearness`:**
  - Vinkelen bestemmes av hovedtagg. Hver tagg får en sektor, i fast rekkefølge (sortOrder, så navn). Personer uten tagg står sist.
  - Innenfor sektoren sorteres personene alfabetisk. Da er plasseringen stabil fra dag til dag: bare avstanden endrer seg når ferskheten gjør det.
  - Ringer (tre bakgrunnssirkler) har etikettene «Nylig», «En stund siden» og «Lenge siden».
- **`circles` (Kretser):**
  - Personene står på en sirkel med radius R, gruppert etter hovedtagg, med et mellomrom mellom gruppene.
  - Hver gruppe har et *anker* på radius 0,35 R, i gruppens midtvinkel.
  - En kant mellom to grupper er en kubisk Bézier-kurve: `start → anker(gruppe A) → anker(gruppe B) → slutt`. Kanter mellom de samme gruppene følger da samme «kabel». Det er hierarkisk kantbunting med to nivåer (gruppe → person).
  - En kant innenfor én gruppe er en kvadratisk kurve med kontrollpunkt på 0,7 R i midtvinkelen.
  - Gruppenavnene står som buer utenfor sirkelen.
- **`network`:** de lagrede posisjonene (dagens oppførsel). I tillegg kommer `hulls`: et konvekst skall per hovedtagg med minst to medlemmer. Skallet utvides med 40 px og glattes (Catmull–Rom), og tegnes som et stiplet blyantomriss med taggens navn i Fraunces italic.

«Deg» står i midten i Nærhet og Kretser, og i tyngdepunktet i Nettverk. Strålene fra deg vises bare i Nettverk. I Nærhet sier ringene det samme, og i Kretser ville strålene druknet buntene.

## Rendering

**React Flow beholdes for alle tre synene.** Det gir panorering, zoom, valg, tastatur, relasjoner ved å dra og tilgjengelighet gratis.

- Synene er bare ulike posisjoner.
- Kretser-kantene er en egen kanttype som tegner banen fra kontrollpunktene i `data`.
- Bakgrunnslagene (ringer, gruppeomriss, gruppebuer) tegnes i en `ViewportPortal`-SVG, slik at de følger panorering og zoom.

**Overganger:**
- Ved bytte av syn interpoleres nodeposisjonene over 450 ms med `ease-in-out`, i én `requestAnimationFrame`-løkke.
- Kantene følger nodene av seg selv. I Kretser tones de buntede banene inn etter overgangen.
- `prefers-reduced-motion` gir et umiddelbart bytte.
- Etter bytte kjøres `fitView`.

Personer kan bare dras i **Nettverk**, der plasseringen er din. Relasjoner kan lages ved å dra i alle syn.

## Filter og visninger

**Filtertilstand** (`MapFilter`, et rent objekt):

```ts
type MapFilter = {
  hiddenTags: string[]      // tag-id-er som er skrudd av
  showUntagged: boolean
  hideRomanticEdges: boolean
  showHistorical: boolean   // avsluttede relasjoner
  showDerived: boolean      // utledede fra felles logger
}
```

**Hvem som vises, og hvilke kanter:**
- En person vises hvis minst én av taggene hennes er på. Uten tagger vises hun når `showUntagged` er på.
- En kant vises når begge endene vises, og når kantens type og tilstand er slått på.
- Logikken ligger i `src/domain/mapFilter.ts` og er testet.

**Grensesnitt:**
- En knapp «Filter» med antall aktive filtre som merke. Den åpner en popover (et ark på mobil) med:
  - tagger som avkrysningsbokser med fargeprikk
  - «Uten tagg»
  - «Romantiske relasjoner», «Avsluttede relasjoner» og «Ofte sammen (fra loggene)»
- Visningene står som chips over kartet: «Alle», og så de lagrede. «Lagre som visning» spør om et navn.

**Lagring:**
- Ny modell `MapView { id, userId, name, mode, filter Json, sortOrder }`, med handlingene `saveView`, `renameView` og `deleteView`.
- Filteret valideres med zod (`mapFilter`-skjema), og ukjente tag-id-er ignoreres ved lesing.
- Siste brukte syn og filter lagres i `localStorage` (`map-state`), slik at kartet åpner der du slapp. Lagrede visninger ligger i databasen, slik at de følger deg mellom enheter.

## Utledede relasjoner

- `derivePairs(logs: { personIds }[], existing: [a,b][], min = 2)` gir par som har vært sammen i minst to logger, og som ikke har en registrert relasjon. Den gir også antallet.
- Kanten tegnes med prikkstrek i `ink-muted`, med tittelen «Sammen i 3 logger» (i `title`, og som `aria-label` for skjermlesere).
- Et klikk på en slik kant åpner «Ny relasjon» med de to allerede valgt. Det gjør det lett å gjøre utledet om til registrert.

## Data

`getGraph` utvides med:
- `lastContact` per person (samme `GROUP BY` som påminnelsene bruker)
- `tagIds` per person
- `primaryTag` (id, navn, farge og sortOrder)
- `tags`: alle tagger i rekkefølge, til filteret og sektorene
- `derived`: utledede par med antall

Ferskhet regnes på klienten, slik at «nå» er leserens nå.

## Grensesnitt, oppsummert

- **Øverst til venstre på kartet:** et segmentvalg med Nærhet, Nettverk og Kretser (react-aria `ToggleButtonGroup`, som går an å bruke med tastatur).
- **Ved siden av:** «Filter».
- **Under:** visningschips.
- **Forklaringen nederst til venstre** viser hovedtaggene som er synlige, og kan klikkes for å skru en tagg av eller på. Det er en snarvei til filteret.
- **På mobil** er syn og filter samlet i én kompakt rad, og visningschipsene kan scrolles sidelengs.

## Testing

- **Enhetstester:** `freshness`, `nearness`, `circles` (sektorer, stabil rekkefølge, anker, at buntede kanter mellom samme grupper deler kontrollpunkter), `hulls` (konvekst skall og degenererte tilfeller med én eller to personer), `mapFilter`, `derivePairs` og `interpolate` (overgangen).
- **Komponenttest:** bytte av syn endrer posisjonene. Filter skjuler personer og kantene deres.
- **Handlinger:** zod-skjemaet for visning og eierskap.
- **Manuelt i nettleseren:** alle tre syn, i lys og mørk modus, på 390 og 1440 px. Overgangen skal være myk, og umiddelbar med redusert bevegelse. Axe skal gi 0 brudd.

## Beslutninger du kan overprøve

| Beslutning | Begrunnelse |
|---|---|
| Nærhet måles som *ferskhet mot kadens* | Forklarbar, og bruker kadensen du allerede har satt |
| Nærhet er standardsyn | Svarer på det viktigste daglige spørsmålet: hvem glipper? |
| React Flow for alle tre syn, ikke et eget d3-lag | Beholder dra, zoom, tastatur og tilgjengelighet. Buntingen trenger bare egne kantbaner |
| Å dra personer går bare i Nettverk | I de andre synene er plasseringen beregnet, og å dra ville vært løgn |
| En person vises hvis *minst én* tagg er på | Som kalendere: en person i to grupper forsvinner ikke fordi én gruppe er skjult |
| Utledet krever minst 2 felles logger | Én felles middag er ikke en relasjon |
| Siste syn og filter i localStorage, lagrede visninger i DB | Det du nettopp gjorde er lokalt; det du har navngitt er ditt overalt |
