import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as string | undefined

    if (pathname.startsWith('/client') && role !== 'client') {
      return NextResponse.redirect(new URL(`/${role === 'admin' ? 'admin' : 'investor'}/dashboard`, req.url))
    }
    if (pathname.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL(`/${role === 'client' ? 'client' : 'investor'}/dashboard`, req.url))
    }
    if (pathname.startsWith('/investor') && role !== 'investor') {
      return NextResponse.redirect(new URL(`/${role === 'client' ? 'client' : 'admin'}/dashboard`, req.url))
    }
    return NextResponse.next()
  },
  {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-arcusventuris',
    callbacks: { authorized: ({ token }) => !!token },
  }
)

export const config = {
  matcher: ['/client/:path*', '/admin/:path*', '/investor/:path*'],
}
