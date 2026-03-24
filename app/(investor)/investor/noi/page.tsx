'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import { COLORS } from '@/lib/constants'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface NOIProjection {
  id: string
  month: string
  projected: number
  lower: number
  upper: number
}

export default function NOIPage() {
  const [projections, setProjections] = useState<NOIProjection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/noi')
      .then((res) => res.json())
      .then((d) => { setProjections(d.projections || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <TopBar greeting="NOI Projections" accentColor={COLORS.investor} />
        <div className="p-8 flex items-center justify-center h-64 gap-3">
          <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading…</span>
        </div>
      </>
    )
  }

  const chartData = projections.map((p) => ({
    month: formatShortDate(p.month),
    projected: p.projected,
    lower: p.lower,
    upper: p.upper,
  }))

  const totalProjectedAnnual = projections.slice(0, 12).reduce((sum, p) => sum + p.projected, 0)
  const avgMonthlyNOI = projections.length > 0
    ? projections.reduce((sum, p) => sum + p.projected, 0) / projections.length
    : 0
  const growthRate = projections.length >= 2
    ? ((projections[projections.length - 1].projected - projections[0].projected) / projections[0].projected) * 100
    : 0

  return (
    <>
      <TopBar greeting="NOI Projections" subtitle="24-month forward-looking net operating income model" accentColor={COLORS.investor} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          {[
            { label: '12-Month Projected NOI', value: formatCurrency(totalProjectedAnnual), color: COLORS.investor },
            { label: 'Average Monthly NOI', value: formatCurrency(Math.round(avgMonthlyNOI)), color: COLORS.blue },
            { label: 'Projected Growth (24-Mo)', value: `+${growthRate.toFixed(1)}%`, color: COLORS.green },
          ].map((item) => (
            <div key={item.label} className="p-4" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{item.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <Card title="NOI Projection Model — 24-Month Forward">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="noiGradFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.investor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.investor} stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="bandGradFull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.investor} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={COLORS.investor} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#0D0D0D" strokeOpacity={0.07} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#0D0D0D', strokeWidth: 1 }}
                  interval={2}
                />
                <YAxis
                  tick={{ fill: '#9B9B9B', fontSize: 10, fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const labels: Record<string, string> = { projected: 'Projected', upper: 'Upper Bound', lower: 'Lower Bound' }
                    return [`$${Number(value).toLocaleString()}`, labels[String(name)] || String(name)]
                  }}
                  contentStyle={{ background: '#0D0D0D', border: 'none', borderRadius: 0, color: '#F5F0E8', fontSize: 11, fontWeight: 700 }}
                />
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#bandGradFull)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill="#F5F0E8"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke={COLORS.investor}
                  strokeWidth={2.5}
                  fill="url(#noiGradFull)"
                  fillOpacity={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Projection Data">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#0D0D0D]">
                  {['Month', 'Projected NOI', 'Lower Bound', 'Upper Bound', 'Confidence Range'].map((h, i) => (
                    <th key={h} className={`py-2.5 px-3 text-[9px] font-black uppercase tracking-widest ${i === 0 ? 'text-left' : 'text-right'}`} style={{ color: '#9B9B9B' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projections.map((p, i) => (
                  <tr key={p.id} className={`border-b border-[#0D0D0D] border-opacity-10 ${i % 2 === 0 ? '' : ''} hover:bg-[#EAE4D9] transition-colors`}>
                    <td className="py-2.5 px-3 text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{formatShortDate(p.month)}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[13px]" style={{ color: COLORS.investor, fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrency(p.projected)}</td>
                    <td className="py-2.5 px-3 text-right text-[11px]" style={{ color: '#9B9B9B' }}>{formatCurrency(Math.round(p.lower))}</td>
                    <td className="py-2.5 px-3 text-right text-[11px]" style={{ color: '#9B9B9B' }}>{formatCurrency(Math.round(p.upper))}</td>
                    <td className="py-2.5 px-3 text-right text-[11px] font-bold" style={{ color: '#9B9B9B' }}>±{formatCurrency(Math.round(p.upper - p.projected))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
