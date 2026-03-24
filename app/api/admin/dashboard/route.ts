import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [activeContracts, payments, pipelineStages] = await Promise.all([
    prisma.contract.count({ where: { status: 'active' } }),
    prisma.payment.findMany({ where: { status: 'paid' } }),
    prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } }),
  ])

  const monthlyCollections = payments
    .filter((p) => {
      const now = new Date()
      return p.date.getMonth() === now.getMonth() - 1 && p.date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + p.totalAmount, 0)

  const totalPayments = payments.length
  const allPayments = await prisma.payment.count()
  const paymentRate = allPayments > 0 ? Math.round((totalPayments / allPayments) * 1000) / 10 : 0

  const atRiskContracts = await prisma.contract.count({ where: { riskTier: 'high' } })

  return NextResponse.json({
    stats: {
      activeContracts,
      monthlyCollections,
      paymentRate,
      atRiskContracts,
    },
    pipelineStages: pipelineStages.map((s) => ({
      id: s.id,
      name: s.name,
      count: s.count,
      color: s.color,
      order: s.order,
    })),
  })
}
