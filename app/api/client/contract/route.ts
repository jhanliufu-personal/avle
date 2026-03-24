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
        include: {
          property: { include: { landlord: true } },
          documents: { orderBy: { createdAt: 'asc' } },
        },
        take: 1,
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const contract = user.contracts[0] ?? null

  return NextResponse.json({
    contract: contract
      ? {
          id: contract.id,
          contractModel: contract.contractModel,
          startDate: contract.startDate.toISOString(),
          preNegotiatedPrice: contract.preNegotiatedPrice,
          monthlyTotal: contract.monthlyTotal,
          baseRent: contract.baseRent,
          equityContribution: contract.equityContribution,
          platformFee: contract.platformFee,
          propertyReserve: contract.propertyReserve,
          vestingMonths: contract.vestingMonths,
          purchaseOptionMonth: contract.purchaseOptionMonth,
          renewalCapPct: contract.renewalCapPct,
          status: contract.status,
          riskScore: contract.riskScore,
          riskTier: contract.riskTier,
          property: {
            address: contract.property.address,
            city: contract.property.city,
            state: contract.property.state,
            zip: contract.property.zip,
            unit: contract.property.unit,
            type: contract.property.type,
            tier: contract.property.tier,
            marketValue: contract.property.marketValue,
          },
          landlord: { name: contract.property.landlord.name },
        }
      : null,
    documents: (contract?.documents ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      signedDate: d.signedDate?.toISOString() ?? null,
      status: d.status,
    })),
    equityBalance: user.equityAccount?.totalBalance ?? 0,
  })
}
