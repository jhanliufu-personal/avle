import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'investor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const reports = await prisma.investorReport.findMany({
    where: { userId: user.id },
    orderBy: { generatedAt: 'desc' },
  })

  return NextResponse.json({
    reports: reports.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      period: r.period,
      status: r.status,
      generatedAt: r.generatedAt.toISOString(),
    })),
  })
}
