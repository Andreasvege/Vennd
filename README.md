# Vennekart

App for å visualisere vennekretsen din og hjelpe deg med å strukturere sosiallivet ditt.

En dagbok over menneskene dine: et relasjonskart, logger som kan gjelde
flere personer, oppfølgingstråder («spør om …»), tagger og påminnelser.
Alt er scoped på `userId`.

## Stack

Next.js 16 (App Router, server actions) · React 19 · TypeScript · Tailwind CSS v4 ·
react-aria-components · @xyflow/react · Prisma 7 + Postgres · Auth.js v5 (Google) ·
zod · Vitest

## Kom i gang

```bash
npm install
cp .env.example .env.local   # fyll inn database- og Google-OAuth-verdier
npx prisma migrate deploy    # kjør migrasjoner mot databasen
npm run dev
```

## Utvikling uten å røre prod

```bash
npx prisma dev -n vennekart --detach   # lokal Postgres (skriver ut tilkoblingen)
# Lag en egen database (ikke bruk template1) og sett DATABASE_URL i .env.local
npx prisma migrate deploy
npx prisma db seed                     # realistiske data for dev-brukeren
node --env-file=.env.local scripts/dev-session.mts
```

Det siste skriptet skriver ut en sesjonscookie for dev-brukeren. Sett den
som `authjs.session-token` på localhost i nettleseren, så er du logget inn
uten Google. Seed-skriptet nekter å kjøre mot noe annet enn localhost.

### Demobruker for skjermbilder

```bash
node --env-file=.env.local prisma/seed-demo.mts
node --env-file=.env.local scripts/dev-session.mts demo-user "Sigrid Hagen"
```

Lager «Sigrid Hagen» med 40 oppdiktede personer: familie over tre
generasjoner, kjæreste, studievenner, jobb, klatring, bokklubb, barndom og
nabolag, med kryssende bånd, et halvt års logger, åpne tråder, planer og
bursdager. Datoene regnes fra i dag, så kartet ser levende ut når du seeder.
Nettverk er ferdig ryddet («Rydd opp»). Bruk cookien fra det andre skriptet.

## Kommandoer

| Kommando | Hva den gjør |
| --- | --- |
| `npm run dev` | Dev-server på http://localhost:3000 |
| `npm run build` | `prisma generate` + produksjonsbygg |
| `npm run lint` | ESLint |
| `npm test` | Vitest (én gjennomkjøring) |
| `npm run test:watch` | Vitest i watch-modus |

## Struktur

```
src/app/           sider (serverkomponenter) og auth-ruten
src/server/        queries/ (lesing) og actions/ (skriving), alltid scopet på innlogget bruker
src/domain/        ren logikk uten database: kadens, plassering, romanse, datoer
src/components/    ui/ (primitiver), graph/ (kartet), person/, modals/
src/i18n/          all synlig tekst
prisma/            schema, migrasjoner og seed
docs/superpowers/  veikart, spesifikasjoner og planer
```
