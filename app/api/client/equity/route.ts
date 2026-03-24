import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'client') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      equityAccount: { include: { snapshots: { orderBy: { month: 'asc' } } } },
      contracts: {
        where: { status: 'active' },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const contract = user.contracts[0] ?? null

  return NextResponse.json({
    equityAccount: user.equityAccount
      ? {
          totalBalance: user.equityAccount.totalBalance,
          directContributions: user.equityAccount.directContributions,
          marketReturns: user.equityAccount.marketReturns,
          platformMatch: user.equityAccount.platformMatch,
          targetMarketReturn: user.equityAccount.targetMarketReturn,
          monthsActive: user.equityAccount.monthsActive,
          projectedFiveYear: user.equityAccount.projectedFiveYear,
        }
      : null,
    snapshots: (user.equityAccount?.snapshots ?? []).map((s) => ({
      id: s.id,
      month: s.month.toISOString(),
      cumulativeTotal: s.cumulativeTotal,
      contributions: s.contributions,
      returns: s.returns,
    })),
    contract: contract
      ? {
          equityContribution: contract.equityContribution,
          preNegotiatedPrice: contract.preNegotiatedPrice,
          vestingMonths: contract.vestingMonths,
          purchaseOptionMonth: contract.purchaseOptionMonth,
        }
      : null,
  })
}
