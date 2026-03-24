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
      equityAccount: true,
      contracts: {
        where: { status: 'active' },
        include: { property: true },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const contract = user.contracts[0] ?? null
  const recentPayments = contract
    ? await prisma.payment.findMany({
        where: { contractId: contract.id },
        orderBy: { date: 'desc' },
        take: 6,
      })
    : []

  return NextResponse.json({
    user: { name: user.name, email: user.email },
    equityAccount: user.equityAccount
      ? {
          totalBalance: user.equityAccount.totalBalance,
          directContributions: user.equityAccount.directContributions,
          marketReturns: user.equityAccount.marketReturns,
          platformMatch: user.equityAccount.platformMatch,
          monthsActive: user.equityAccount.monthsActive,
          projectedFiveYear: user.equityAccount.projectedFiveYear,
        }
      : null,
    contract: contract
      ? {
          monthlyTotal: contract.monthlyTotal,
          equityContribution: contract.equityContribution,
          startDate: contract.startDate.toISOString(),
          status: contract.status,
          property: {
            address: contract.property.address,
            city: contract.property.city,
            state: contract.property.state,
            unit: contract.property.unit,
          },
        }
      : null,
    payments: recentPayments.map((p) => ({
      id: p.id,
      date: p.date.toISOString(),
      totalAmount: p.totalAmount,
      status: p.status,
    })),
    nextPaymentDate: contract?.nextPaymentDate?.toISOString() ?? null,
  })
}
