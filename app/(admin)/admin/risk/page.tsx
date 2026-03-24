'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

interface RiskContract {
  id: string; tenantName: string; propertyAddress: string
  monthlyTotal: number; riskScore: number | null; riskTier: string | null; status: string
}
interface RiskData {
  contracts: RiskContract[]
  summary: { low: number; medium: number; high: number; total: number }
}

const methodologyFeatures = [
  { title: 'Payment Behavior Analysis', description: 'Tracks on-time payment history, partial payments, and payment pattern consistency over a rolling 12-month window.', color: COLORS.blue },
  { title: 'Income Verification', description: 'Evaluates income-to-payment ratio using verified employment data and bank transaction analysis for stability scoring.', color: COLORS.green },
  { title: 'Market Risk Adjustment', description: 'Incorporates local market conditions including property value trends, neighborhood risk indices, and economic indicators.', color: COLORS.yellow },
  { title: 'Behavioral Indicators', description: 'Analyzes engagement patterns, communication responsiveness, and maintenance request history as soft predictors.', color: COLORS.admin },
  { title: 'Credit Utilization', description: 'Monitors credit utilization trends and debt-to-income trajectory to identify emerging financial stress signals.', color: COLORS.blue },
  { title: 'Composite Scoring', description: 'Weighted ensemble of all factors producing a 0-100 risk score with low/medium/high tier classification.', color: COLORS.admin },
]

function getTierColor(tier: string | null): string {
  if (tier === 'low') return COLORS.green
  if (tier === 'medium') return COLORS.yellow
  if (tier === 'high') return COLORS.danger
  return COLORS.blue
}

export default function AdminRiskPage() {
  const [data, setData] = useState<RiskData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/risk')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load risk data:', err))
      .finally(() => setLoading(false))
  }, [])

  const summary = data?.summary || { low: 0, medium: 0, high: 0, total: 0 }
  const contracts = data?.contracts || []
  const lowPct = summary.total > 0 ? (summary.low / summary.total) * 100 : 0
  const medPct = summary.total > 0 ? (summary.medium / summary.total) * 100 : 0
  const highPct = summary.total > 0 ? (summary.high / summary.total) * 100 : 0

  return (
    <div className="min-h-screen">
      <TopBar greeting="MAUI Risk Scoring" subtitle="Multi-factor Automated Underwriting Intelligence (v0.5)" accentColor={COLORS.admin} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={summary.total.toString()} label="Scored Contracts" accentColor={COLORS.blue} subtitle="Total assessed" />
          <StatCard value={summary.low.toString()} label="Low Risk" accentColor={COLORS.green} subtitle={`${lowPct.toFixed(0)}% of portfolio`} />
          <StatCard value={summary.medium.toString()} label="Medium Risk" accentColor={COLORS.yellow} subtitle={`${medPct.toFixed(0)}% of portfolio`} />
          <StatCard value={summary.high.toString()} label="High Risk" accentColor={COLORS.danger} subtitle={`${highPct.toFixed(0)}% of portfolio`} />
        </div>

        <Card title="Risk Distribution">
          <div className="space-y-4">
            {[
              { label: 'Low Risk (Score 0–39)', count: summary.low, pct: lowPct, color: COLORS.green },
              { label: 'Medium Risk (Score 40–69)', count: summary.medium, pct: medPct, color: COLORS.yellow },
              { label: 'High Risk (Score 70–100)', count: summary.high, pct: highPct, color: COLORS.danger },
            ].map((tier) => (
              <div key={tier.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: tier.color }} />
                    <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{tier.label}</span>
                  </div>
                  <span className="text-[12px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{tier.count} contracts</span>
                </div>
                <div className="h-3 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                  <div className="h-full transition-all" style={{ width: `${tier.pct}%`, backgroundColor: tier.color }} />
                </div>
              </div>
            ))}
            {summary.total > 0 && (
              <div className="mt-4 flex h-6 border-2 border-[#0D0D0D] overflow-hidden">
                {[{ pct: lowPct, color: COLORS.green }, { pct: medPct, color: COLORS.yellow }, { pct: highPct, color: COLORS.danger }].map((t, i) =>
                  t.pct > 0 ? (
                    <div key={i} className="flex items-center justify-center text-[9px] font-black" style={{ width: `${t.pct}%`, backgroundColor: t.color, color: t.color === COLORS.yellow ? '#0D0D0D' : '#F5F0E8' }}>
                      {t.pct.toFixed(0)}%
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </Card>

        <Card title="Risk-Scored Contracts">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#0D0D0D]">
                    {['Tenant', 'Property', 'Monthly', 'Risk Score', 'Tier', 'Status'].map((h, i) => (
                      <th key={h} className={`py-2.5 px-3 text-[9px] font-black uppercase tracking-widest ${i <= 1 ? 'text-left' : i === 2 ? 'text-right' : 'text-center'}`} style={{ color: '#9B9B9B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="border-b border-[#0D0D0D] border-opacity-15 hover:bg-[#EAE4D9] transition-colors">
                      <td className="py-3 px-3 font-bold text-[12px]" style={{ color: '#0D0D0D' }}>{contract.tenantName}</td>
                      <td className="py-3 px-3 text-[11px] max-w-[220px] truncate" style={{ color: '#9B9B9B' }}>{contract.propertyAddress}</td>
                      <td className="py-3 px-3 text-right font-black text-[13px]" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(contract.monthlyTotal)}</td>
                      <td className="py-3 px-3 text-center font-black text-[14px]" style={{ color: getTierColor(contract.riskTier), fontFamily: "'Space Grotesk', sans-serif" }}>
                        {contract.riskScore !== null ? contract.riskScore.toFixed(0) : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {contract.riskTier
                          ? <Badge label={contract.riskTier.toUpperCase()} color={getTierColor(contract.riskTier)} />
                          : <span className="text-[10px]" style={{ color: '#9B9B9B' }}>--</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge label={contract.status.toUpperCase()} color={contract.status === 'active' ? COLORS.green : COLORS.yellow} />
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>No risk-scored contracts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="MAUI Scoring Methodology">
          <p className="text-xs mb-5" style={{ color: '#9B9B9B' }}>
            The MAUI scoring engine combines multiple data signals into a composite risk assessment. Each contract receives a score from 0 (lowest risk) to 100 (highest risk), automatically classified into tiers for operational decision-making.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {methodologyFeatures.map((feature) => (
              <div key={feature.title} className="p-4 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${feature.color}` }}>
                <h4 className="font-black text-[11px] uppercase tracking-wide mb-1.5" style={{ color: '#0D0D0D' }}>{feature.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: '#9B9B9B' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
