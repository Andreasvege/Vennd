import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // JWT i stedet for database-sesjoner. Med database-strategi gjorde hvert
  // auth()-kall et oppslag i Session-tabellen, og databasen ligger ~110 ms
  // unna — det er én rundtur på hver eneste API-forespørsel. Adapteren
  // brukes fortsatt til å lagre bruker og konto ved innlogging.
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // user er kun satt ved innlogging; deretter bæres id-en i tokenet.
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
