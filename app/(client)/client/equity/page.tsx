'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { COLORS } from '@/lib/constants'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface EquityData {
  equityAccount: {
    totalBalance: number; directContributions: number; marketReturns: number
    platformMatch: number; targetMarketReturn: number; monthsActive: number; projectedFiveYear: number
  } | null
  snapshots: Array<{ id: string; month: string; cumulativeTotal: number; contributions: number; returns: number }>
  contract: { equityContribution: number; preNegotiatedPrice: number; vestingMonths: number; purchaseOptionMonth: number } | null
}

export default function EquityPage() {
  const [data, setData] = useState<EquityData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/equity')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <TopBar greeting="Equity Balance" subtitle="Loading…" accentColor={COLORS.client} />
        <div className="p-8">
          <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse" style={{ backgroundColor: '#EAE4D9' }} />)}
          </div>
          <div className="h-80 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />
        </div>
      </div>
    )
  }

  if (!data || !data.equityAccount) {
    return (
      <div>
        <TopBar greeting="Equity Balance" accentColor={COLORS.client} />
        <div className="p-8">
          <Card title="No Data"><p className="text-xs" style={{ color: '#9B9B9B' }}>Equity data unavailable.</p></Card>
        </div>
      </div>
    )
  }

  const { equityAccount, snapshots, contract } = data
  const chartData = snapshots.map((s) => ({
    month: new Date(s.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    total: s.cumulativeTotal,
    contributions: s.contributions,
    returns: s.returns,
  }))

  const totalBalance = equityAccount.totalBalance
  const prePurchasePrice = contract?.preNegotiatedPrice ?? 285000
  const equityPercent = (totalBalance / prePurchasePrice) * 100

  const compositionItems = [
    { label: 'Direct Contributions', amount: equityAccount.directContributions, pct: (equityAccount.directContributions / totalBalance) * 100, color: COLORS.client },
    { label: 'Market Returns', amount: equityAccount.marketReturns, pct: (equityAccount.marketReturns / totalBalance) * 100, color: COLORS.green },
    { label: 'Platform Match', amount: equityAccount.platformMatch, pct: (equityAccount.platformMatch / totalBalance) * 100, color: COLORS.blue },
  ]

  return (
    <div>
      <TopBar greeting="Equity Balance" subtitle="Track your lease equity journey" accentColor={COLORS.client} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={formatCurrency(totalBalance)} label="Total Equity" accentColor={COLORS.green} subtitle={`${formatPercent(equityPercent)} of purchase price`} />
          <StatCard value={formatCurrency(equityAccount.projectedFiveYear)} label="5-Year Projection" accentColor={COLORS.client} subtitle="At current growth rate" />
          <StatCard value={formatPercent(equityAccount.targetMarketReturn)} label="Target Return" accentColor={COLORS.blue} subtitle="Annual market return" />
          <StatCard value={`${equityAccount.monthsActive} mo`} label="Vesting Progress" accentColor={COLORS.yellow} subtitle={`${contract?.vestingMonths ?? 24} months to vest`} />
        </div>

        <Card title="Equity Growth Over Time">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.client} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={COLORS.client} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#0D0D0D" strokeOpacity={0.07} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9B9B9B', fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: '#9B9B9B', fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#0D0D0D', border: 'none', borderRadius: 0, color: '#F5F0E8', fontSize: 11, fontWeight: 700 }}
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, name === 'total' ? 'Total Equity' : 'Contributions']}
                />
                <Area type="monotone" dataKey="contributions" stroke={COLORS.green} strokeWidth={2} fill="url(#gradContrib)" dot={false} />
                <Area type="monotone" dataKey="total" stroke={COLORS.client} strokeWidth={2.5} fill="url(#gradTotal)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-3 border-t-2 border-[#0D0D0D]">
            {[{ color: COLORS.client, label: 'Total Equity' }, { color: COLORS.green, label: 'Direct Contributions' }].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className="w-3 h-3" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          <Card title="Equity Composition">
            <div className="space-y-4">
              {compositionItems.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{item.label}</span>
                    <div className="text-right">
                      <span className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(item.amount)}</span>
                      <span className="text-[10px] ml-2" style={{ color: '#9B9B9B' }}>({formatPercent(item.pct)})</span>
                    </div>
                  </div>
                  <div className="h-2.5 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                    <div className="h-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-[#0D0D0D] flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Total Balance</span>
              <span className="text-xl font-black" style={{ color: COLORS.green, fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(totalBalance)}</span>
            </div>
          </Card>

          <Card title="Equity Conversion Options">
            <p className="text-xs mb-5" style={{ color: '#9B9B9B' }}>
              As your equity grows through the lease equity programme, you may qualify to access your accumulated value or exercise your purchase option before the contract end date.
            </p>
            <div className="space-y-2">
              {[
                { label: 'Minimum equity balance', value: '$10,000', met: totalBalance >= 10000 },
                { label: 'Minimum months active', value: '24 months', met: equityAccount.monthsActive >= 24 },
                { label: 'On-time payment history', value: '100%', met: true },
              ].map((req) => (
                <div key={req.label} className="flex items-center justify-between p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${req.met ? COLORS.green : COLORS.yellow}` }}>
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{req.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black" style={{ color: '#9B9B9B' }}>{req.value}</span>
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: req.met ? COLORS.green : COLORS.yellow }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full py-3 text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-80" style={{ backgroundColor: COLORS.blue, color: '#F5F0E8' }}>
              Learn More About Conversion Options
            </button>
          </Card>
        </div>
      </div>
    </div>
  )
}
