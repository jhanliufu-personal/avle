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
      contracts: {
        where: { status: 'active' },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const contract = user.contracts[0] ?? null
  const payments = contract
    ? await prisma.payment.findMany({
        where: { contractId: contract.id },
        orderBy: { date: 'desc' },
      })
    : []

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      date: p.date.toISOString(),
      totalAmount: p.totalAmount,
      baseRent: p.baseRent,
      equityContrib: p.equityContrib,
      platformFee: p.platformFee,
      propertyReserve: p.propertyReserve,
      status: p.status,
    })),
    contract: contract
      ? {
          monthlyTotal: contract.monthlyTotal,
          baseRent: contract.baseRent,
          equityContribution: contract.equityContribution,
          platformFee: contract.platformFee,
          propertyReserve: contract.propertyReserve,
        }
      : null,
    bankName: contract?.bankName ?? 'N/A',
    bankLast4: contract?.bankLast4 ?? '0000',
    autopayEnabled: contract?.autopayEnabled ?? false,
    nextPaymentDate: contract?.nextPaymentDate?.toISOString() ?? null,
  })
}
