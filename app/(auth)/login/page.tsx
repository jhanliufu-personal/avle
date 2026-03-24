'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROLE_HOME } from '@/lib/constants'
type UserRole = 'investor' | 'client' | 'admin'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    if (!result?.ok) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }
    const session = await getSession()
    const role = (session?.user as any)?.role as UserRole | undefined
    router.push(role ? ROLE_HOME[role] : '/')
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: '#EAE4D9' }}
    >
      {/* Left panel — Bauhaus color block */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between p-16"
        style={{ backgroundColor: '#0D0D0D' }}
      >
        <div>
          <div
            className="text-[11px] font-black tracking-[0.3em] uppercase"
            style={{ color: '#9B9B9B', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ARCUS VENTURIS
          </div>
          <div className="mt-10">
            <div className="flex gap-4 mb-8">
              <div className="w-16 h-16" style={{ backgroundColor: '#D62828' }} />
              <div className="w-16 h-16" style={{ backgroundColor: '#003F88' }} />
              <div className="w-16 h-16" style={{ backgroundColor: '#F7B731' }} />
            </div>
            <h2
              className="text-5xl font-black uppercase leading-none tracking-tight"
              style={{ color: '#F5F0E8', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              LEASE<br />EQUITY.
            </h2>
          </div>
        </div>
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: '#9B9B9B' }}
        >
          Institutional-grade lease equity platform
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div
              className="w-8 h-8 mb-6"
              style={{ backgroundColor: '#D62828' }}
            />
            <h1
              className="text-2xl font-black uppercase tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#0D0D0D' }}
            >
              Sign In
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: '#9B9B9B' }}>
              Access your portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-[0.15em] mb-1.5"
                style={{ color: '#0D0D0D' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-2 px-3 py-2.5 text-sm outline-none transition-colors"
                style={{
                  borderColor: '#0D0D0D',
                  backgroundColor: '#F5F0E8',
                  color: '#0D0D0D',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-black uppercase tracking-[0.15em] mb-1.5"
                style={{ color: '#0D0D0D' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border-2 px-3 py-2.5 text-sm outline-none"
                style={{
                  borderColor: '#0D0D0D',
                  backgroundColor: '#F5F0E8',
                  color: '#0D0D0D',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p
                className="text-[11px] font-bold uppercase tracking-wide"
                style={{ color: '#D62828' }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-[11px] font-black uppercase tracking-widest transition-opacity hover:opacity-85 disabled:opacity-50"
              style={{
                backgroundColor: '#0D0D0D',
                color: '#F5F0E8',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
