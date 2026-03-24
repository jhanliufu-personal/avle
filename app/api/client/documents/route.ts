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
        include: { documents: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const documents = user.contracts.flatMap((c) => c.documents)

  return NextResponse.json({
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      type: d.type,
      signedDate: d.signedDate?.toISOString() ?? null,
      status: d.status,
    })),
  })
}
