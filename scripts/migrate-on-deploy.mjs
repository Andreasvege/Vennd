// Kjøres av byggesteget. I produksjon på Vercel bringes databasen i takt
// med koden før den nye versjonen går ut; feiler migreringen, feiler
// byggingen, og den forrige versjonen blir stående. Forhåndsvisninger av
// brancher migrerer aldri: en uferdig branch skal ikke endre prod-basen.
import { execSync } from 'node:child_process'

if (process.env.VERCEL_ENV === 'production') {
  // Samme database som appen kobler til (src/lib/prisma.ts bruker
  // DATABASE_URL). prisma.config.ts foretrekker ellers DIRECT_URL, og i
  // Vercel pekte den på en annen database, så tabellene havnet feil sted.
  execSync('prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DIRECT_URL: process.env.DATABASE_URL },
  })
} else {
  console.log('Hopper over migrering (ikke produksjon).')
}
