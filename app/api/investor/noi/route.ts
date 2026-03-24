import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'investor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const projections = await prisma.nOIProjection.findMany({ orderBy: { month: 'asc' } })

  return NextResponse.json({
    projections: projections.map((p) => ({
      id: p.id,
      month: p.month.toISOString(),
      projected: p.projected,
      lower: p.lower,
      upper: p.upper,
    })),
  })
}
