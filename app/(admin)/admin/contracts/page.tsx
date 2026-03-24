'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

interface Contract {
  id: string
  tenantName: string
  tenantEmail: string
  propertyAddress: string
  landlordName: string
  contractModel: string
  monthlyTotal: number
  baseRent: number
  equityContribution: number
  platformFee: number
  propertyReserve: number
  status: string
  riskScore: number | null
  riskTier: string | null
  startDate: string
  preNegotiatedPrice: number
}

const workflowSteps = [
  { label: 'Application Received', color: COLORS.blue, num: '01' },
  { label: 'MAUI Scoring', color: COLORS.blue, num: '02' },
  { label: 'Underwriting Review', color: COLORS.yellow, num: '03' },
  { label: 'Contract Generation', color: COLORS.admin, num: '04' },
  { label: 'Tenant Signature', color: COLORS.blue, num: '05' },
  { label: 'Payment Setup', color: COLORS.green, num: '06' },
  { label: 'Active Contract', color: COLORS.green, num: '07' },
]

function getRiskBadge(tier: string | null, score: number | null) {
  if (!tier || score === null) return <span className="text-[10px] font-bold uppercase" style={{ color: '#9B9B9B' }}>N/A</span>
  const colorMap: Record<string, string> = { low: COLORS.green, medium: COLORS.yellow, high: COLORS.danger }
  return <Badge label={`${score.toFixed(0)} · ${tier}`} color={colorMap[tier] || COLORS.blue} />
}

function getStatusBadge(status: string) {
  const colorMap: Record<string, string> = { active: COLORS.green, pending: COLORS.yellow, terminated: COLORS.danger }
  return <Badge label={status.toUpperCase()} color={colorMap[status] || COLORS.blue} />
}

export default function AdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/contracts')
      .then((res) => res.json())
      .then((json) => setContracts(json.contracts || []))
      .catch((err) => console.error('Failed to load contracts:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen">
      <TopBar greeting="Contract Management" subtitle="Origination workflow · active contract tracking" accentColor={COLORS.admin} />
      <div className="p-8 space-y-6">

        {/* Workflow — Bauhaus numbered steps */}
        <Card title="Origination Workflow">
          <div className="flex items-stretch gap-0 overflow-x-auto">
            {workflowSteps.map((step, idx) => (
              <div key={step.label} className="flex items-stretch flex-shrink-0">
                <div
                  className="flex flex-col items-center justify-center px-4 py-3 min-w-[110px] border-r border-[#0D0D0D] last:border-r-0"
                  style={{ borderTop: `4px solid ${step.color}` }}
                >
                  <div
                    className="text-[9px] font-black tracking-widest mb-1"
                    style={{ color: step.color, fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.num}
                  </div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide text-center leading-tight"
                    style={{ color: '#0D0D0D' }}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div className="w-4 flex items-center justify-center text-[#9B9B9B] text-xs font-black">→</div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Contracts table */}
        <Card title="All Contracts">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>
                Loading contracts…
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#0D0D0D]">
                    {['Tenant', 'Property', 'Monthly Total', 'Status', 'Risk Score', 'Start Date'].map((h) => (
                      <th
                        key={h}
                        className="py-2.5 px-3 text-[9px] font-black uppercase tracking-widest text-left"
                        style={{ color: '#9B9B9B' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className="border-b border-[#0D0D0D] border-opacity-20 hover:bg-[#EAE4D9] transition-colors"
                    >
                      <td className="py-3 px-3">
                        <p className="font-bold text-[12px]" style={{ color: '#0D0D0D' }}>{contract.tenantName}</p>
                        <p className="text-[10px]" style={{ color: '#9B9B9B' }}>{contract.tenantEmail}</p>
                      </td>
                      <td className="py-3 px-3 text-[11px] max-w-[220px] truncate" style={{ color: '#9B9B9B' }}>
                        {contract.propertyAddress}
                      </td>
                      <td className="py-3 px-3 font-black text-[13px]" style={{ color: '#0D0D0D' }}>
                        {formatCurrency(contract.monthlyTotal)}
                      </td>
                      <td className="py-3 px-3">{getStatusBadge(contract.status)}</td>
                      <td className="py-3 px-3">{getRiskBadge(contract.riskTier, contract.riskScore)}</td>
                      <td className="py-3 px-3 text-[11px]" style={{ color: '#9B9B9B' }}>{formatDate(contract.startDate)}</td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>
                        No contracts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
