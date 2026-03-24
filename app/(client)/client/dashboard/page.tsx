'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { formatCurrency, formatCurrencyDecimal, formatDate } from '@/lib/utils'

interface DashboardData {
  user: { name: string; email: string }
  equityAccount: {
    totalBalance: number
    directContributions: number
    marketReturns: number
    platformMatch: number
    monthsActive: number
    projectedFiveYear: number
  } | null
  contract: {
    monthlyTotal: number
    equityContribution: number
    startDate: string
    status: string
    property: { address: string; city: string; state: string; unit: string | null }
  } | null
  payments: Array<{ id: string; date: string; totalAmount: number; status: string }>
  nextPaymentDate: string | null
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/dashboard')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <TopBar greeting="Loading…" accentColor={COLORS.client} />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse" style={{ backgroundColor: '#EAE4D9' }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.contract) {
    return (
      <div>
        <TopBar greeting="Welcome" accentColor={COLORS.client} />
        <div className="p-8">
          <Card title="No Data">
            <p className="text-sm" style={{ color: '#9B9B9B' }}>No tenant data found. Please contact support.</p>
          </Card>
        </div>
      </div>
    )
  }

  const { equityAccount, contract, payments, nextPaymentDate, user } = data
  const equityBalance = equityAccount?.totalBalance ?? 0
  const monthlyEquity = contract.equityContribution
  const monthsActive = equityAccount?.monthsActive ?? 0

  const nextPayDate = nextPaymentDate
    ? new Date(nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'N/A'

  return (
    <div>
      <TopBar
        greeting={`Welcome, ${user.name}`}
        subtitle={`Next payment: ${nextPayDate} · Equity balance: ${formatCurrency(equityBalance)}`}
        accentColor={COLORS.client}
      />

      <div className="p-8 space-y-6">
        {/* Stat mosaic */}
        <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={formatCurrency(contract.monthlyTotal)} label="Monthly Payment" accentColor={COLORS.client} subtitle="Due on the 15th" />
          <StatCard value={formatCurrency(equityBalance)} label="Equity Balance" accentColor={COLORS.green} subtitle="Vested & growing" />
          <StatCard value={formatCurrency(monthlyEquity)} label="Monthly Equity" accentColor={COLORS.blue} subtitle="Per payment contribution" />
          <StatCard value={String(monthsActive)} label="Months Active" accentColor={COLORS.admin} subtitle={`Since ${formatDate(contract.startDate)}`} />
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Payment history */}
          <div className="col-span-3">
            <Card title="Payment History">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-[#0D0D0D]">
                      {['Date', 'Amount', 'Status'].map((h) => (
                        <th key={h} className="py-2.5 px-3 text-[9px] font-black uppercase tracking-widest text-left" style={{ color: '#9B9B9B' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-[#0D0D0D] border-opacity-15 hover:bg-[#EAE4D9] transition-colors">
                        <td className="py-3 px-3 text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{formatDate(payment.date)}</td>
                        <td className="py-3 px-3 text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {formatCurrencyDecimal(payment.totalAmount)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            label={payment.status === 'paid' ? 'Paid' : 'Pending'}
                            color={payment.status === 'paid' ? COLORS.green : COLORS.yellow}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-2 space-y-6">
            <Card title="Equity Breakdown">
              <div className="space-y-0">
                {[
                  { label: 'Direct Contributions', value: equityAccount?.directContributions ?? 0, color: COLORS.client },
                  { label: 'Market Returns', value: equityAccount?.marketReturns ?? 0, color: COLORS.blue },
                  { label: 'Platform Match', value: equityAccount?.platformMatch ?? 0, color: COLORS.green },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 border-b border-[#0D0D0D] border-opacity-15 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: row.color }} />
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>{row.label}</span>
                    </div>
                    <span className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>
                      {formatCurrency(row.value)}
                    </span>
                  </div>
                ))}
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>5-Year Projection</span>
                  <span className="text-xl font-black" style={{ color: COLORS.client, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {formatCurrency(equityAccount?.projectedFiveYear ?? 0)}
                  </span>
                </div>
              </div>
            </Card>

            <Card title="Property">
              <div className="space-y-0">
                {[
                  { label: 'Address', value: `${contract.property.address}${contract.property.unit ? `, ${contract.property.unit}` : ''}` },
                  { label: 'City', value: `${contract.property.city}, ${contract.property.state}` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start py-3 border-b border-[#0D0D0D] border-opacity-15 last:border-0">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{row.label}</span>
                    <span className="text-[12px] font-bold text-right max-w-[60%]" style={{ color: '#0D0D0D' }}>{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Status</span>
                  <Badge label="Active" color={COLORS.green} />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
