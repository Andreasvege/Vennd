// Skriver ut en sesjonscookie for dev-brukeren fra prisma/seed.mts, så du
// kan bruke appen lokalt uten Google-innlogging:
//
//   node --env-file=.env.local scripts/dev-session.mts
//
// Sett verdien som cookien «authjs.session-token» på localhost i
// nettleseren (DevTools → Application → Cookies). Virker bare mot en
// server med samme AUTH_SECRET, og bare for brukeren seed-skriptet lager.

import { encode } from 'next-auth/jwt'

const secret = process.env.AUTH_SECRET
if (!secret) {
  console.error('AUTH_SECRET mangler. Kjør med --env-file=.env.local.')
  process.exit(1)
}

const token = await encode({
  secret,
  salt: 'authjs.session-token',
  token: { sub: 'dev-user', id: 'dev-user', name: 'Andreas Vege', email: 'dev@vennd.local' },
  maxAge: 60 * 60 * 24 * 30,
})
console.log(token)
