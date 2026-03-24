'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

interface InvestorReport { id: string; title: string; type: string; period: string; status: string; generatedAt: string }

const TYPE_COLORS: Record<string, string> = {
  monthly: COLORS.investor,
  quarterly: COLORS.blue,
  risk: COLORS.yellow,
  surveillance: COLORS.admin,
  'ad-hoc': COLORS.gray,
}

const TYPE_LABELS: Record<string, string> = {
  monthly: 'Monthly', quarterly: 'Quarterly', risk: 'Risk Analysis', surveillance: 'Surveillance', 'ad-hoc': 'Ad-Hoc',
}

const PIPELINE_STEPS = [
  { label: 'Validated Financial Data', description: 'Deterministic data from contracts, payments, and NOI calculations', color: COLORS.investor },
  { label: 'Deterministic Pipeline', description: 'Rule-based aggregation, risk scoring, and compliance checks', color: COLORS.blue },
  { label: 'Pre-Verified Outputs', description: 'Auditable numeric outputs that become the source of truth', color: COLORS.green },
]

const AI_STEPS = [
  { label: 'GenAI Engine', description: 'Generates narrative summaries from pre-verified data only', color: COLORS.admin },
  { label: 'Human Review', description: 'All AI-generated narratives reviewed before distribution', color: COLORS.green },
]

export default function ReportsPage() {
  const [reports, setReports] = useState<InvestorReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/reports')
      .then((res) => res.json())
      .then((d) => { setReports(d.reports || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <TopBar greeting="Reports" accentColor={COLORS.investor} />
        <div className="p-8 flex items-center justify-center h-64 gap-3">
          <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading…</span>
        </div>
      </>
    )
  }

  return (
    <>
      <TopBar greeting="Reports" subtitle="Investor reports and GenAI reporting architecture" accentColor={COLORS.investor} />
      <div className="p-8 space-y-6">
        <Card title="Published Reports">
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-3 border border-[#0D0D0D] hover:bg-[#EAE4D9] transition-colors"
                style={{ borderLeft: `4px solid ${TYPE_COLORS[report.type] || COLORS.blue}` }}
              >
                <div className="flex-1">
                  <h4 className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{report.title}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#9B9B9B' }}>
                    {report.period} · Generated {formatDate(report.generatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge label={TYPE_LABELS[report.type] || report.type} color={TYPE_COLORS[report.type] || COLORS.blue} />
                  <Badge label={report.status} color={report.status === 'published' ? COLORS.green : COLORS.yellow} />
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-center py-8" style={{ color: '#9B9B9B' }}>No reports available</p>
            )}
          </div>
        </Card>

        <Card title="GenAI Reporting Architecture">
          <p className="text-xs mb-6" style={{ color: '#9B9B9B' }}>
            The AV Platform uses a data isolation architecture that ensures GenAI never touches raw financial data. All numeric outputs are pre-computed through deterministic pipelines before any AI-generated narrative is created.
          </p>
          <div className="flex items-stretch gap-6">
            {/* Deterministic side */}
            <div className="flex-1 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#9B9B9B' }}>Deterministic Pipeline</p>
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label} className="p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${step.color}` }}>
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: '#0D0D0D' }}><span style={{ color: step.color }}>{String(i + 1).padStart(2, '0')}</span> — {step.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9B9B9B' }}>{step.description}</p>
                </div>
              ))}
            </div>

            {/* Isolation barrier */}
            <div className="flex flex-col items-center justify-center px-2">
              <div className="flex-1 w-px" style={{ backgroundColor: COLORS.admin, opacity: 0.3 }} />
              <div className="py-3 px-2 border-2 border-[#D62828] my-2" style={{ backgroundColor: '#F5F0E8' }}>
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: COLORS.admin }}>Barrier</span>
              </div>
              <div className="flex-1 w-px" style={{ backgroundColor: COLORS.admin, opacity: 0.3 }} />
            </div>

            {/* AI side */}
            <div className="flex-1 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: '#9B9B9B' }}>AI-Assisted Layer</p>
              {AI_STEPS.map((step, i) => (
                <div key={step.label} className="p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${step.color}` }}>
                  <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: '#0D0D0D' }}><span style={{ color: step.color }}>{String(i + 4).padStart(2, '0')}</span> — {step.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#9B9B9B' }}>{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 border-2 border-[#0D0D0D]" style={{ borderLeft: `4px solid ${COLORS.blue}` }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#0D0D0D' }}>Data Isolation Principle</p>
            <p className="text-xs" style={{ color: '#9B9B9B' }}>
              GenAI is only permitted to access pre-validated, pre-aggregated numeric summaries. No raw financial data, individual contract details, or PII is ever passed to the AI layer. All AI outputs are reviewed by a human analyst before investor distribution.
            </p>
          </div>
        </Card>
      </div>
    </>
  )
}
