// Skriver ut en sesjonscookie for dev-brukeren fra prisma/seed.mts, så du
// kan bruke appen lokalt uten Google-innlogging:
//
//   node --env-file=.env.local scripts/dev-session.mts
//
// Eller for en annen bruker, som demobrukeren fra prisma/seed-demo.mts:
//
//   node --env-file=.env.local scripts/dev-session.mts demo-user "Sigrid Hagen"
//
// Sett verdien som cookien «authjs.session-token» på localhost i
// nettleseren (DevTools → Application → Cookies). Virker bare mot en
// server med samme AUTH_SECRET, og bare for en bruker et seed-skript har laget.

import { encode } from 'next-auth/jwt'

const secret = process.env.AUTH_SECRET
if (!secret) {
  console.error('AUTH_SECRET mangler. Kjør med --env-file=.env.local.')
  process.exit(1)
}

const [userId = 'dev-user', name = 'Andreas Vege'] = process.argv.slice(2)
const email = userId === 'dev-user' ? 'dev@vennekart.local' : `${userId.replace(/-user$/, '')}@vennekart.local`

const token = await encode({
  secret,
  salt: 'authjs.session-token',
  token: { sub: userId, id: userId, name, email },
  maxAge: 60 * 60 * 24 * 30,
})
console.log(token)
