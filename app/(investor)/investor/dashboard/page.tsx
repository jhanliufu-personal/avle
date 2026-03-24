'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import { formatCurrency, formatPercent, formatShortDate } from '@/lib/utils'
import { COLORS } from '@/lib/constants'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface PortfolioTier { id: string; name: string; percentage: number; color: string }
interface ReturnScenario { id: string; name: string; returnPct: number }
interface NOIProjection { month: string; projected: number; lower: number; upper: number }

interface DashboardData {
  name: string
  firmName: string
  totalPortfolio: number
  activeContracts: number
  annualizedReturn: number
  monthlyNOI: number
  portfolioTiers: PortfolioTier[]
  returnScenarios: ReturnScenario[]
  noiProjections: NOIProjection[]
}

const SCENARIO_COLORS: Record<string, string> = {
  Conservative: COLORS.blue,
  'Base Case': COLORS.green,
  Optimistic: COLORS.admin,
}

export default function InvestorDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/dashboard')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <TopBar greeting="Portfolio Dashboard" accentColor={COLORS.investor} />
        <div className="p-8 flex items-center justify-center h-64 gap-3">
          <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading…</span>
        </div>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <TopBar greeting="Portfolio Dashboard" accentColor={COLORS.investor} />
        <div className="p-8">
          <Card title="Error"><p className="text-sm" style={{ color: '#9B9B9B' }}>Failed to load data.</p></Card>
        </div>
      </>
    )
  }

  const chartData = data.noiProjections.map((p) => ({
    month: formatShortDate(p.month),
    projected: p.projected,
    lower: p.lower,
    upper: p.upper,
  }))

  return (
    <>
      <TopBar greeting="Portfolio Dashboard" subtitle={data.firmName} accentColor={COLORS.investor} />
      <div className="p-8 space-y-6">

        {/* Stat mosaic */}
        <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={formatCurrency(data.totalPortfolio)} label="Total Portfolio Value" accentColor={COLORS.investor} />
          <StatCard value={String(data.activeContracts)} label="Active Contracts" accentColor={COLORS.blue} />
          <StatCard value={formatPercent(data.annualizedReturn)} label="Annualized Return" accentColor={COLORS.green} />
          <StatCard value={formatCurrency(data.monthlyNOI)} label="Monthly NOI" accentColor={COLORS.admin} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* NOI Chart */}
          <div className="col-span-2">
            <Card title="NOI Projections — 12-Month Forward">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="noiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.investor} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={COLORS.investor} stopOpacity={0.03} />
                      </linearGradient>
                      <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.investor} stopOpacity={0.1} />
                        <stop offset="100%" stopColor={COLORS.investor} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="0" stroke="#0D0D0D" strokeOpacity={0.08} vertical={false} />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
                    />
                    <YAxis
                      tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                      contentStyle={{
                        background: '#0D0D0D',
                        border: 'none',
                        borderRadius: 0,
                        color: '#F5F0E8',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#bandGrad)" fillOpacity={1} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#F5F0E8" fillOpacity={1} />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke={COLORS.investor}
                      strokeWidth={2.5}
                      fill="url(#noiGrad)"
                      fillOpacity={1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="col-span-1 space-y-6">
            <Card title="Portfolio Composition">
              <div className="space-y-4">
                {data.portfolioTiers.map((tier) => (
                  <div key={tier.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{tier.name}</span>
                      <span className="text-[12px] font-black" style={{ color: tier.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {tier.percentage}%
                      </span>
                    </div>
                    {/* Sharp Bauhaus progress bar */}
                    <div className="h-2.5 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                      <div className="h-full transition-all" style={{ width: `${tier.percentage}%`, backgroundColor: tier.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Return Scenarios">
              <div className="space-y-0">
                {data.returnScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between py-3 border-b border-[#0D0D0D] border-opacity-15 last:border-0"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                      {scenario.name}
                    </span>
                    <span
                      className="text-xl font-black"
                      style={{ color: SCENARIO_COLORS[scenario.name] || COLORS.blue, fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {formatPercent(scenario.returnPct)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
