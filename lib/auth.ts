import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-arcusventuris',
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called, email:', credentials?.email)
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] missing credentials')
          return null
        }

        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          })
        } catch (e) {
          console.log('[AUTH] db error:', e)
          return null
        }

        console.log('[AUTH] user found:', user ? `id=${user.id} role=${user.role}` : 'null')
        if (!user) return null

        const passwordMatch = credentials.password === user.password
        console.log('[AUTH] password match:', passwordMatch)
        if (!passwordMatch) return null

        return { id: user.id, email: user.email, name: user.name, role: user.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    },
  },
}
