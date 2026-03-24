'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { formatPercent } from '@/lib/utils'
import { COLORS } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface ReturnScenario { id: string; name: string; returnPct: number }
interface ReturnsData { annualizedReturn: number; scenarios: ReturnScenario[] }

const SCENARIO_COLORS: Record<string, string> = {
  Conservative: COLORS.blue,
  'Base Case': COLORS.green,
  Optimistic: COLORS.admin,
}

const SCENARIO_DESCRIPTIONS: Record<string, string> = {
  Conservative: 'Stress-tested with 15% vacancy increase and 5% expense growth. Represents downside protection in adverse market conditions.',
  'Base Case': 'Current trajectory based on existing contract performance, occupancy rates, and historical NOI trends across the portfolio.',
  Optimistic: 'Assumes favorable market conditions with 5% occupancy improvement, 3% lease payment growth, and continued platform expansion.',
}

export default function ReturnsPage() {
  const [data, setData] = useState<ReturnsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/returns')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <TopBar greeting="Return Scenario Modeling" accentColor={COLORS.investor} />
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
        <TopBar greeting="Return Scenario Modeling" accentColor={COLORS.investor} />
        <div className="p-8"><Card title="Error"><p className="text-xs" style={{ color: '#9B9B9B' }}>Failed to load data.</p></Card></div>
      </>
    )
  }

  const chartData = data.scenarios.map((s) => ({ name: s.name, returnPct: s.returnPct, color: SCENARIO_COLORS[s.name] || COLORS.blue }))

  return (
    <>
      <TopBar greeting="Return Scenario Modeling" subtitle="Deterministic return projections across market conditions" accentColor={COLORS.investor} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          {data.scenarios.map((s) => (
            <StatCard key={s.id} value={formatPercent(s.returnPct)} label={`${s.name} Scenario`} accentColor={SCENARIO_COLORS[s.name] || COLORS.blue} />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card title="Return Comparison">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#0D0D0D" strokeOpacity={0.07} vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }} />
                  <YAxis tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 14]} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Return']}
                    contentStyle={{ background: '#0D0D0D', border: 'none', borderRadius: 0, color: '#F5F0E8', fontSize: 11, fontWeight: 700 }}
                  />
                  <Bar dataKey="returnPct" radius={[0, 0, 0, 0]} barSize={60}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Scenario Analysis">
            <div className="space-y-2">
              {data.scenarios.map((scenario) => {
                const color = SCENARIO_COLORS[scenario.name] || COLORS.blue
                return (
                  <div key={scenario.id} className="p-4 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${color}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{scenario.name}</h4>
                      <span className="text-xl font-black" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>{formatPercent(scenario.returnPct)}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: '#9B9B9B' }}>{SCENARIO_DESCRIPTIONS[scenario.name]}</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        <Card title="Methodology">
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#9B9B9B' }}>
            Return scenarios are calculated using deterministic financial models based on actual portfolio performance data. All projections incorporate current contract terms, historical payment performance, property valuations, and market-specific risk factors.
          </p>
          <p className="text-xs leading-relaxed" style={{ color: '#9B9B9B' }}>
            The Base Case scenario reflects current performance trends. Conservative and Optimistic scenarios apply systematic stress factors to key assumptions including vacancy rates, expense growth, rent escalation, and tenant retention.
          </p>
        </Card>
      </div>
    </>
  )
}
