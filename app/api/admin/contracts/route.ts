import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const contracts = await prisma.contract.findMany({
    include: {
      user: true,
      property: { include: { landlord: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json({
    contracts: contracts.map((c) => ({
      id: c.id,
      tenantName: c.user.name,
      tenantEmail: c.user.email,
      propertyAddress: `${c.property.address}, ${c.property.city}, ${c.property.state} ${c.property.zip}`,
      landlordName: c.property.landlord.name,
      contractModel: c.contractModel,
      monthlyTotal: c.monthlyTotal,
      baseRent: c.baseRent,
      equityContribution: c.equityContribution,
      platformFee: c.platformFee,
      propertyReserve: c.propertyReserve,
      status: c.status,
      riskScore: c.riskScore,
      riskTier: c.riskTier,
      startDate: c.startDate.toISOString(),
      preNegotiatedPrice: c.preNegotiatedPrice,
      vestingMonths: c.vestingMonths,
      purchaseOptionMonth: c.purchaseOptionMonth,
      renewalCapPct: c.renewalCapPct,
    })),
  })
}
