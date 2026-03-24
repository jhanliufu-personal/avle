'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

interface ContractSummary {
  id: string
  tenantName: string
  propertyAddress: string
  monthlyTotal: number
  status: string
  riskTier: string | null
  contractModel: string
  vestingMonths: number
  purchaseOptionMonth: number
  renewalCapPct: number
}

export default function AdminPortfolioPage() {
  const [contracts, setContracts] = useState<ContractSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/contracts')
      .then((res) => res.json())
      .then((json) => setContracts(json.contracts || []))
      .catch((err) => console.error('Failed to load portfolio data:', err))
      .finally(() => setLoading(false))
  }, [])

  const totalContracts = contracts.length
  const activeContracts = contracts.filter((c) => c.status === 'active').length
  const totalRevenue = contracts.reduce((sum, c) => sum + c.monthlyTotal, 0)
  const avgMonthly = totalContracts > 0 ? totalRevenue / totalContracts : 0
  const avg = (key: keyof ContractSummary) =>
    totalContracts > 0 ? contracts.reduce((sum, c) => sum + (c[key] as number), 0) / totalContracts : 0
  const uniqueModels = Array.from(new Set(contracts.map((c) => c.contractModel))).join(', ') || '—'

  const portfolioMetrics = [
    { label: 'Avg. Contract Term', value: totalContracts ? `${Math.round(avg('purchaseOptionMonth'))} mo` : '—', color: COLORS.admin },
    { label: 'Avg. Vesting Period', value: totalContracts ? `${Math.round(avg('vestingMonths'))} mo` : '—', color: COLORS.blue },
    { label: 'Avg. Renewal Cap', value: totalContracts ? `${avg('renewalCapPct').toFixed(1)}%` : '—', color: COLORS.green },
    { label: 'Contract Model(s)', value: uniqueModels, color: COLORS.black },
  ]

  const tierBreakdown = [
    { label: 'Low Risk', count: contracts.filter((c) => c.riskTier === 'low').length, color: COLORS.green },
    { label: 'Medium Risk', count: contracts.filter((c) => c.riskTier === 'medium').length, color: COLORS.yellow },
    { label: 'High Risk', count: contracts.filter((c) => c.riskTier === 'high').length, color: COLORS.red },
    { label: 'Unscored', count: contracts.filter((c) => !c.riskTier).length, color: COLORS.gray },
  ]

  return (
    <div className="min-h-screen">
      <TopBar greeting="Portfolio Monitoring" subtitle="Aggregate portfolio health and contract performance" accentColor={COLORS.admin} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={totalContracts.toString()} label="Total Contracts" accentColor={COLORS.blue} subtitle="All contract statuses" />
          <StatCard value={activeContracts.toString()} label="Active Contracts" accentColor={COLORS.green} subtitle="Currently performing" />
          <StatCard value={formatCurrency(totalRevenue)} label="Monthly Revenue" accentColor={COLORS.admin} subtitle="Gross monthly collections" />
          <StatCard value={formatCurrency(avgMonthly)} label="Avg. Contract Value" accentColor={COLORS.investor} subtitle="Per-contract monthly" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Portfolio Risk Composition">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3">
                <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading…</span>
              </div>
            ) : (
              <div className="space-y-4">
                {tierBreakdown.map((tier) => {
                  const pct = totalContracts > 0 ? (tier.count / totalContracts) * 100 : 0
                  return (
                    <div key={tier.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5" style={{ backgroundColor: tier.color }} />
                          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{tier.label}</span>
                        </div>
                        <span className="text-[11px] font-black" style={{ color: '#0D0D0D' }}>{tier.count} <span style={{ color: '#9B9B9B' }}>({pct.toFixed(0)}%)</span></span>
                      </div>
                      <div className="h-3 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                        <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: tier.color }} />
                      </div>
                    </div>
                  )
                })}
                {totalContracts > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-[#0D0D0D]">
                    <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: '#9B9B9B' }}>Composition</p>
                    <div className="flex h-6 border-2 border-[#0D0D0D] overflow-hidden">
                      {tierBreakdown.map((tier) => {
                        const pct = (tier.count / totalContracts) * 100
                        if (pct === 0) return null
                        return (
                          <div key={tier.label} className="flex items-center justify-center text-[9px] font-black" style={{ width: `${pct}%`, backgroundColor: tier.color, color: tier.color === COLORS.yellow ? '#0D0D0D' : '#F5F0E8' }}>
                            {pct >= 10 ? `${pct.toFixed(0)}%` : ''}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card title="Portfolio Parameters">
            <div className="space-y-2">
              {portfolioMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${metric.color}` }}>
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{metric.label}</span>
                  <span className="text-lg font-black" style={{ color: metric.color, fontFamily: "'Space Grotesk', sans-serif" }}>{metric.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
