'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { formatCurrency, formatCurrencyDecimal, formatDate, formatPercent } from '@/lib/utils'

interface ContractData {
  contract: {
    id: string; contractModel: string; startDate: string; preNegotiatedPrice: number
    monthlyTotal: number; baseRent: number; equityContribution: number; platformFee: number
    propertyReserve: number; vestingMonths: number; purchaseOptionMonth: number; renewalCapPct: number
    status: string; riskScore: number | null; riskTier: string | null
    property: { address: string; city: string; state: string; zip: string; unit: string | null; type: string; tier: string; marketValue: number }
    landlord: { name: string }
  } | null
  documents: Array<{ id: string; name: string; type: string; signedDate: string | null; status: string }>
  equityBalance: number
}

export default function ContractPage() {
  const [data, setData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/contract')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <TopBar greeting="Contract Terms" subtitle="Loading…" accentColor={COLORS.client} />
        <div className="p-8 space-y-6">
          <div className="h-80 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />
        </div>
      </div>
    )
  }

  if (!data || !data.contract) {
    return (
      <div>
        <TopBar greeting="Contract Terms" accentColor={COLORS.client} />
        <div className="p-8">
          <Card title="No Data"><p className="text-xs" style={{ color: '#9B9B9B' }}>Contract data unavailable.</p></Card>
        </div>
      </div>
    )
  }

  const { contract, documents, equityBalance } = data

  const contractFields = [
    { label: 'Contract Model', value: contract.contractModel },
    { label: 'Start Date', value: formatDate(contract.startDate) },
    { label: 'Status', value: contract.status, badge: true },
    { label: 'Property', value: `${contract.property.address}${contract.property.unit ? `, ${contract.property.unit}` : ''}` },
    { label: 'Location', value: `${contract.property.city}, ${contract.property.state} ${contract.property.zip}` },
    { label: 'Property Type', value: `${contract.property.type} / ${contract.property.tier}` },
    { label: 'Landlord', value: contract.landlord.name },
    { label: 'Pre-Negotiated Price', value: formatCurrency(contract.preNegotiatedPrice) },
    { label: 'Market Value', value: formatCurrency(contract.property.marketValue) },
    { label: 'Monthly Payment', value: formatCurrencyDecimal(contract.monthlyTotal) },
    { label: 'Lease Payment', value: formatCurrencyDecimal(contract.baseRent) },
    { label: 'Equity Contribution', value: formatCurrencyDecimal(contract.equityContribution) },
    { label: 'Platform Fee', value: formatCurrencyDecimal(contract.platformFee) },
    { label: 'Property Reserve', value: formatCurrencyDecimal(contract.propertyReserve) },
    { label: 'Vesting Period', value: `${contract.vestingMonths} months` },
    { label: 'Purchase Option', value: `Month ${contract.purchaseOptionMonth}` },
    { label: 'Renewal Cap', value: `${contract.renewalCapPct}% annually` },
  ]

  const riskColor = contract.riskTier === 'low' ? COLORS.green : contract.riskTier === 'medium' ? COLORS.yellow : COLORS.danger

  return (
    <div>
      <TopBar greeting="Contract Terms" subtitle="Your lease-equity agreement details" accentColor={COLORS.client} />
      <div className="p-8">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 space-y-6">
            <Card title="Contract Summary">
              <div className="space-y-0">
                {contractFields.map((field, i) => (
                  <div key={field.label} className={`flex items-center justify-between py-2.5 ${i < contractFields.length - 1 ? 'border-b border-[#0D0D0D] border-opacity-10' : ''}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{field.label}</span>
                    {field.badge ? (
                      <Badge label={field.value.toUpperCase()} color={field.value === 'active' ? COLORS.green : COLORS.yellow} />
                    ) : (
                      <span className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{field.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Document Vault">
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${COLORS.client}` }}>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{doc.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#9B9B9B' }}>
                        {doc.signedDate ? `Signed ${formatDate(doc.signedDate)}` : 'Pending signature'}
                      </p>
                    </div>
                    <Badge label={doc.status === 'signed' ? 'Signed' : 'Pending'} color={doc.status === 'signed' ? COLORS.green : COLORS.yellow} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="col-span-2 space-y-6">
            <Card title="Conversion Pathway">
              <p className="text-xs mb-5" style={{ color: '#9B9B9B' }}>Your pathway to homeownership through the AV lease equity model.</p>
              <div className="space-y-2">
                {[
                  { num: '01', title: 'Accumulate', description: 'Build equity through monthly contributions and market returns', color: COLORS.client, active: true },
                  { num: '02', title: 'Qualify', description: 'Meet vesting requirements and maintain payment history', color: COLORS.green, active: equityBalance >= 5000 },
                  { num: '03', title: 'Convert', description: 'Exercise purchase option at pre-negotiated price', color: COLORS.blue, active: false },
                  { num: '04', title: 'Own', description: 'Complete your lease equity conversion and become a homeowner', color: COLORS.black, active: false },
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3 p-3 border border-[#0D0D0D]" style={{ borderLeft: `4px solid ${step.active ? step.color : '#9B9B9B'}` }}>
                    <span className="text-[9px] font-black tracking-widest flex-shrink-0 mt-0.5" style={{ color: step.active ? step.color : '#9B9B9B', fontFamily: "'Space Grotesk', sans-serif" }}>{step.num}</span>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: step.active ? '#0D0D0D' : '#9B9B9B' }}>{step.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#9B9B9B' }}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Equity progress bar */}
              <div className="mt-5 pt-4 border-t-2 border-[#0D0D0D]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Equity Progress</span>
                  <span className="text-[13px] font-black" style={{ color: COLORS.client, fontFamily: "'Space Grotesk', sans-serif" }}>{formatPercent((equityBalance / contract.preNegotiatedPrice) * 100)}</span>
                </div>
                <div className="h-3 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                  <div className="h-full transition-all" style={{ width: `${Math.min((equityBalance / contract.preNegotiatedPrice) * 100, 100)}%`, backgroundColor: COLORS.client }} />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px]" style={{ color: '#9B9B9B' }}>{formatCurrency(equityBalance)}</span>
                  <span className="text-[10px]" style={{ color: '#9B9B9B' }}>{formatCurrency(contract.preNegotiatedPrice)}</span>
                </div>
              </div>
            </Card>

            {contract.riskScore && (
              <Card title="Risk Assessment">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 flex items-center justify-center text-white text-2xl font-black flex-shrink-0" style={{ backgroundColor: riskColor, fontFamily: "'Space Grotesk', sans-serif" }}>
                    {Math.round(contract.riskScore)}
                  </div>
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-wide" style={{ color: riskColor }}>{contract.riskTier === 'low' ? 'Low Risk' : contract.riskTier === 'medium' ? 'Medium Risk' : 'High Risk'}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#9B9B9B' }}>Based on payment history, credit factors, and market conditions</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
