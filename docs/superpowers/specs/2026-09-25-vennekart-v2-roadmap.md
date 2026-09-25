# Vennekart V2 — Veikart

**Dato:** 2026-09-25
**Status:** Utkast — mål, delprosjekter og visuell retning (A · Dagbok) avklart

---

## Hvorfor V2

Vennekart er bare for meg selv. V1 fungerer, men føles som en tidlig tech demo:
ting lever hver for seg, og appen hjelper meg ikke nok i øyeblikkene som betyr noe.

V2 skal gjøre kjernesløyfen **fange → huske → følge opp** skarp, og få alt til å
henge sammen: det jeg skriver ett sted, skal dukke opp overalt der det er relevant.

**Eksempelet som styrer alt:** Jeg traff Ingrid i går, vi gikk tur og snakket om
jobbintervjuet hennes. Neste gang jeg skal treffe henne, trykker jeg på henne og ser
«åja, spør hvordan andre intervjurunde gikk».

## Mål

1. Jeg åpner appen før jeg treffer noen, og den gir meg noe konkret å spørre om.
2. Å logge et treff tar under 30 sekunder på mobilen.
3. Det jeg skriver ett sted, dukker opp overalt det er relevant: profil, påminnelser,
   kart og søk.
4. Appen ser ut og føles som et ferdig produkt, ikke en demo.

## Beslutninger så langt

- **Oppfølgingstråder** er kjernen. Jeg markerer dem selv når jeg logger, og kan lukke
  dem med en oppdatering («fikk jobben!»).
- **Claude som lag oppå**, ikke som fundament. Claude foreslår personer, tråder og
  fakta fra loggteksten, og jeg godtar dem med ett trykk. Loggen lagres alltid først,
  så AI-feil eller treghet aldri ødelegger loggingen. Anslått kostnad: noen titalls
  kroner i måneden. Modellvalget tas i spesifikasjonen for delprosjekt 3.
- **To veier inn i loggen:** fri logging fra hvor som helst (kjenner igjen personer i
  teksten) og logging via personen. En logg kan gjelde flere personer.
- **Både mobil og PC** må fungere godt. Appen skal kunne installeres på hjemskjermen
  (PWA). Stemme-til-tekst dekkes av tastaturets egen diktering.
- **Tagger erstatter grupper.** En person kan ha flere tagger (folkehøgskole,
  studentradio, familie, romantisk …). Kartet filtreres som kalendere i en
  kalenderapp, og filtersett kan lagres som visninger (f.eks. «Vis til andre»). Dette
  erstatter en egen diskret modus. Filteret gjelder både personer (tagger) og kanter
  (relasjonstype).
- **Dating:**
  - Relasjoner har tid (start og slutt, nå eller før), slik at eks-er og tidligere
    forhold blir historiske kanter.
  - Romantisk er en egen relasjonstype, både mellom meg og andre og mellom andre.
  - Min egen dating følger faser: første date → ser hverandre → eksklusive →
    kjærester / avsluttet, med dato for hver overgang.
  - Dater logges som vanlige logger og gir tråder som alt annet.
- **Koblingsvarsel:** Når en ny kobling gjør verden mindre, sier appen fra
  («Hanna → Jonas → Ingrid»). Dette er korteste vei i grafen, og kan også brukes
  generelt: velg to personer og se hvordan de henger sammen.
- **Hierarkisk kantbunting** blir et alternativt syn på kartet. Hver person får da en
  hovedtagg, som bestemmer hvilken gren personen henger på.

## Status (2026-09-25)

| # | Status |
|---|---|
| 0 Visuell retning | Ferdig: PR #1 |
| 1 Fundament | Ferdig: PR #2 (prod-migrering kjøres etter merge) |
| 2 Kjernesløyfen | Ferdig: PR #3, unntatt bilder (venter på Vercel Blob-lagring) |
| 3–7 | Ikke startet. 3 trenger `ANTHROPIC_API_KEY`. |

## Delprosjekter

Hvert delprosjekt får sin egen runde med spesifikasjon, plan og implementasjon.
Rekkefølgen følger avhengighetene: nesten alt lever av loggdataene, så de må være
riktige først.

| # | Delprosjekt | Innhold |
|---|---|---|
| 0 | **Visuell retning** | Velg retning (se nedenfor) og etabler tokens: farger, typografi, spacing og komponenter. Gjøres før eller parallelt med 2, så nye skjermer bygges i riktig stil fra start. |
| 1 | **Fundament** | Logger med flere personer, oppfølgingstråder, faste fakta, tagger, relasjoner med tid, romantisk type med faser. Datamodell og migrering av eksisterende data. |
| 2 | **Kjernesløyfen** | Rask logging og logging via person, profilen som kort oversikt («spør om», sist gang, å huske), tråder i påminnelsene, koblingsvarsel, PWA. |
| 3 | **Claude-laget** | Forslag til personer, tråder og fakta fra loggteksten, godtas med ett trykk. |
| 4 | **Fremover i tid** | Planlagte treff og dater (oversikt før, «hvordan gikk det?» etterpå), bursdager som påminnelser. |
| 5 | **Kartet** | Levende kart (nærhet og hvor fersk kontakten er, falming), tagfilter og lagrede visninger, utledede relasjoner, sti mellom to personer, hierarkisk kantbunting. |
| 6 | **Søk og innsikt** | Søk på tvers av alt, «hvem har jeg ikke sett?», hvordan tiden fordeles. |
| 7 | **Import** | Kontakter og kalender. |

Delprosjekt 1 og 2 kan slås sammen i én spesifikasjon, siden fundamentet alene ikke
kan testes i bruk.

## Visuell retning (delprosjekt 0)

Dagens stil (mørk navy, lilla aksent, glassmorfisme, rester fra en boilerplate) føles
halvferdig. Tre retninger er skissert på lerretet
«Vennekart V2 – visuelle retninger» (claude.ai artifact):

- **A · Dagbok:** Varmt papir og blekk, serif-overskrifter. Kartet som en tegnet
  vennekrets.
- **B · Bane:** Natt, konsentriske baner for nærhet, personer som lys som falmer når
  kontakten blir gammel.
- **C · Atlas:** Presis og kartografisk. Radial kantbunting med tagger som buer,
  datatett profil.

**Valgt: A · Dagbok.** Den er mest attraktiv og lettest å vise frem, hvis appen en
dag skal spres videre. B og C lever videre som karttyper (se under), tegnet i
Dagbok-stil.

### Tre syn på samme kart

Kartet får tre syn over de samme dataene og det samme tagfilteret. Bare plasseringen
endres, og personene glir til nye plasser når du bytter syn.

| Syn | Oppsett | Svarer på |
|---|---|---|
| **Nettverk** (fra A) | Fritt, kraftbasert oppsett med klynger | Hvem kjenner hvem? |
| **Nærhet** (fra B) | Ringer rundt meg, avstand = nærhet og hvor fersk kontakten er | Hvem står meg nær, og hvem glipper? |
| **Kretser** (fra C) | Radial hierarkisk kantbunting, gruppert på hovedtagg | Hvordan henger miljøene sammen? |

Valg av renderer (React Flow eller et eget SVG/d3-lag for alle tre) tas i
spesifikasjonen for delprosjekt 5.

## Utenfor V2

- Deling med andre og flere brukere (datamodellen er fortsatt scopet på `userId`).
- Egen app i App Store (PWA holder).
