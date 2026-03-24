import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const payments = await prisma.payment.findMany({
    include: { contract: { include: { user: true } } },
    orderBy: { date: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      tenantName: p.contract.user.name,
      date: p.date.toISOString(),
      totalAmount: p.totalAmount,
      baseRent: p.baseRent,
      equityContrib: p.equityContrib,
      platformFee: p.platformFee,
      propertyReserve: p.propertyReserve,
      status: p.status,
    })),
  })
}
