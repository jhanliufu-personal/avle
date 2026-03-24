'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { COLORS } from '@/lib/constants'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface PortfolioTier { id: string; name: string; percentage: number; color: string }
interface DashboardData { totalPortfolio: number; activeContracts: number; annualizedReturn: number; monthlyNOI: number; portfolioTiers: PortfolioTier[] }

export default function PortfolioPage() {
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
        <TopBar greeting="Portfolio Analysis" accentColor={COLORS.investor} />
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
        <TopBar greeting="Portfolio Analysis" accentColor={COLORS.investor} />
        <div className="p-8"><Card title="Error"><p className="text-xs" style={{ color: '#9B9B9B' }}>Failed to load data.</p></Card></div>
      </>
    )
  }

  const pieData = data.portfolioTiers.map((t) => ({ name: t.name, value: t.percentage, color: t.color }))

  return (
    <>
      <TopBar greeting="Portfolio Analysis" subtitle="Allocation breakdown and tier composition" accentColor={COLORS.investor} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={formatCurrency(data.totalPortfolio)} label="Total Portfolio Value" accentColor={COLORS.investor} />
          <StatCard value={String(data.activeContracts)} label="Active Contracts" accentColor={COLORS.blue} />
          <StatCard value={formatPercent(data.annualizedReturn)} label="Annualized Return" accentColor={COLORS.green} />
          <StatCard value={formatCurrency(data.monthlyNOI)} label="Monthly NOI" accentColor={COLORS.admin} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card title="Portfolio Composition">
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, 'Allocation']}
                    contentStyle={{ background: '#0D0D0D', border: 'none', borderRadius: 0, color: '#F5F0E8', fontSize: 11, fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-5 mt-2 pt-3 border-t-2 border-[#0D0D0D]">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tier Breakdown">
            <div className="space-y-3">
              {data.portfolioTiers.map((tier) => {
                const tierValue = (data.totalPortfolio * tier.percentage) / 100
                const tierContracts = Math.round((data.activeContracts * tier.percentage) / 100)
                return (
                  <div key={tier.id} className="p-4 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${tier.color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5" style={{ backgroundColor: tier.color }} />
                        <h4 className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{tier.name}</h4>
                      </div>
                      <span className="text-xl font-black" style={{ color: tier.color, fontFamily: "'Space Grotesk', sans-serif" }}>{tier.percentage}%</span>
                    </div>
                    <div className="h-2 border border-[#0D0D0D] mb-3" style={{ backgroundColor: '#EAE4D9' }}>
                      <div className="h-full" style={{ width: `${tier.percentage}%`, backgroundColor: tier.color }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Allocated Value</p>
                        <p className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(tierValue)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Contracts</p>
                        <p className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{tierContracts}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}
