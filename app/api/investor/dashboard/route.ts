import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'investor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [user, tiers, scenarios, projections] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: { investorProfile: true },
    }),
    prisma.portfolioTier.findMany(),
    prisma.returnScenario.findMany(),
    prisma.nOIProjection.findMany({ orderBy: { month: 'asc' }, take: 12 }),
  ])

  if (!user?.investorProfile) return NextResponse.json({ error: 'Investor profile not found' }, { status: 404 })

  const profile = user.investorProfile
  const activeContracts = await prisma.contract.count({ where: { status: 'active' } })

  return NextResponse.json({
    name: user.name,
    firmName: profile.firmName,
    totalPortfolio: profile.totalPortfolio,
    activeContracts,
    annualizedReturn: profile.annualizedReturn,
    monthlyNOI: profile.monthlyNOI,
    portfolioTiers: tiers.map((t) => ({ id: t.id, name: t.name, percentage: t.percentage, color: t.color })),
    returnScenarios: scenarios.map((s) => ({ id: s.id, name: s.name, returnPct: s.returnPct })),
    noiProjections: projections.map((p) => ({
      id: p.id,
      month: p.month.toISOString(),
      projected: p.projected,
      lower: p.lower,
      upper: p.upper,
    })),
  })
}
