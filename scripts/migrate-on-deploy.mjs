// Kjøres av byggesteget. I produksjon på Vercel bringes databasen i takt
// med koden før den nye versjonen går ut; feiler migreringen, feiler
// byggingen, og den forrige versjonen blir stående. Forhåndsvisninger av
// brancher migrerer aldri: en uferdig branch skal ikke endre prod-basen.
import { execSync } from 'node:child_process'

if (process.env.VERCEL_ENV === 'production') {
  execSync('prisma migrate deploy', { stdio: 'inherit' })
} else {
  console.log('Hopper over migrering (ikke produksjon).')
}
