import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'investor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [user, scenarios] = await Promise.all([
    prisma.user.findUnique({
      where: { email: session.user.email },
      include: { investorProfile: true },
    }),
    prisma.returnScenario.findMany(),
  ])

  return NextResponse.json({
    annualizedReturn: user?.investorProfile?.annualizedReturn ?? 0,
    scenarios: scenarios.map((s) => ({ id: s.id, name: s.name, returnPct: s.returnPct })),
  })
}
