'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import StatCard from '@/components/ui/StatCard'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'

interface PipelineStage {
  id: string
  name: string
  count: number
  color: string
  order: number
}

interface DashboardData {
  stats: {
    activeContracts: number
    monthlyCollections: number
    paymentRate: number
    atRiskContracts: number
  }
  pipelineStages: PipelineStage[]
}

const fallbackStages: PipelineStage[] = [
  { id: '1', name: 'New Applications', count: 12, color: COLORS.blue, order: 1 },
  { id: '2', name: 'Under Review', count: 8, color: COLORS.yellow, order: 2 },
  { id: '3', name: 'Approved — Pending Sign', count: 5, color: COLORS.green, order: 3 },
  { id: '4', name: 'Active Originations', count: 3, color: COLORS.blue, order: 4 },
  { id: '5', name: 'Flagged for Review', count: 2, color: COLORS.red, order: 5 },
]

const riskFeatures = [
  'Payment history analysis (12-month lookback)',
  'Income-to-payment ratio evaluation',
  'Employment stability scoring',
  'Credit utilization patterns',
  'Market conditions adjustment',
  'Behavioral risk indicators',
]

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.stats || {
    activeContracts: 142,
    monthlyCollections: 234000,
    paymentRate: 98.2,
    atRiskContracts: 3,
  }

  const stages = data?.pipelineStages?.length ? data.pipelineStages : fallbackStages

  const riskDistribution = [
    { tier: 'Low Risk', pct: 78, color: COLORS.green },
    { tier: 'Medium Risk', pct: 17, color: COLORS.yellow },
    { tier: 'High Risk', pct: 5, color: COLORS.red },
  ]

  return (
    <div className="min-h-screen">
      <TopBar
        greeting="Operations Dashboard"
        subtitle="Contract origination · risk monitoring · payment reconciliation"
        accentColor={COLORS.admin}
      />
      <div className="p-8 space-y-6">
        {/* Stat row — borderless mosaic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          <StatCard value={stats.activeContracts.toString()} label="Active Contracts" accentColor={COLORS.blue} subtitle="Across all properties" />
          <StatCard value={`$${Math.round(stats.monthlyCollections / 1000)}K`} label="Monthly Collections" accentColor={COLORS.green} subtitle="Total recurring revenue" />
          <StatCard value={`${stats.paymentRate}%`} label="Payment Rate" accentColor={COLORS.admin} subtitle="On-time payment ratio" />
          <StatCard value={stats.atRiskContracts.toString()} label="At-Risk Contracts" accentColor={COLORS.danger} subtitle="Requires attention" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Contract Pipeline">
            <div className="space-y-2">
              {stages.map((stage) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 border border-[#0D0D0D]"
                  style={{ borderLeft: `4px solid ${stage.color}` }}
                >
                  <span
                    className="text-[11px] font-bold uppercase tracking-wide"
                    style={{ color: '#0D0D0D' }}
                  >
                    {stage.name}
                  </span>
                  <Badge label={stage.count.toString()} color={stage.color} />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t-2 border-[#0D0D0D]">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>
                Total in pipeline:{' '}
                <span style={{ color: '#0D0D0D' }}>{stages.reduce((sum, s) => sum + s.count, 0)}</span> contracts
              </p>
            </div>
          </Card>

          <Card title="MAUI Risk Scoring (v0.5)">
            <p className="text-xs mb-5" style={{ color: '#9B9B9B' }}>
              Multi-factor Automated Underwriting Intelligence — proprietary risk assessment for lease equity contracts.
            </p>
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#9B9B9B' }}>
                Risk Distribution
              </p>
              {/* Bauhaus stacked bar — sharp rectangles */}
              <div className="flex h-8 border-2 border-[#0D0D0D] overflow-hidden">
                {riskDistribution.map((tier) => (
                  <div
                    key={tier.tier}
                    className="flex items-center justify-center text-[9px] font-black"
                    style={{
                      width: `${tier.pct}%`,
                      backgroundColor: tier.color,
                      color: tier.color === COLORS.yellow ? '#0D0D0D' : '#F5F0E8',
                    }}
                  >
                    {tier.pct}%
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {riskDistribution.map((tier) => (
                  <div key={tier.tier} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5" style={{ backgroundColor: tier.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                      {tier.tier}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#9B9B9B' }}>
                Scoring Features
              </p>
              <ul className="space-y-1.5">
                {riskFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-xs" style={{ color: '#0D0D0D' }}>
                    <div className="w-2 h-2 flex-shrink-0 mt-0.5" style={{ backgroundColor: COLORS.admin }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
