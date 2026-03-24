import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const landlords = await prisma.landlord.findMany({
    include: {
      properties: { include: { contracts: { where: { status: 'active' } } } },
    },
  })

  return NextResponse.json({
    landlords: landlords.map((l) => {
      const activeContracts = l.properties.reduce((sum, p) => sum + p.contracts.length, 0)
      const totalUnits = l.properties.reduce((sum, p) => sum + p.totalUnits, 0)
      const occupancyRate =
        totalUnits > 0 ? Math.round((activeContracts / totalUnits) * 100) : 0

      return {
        id: l.id,
        name: l.name,
        email: l.email,
        propertyCount: l.properties.length,
        totalUnits,
        occupancyRate,
        activeContracts,
        properties: l.properties.map((p) => ({
          id: p.id,
          address: p.address,
          city: p.city,
          state: p.state,
        })),
      }
    }),
  })
}
