import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const contracts = await prisma.contract.findMany({
    where: { riskScore: { not: null } },
    include: { user: true, property: true },
    orderBy: { riskScore: 'asc' },
  })

  const low = contracts.filter((c) => c.riskTier === 'low').length
  const medium = contracts.filter((c) => c.riskTier === 'medium').length
  const high = contracts.filter((c) => c.riskTier === 'high').length

  return NextResponse.json({
    contracts: contracts.map((c) => ({
      id: c.id,
      tenantName: c.user.name,
      propertyAddress: `${c.property.address}, ${c.property.city}, ${c.property.state}`,
      monthlyTotal: c.monthlyTotal,
      riskScore: c.riskScore,
      riskTier: c.riskTier,
      status: c.status,
    })),
    summary: { low, medium, high, total: contracts.length },
  })
}
