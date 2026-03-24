'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ui/ProgressBar'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { formatCurrencyDecimal, formatDate } from '@/lib/utils'

interface PaymentData {
  payments: Array<{ id: string; date: string; totalAmount: number; baseRent: number; equityContrib: number; platformFee: number; propertyReserve: number; status: string }>
  contract: { monthlyTotal: number; baseRent: number; equityContribution: number; platformFee: number; propertyReserve: number } | null
  bankName: string
  bankLast4: string
  autopayEnabled: boolean
  nextPaymentDate: string | null
}

export default function PaymentsPage() {
  const [data, setData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/client/payments')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <TopBar greeting="Lease Payments" subtitle="Loading…" accentColor={COLORS.client} />
        <div className="p-8">
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 h-96 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />
            <div className="col-span-2 space-y-6">
              <div className="h-44 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />
              <div className="h-44 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data || !data.contract) {
    return (
      <div>
        <TopBar greeting="Lease Payments" accentColor={COLORS.client} />
        <div className="p-8">
          <Card title="No Data"><p className="text-xs" style={{ color: '#9B9B9B' }}>Payment data unavailable.</p></Card>
        </div>
      </div>
    )
  }

  const { contract, bankName, bankLast4, autopayEnabled, nextPaymentDate } = data
  const total = contract.monthlyTotal

  const breakdownItems = [
    { label: 'Lease Payment', amount: contract.baseRent, percentage: (contract.baseRent / total) * 100, color: COLORS.blue },
    { label: 'AV Platform Fee', amount: contract.platformFee, percentage: (contract.platformFee / total) * 100, color: COLORS.admin },
    { label: 'Equity Contribution', amount: contract.equityContribution, percentage: (contract.equityContribution / total) * 100, color: COLORS.green },
    { label: 'Property Reserve', amount: contract.propertyReserve, percentage: (contract.propertyReserve / total) * 100, color: COLORS.client },
  ]

  const nextDate = nextPaymentDate ? formatDate(nextPaymentDate) : 'N/A'

  return (
    <div>
      <TopBar greeting="Lease Payments" subtitle="Payment breakdown and schedule" accentColor={COLORS.client} />
      <div className="p-8">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <Card>
              <div className="mb-5 pb-4 border-b-2 border-[#0D0D0D]">
                <h3 className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>Payment Breakdown</h3>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#9B9B9B' }}>Current month</p>
              </div>
              <div className="space-y-5">
                {breakdownItems.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{item.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrencyDecimal(item.amount)}</span>
                        <span className="text-[10px] ml-2" style={{ color: '#9B9B9B' }}>({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <ProgressBar percentage={item.percentage} color={item.color} showLabel={false} />
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#0D0D0D] flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Total Monthly Payment</span>
                <span className="text-2xl font-black" style={{ color: COLORS.client, fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrencyDecimal(total)}</span>
              </div>
            </Card>
          </div>

          <div className="col-span-2 space-y-6">
            <Card title="Payment Method">
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-[#0D0D0D] border-opacity-15">
                  <div>
                    <p className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{bankName}</p>
                    <p className="text-[10px]" style={{ color: '#9B9B9B' }}>Account ending in {bankLast4}</p>
                  </div>
                  <div className="w-2.5 h-2.5" style={{ backgroundColor: COLORS.client }} />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[#0D0D0D] border-opacity-15">
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>AutoPay Status</span>
                  <Badge label={autopayEnabled ? 'Enabled' : 'Disabled'} color={autopayEnabled ? COLORS.green : COLORS.yellow} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>Next Withdrawal</span>
                  <span className="text-[12px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{nextDate}</span>
                </div>
              </div>
            </Card>

            <Card title="Payment Schedule">
              <div className="space-y-0">
                {[
                  { label: 'Payment Day', value: '15th of each month' },
                  { label: 'Processing', value: '1-2 business days' },
                  { label: 'Late Fee Grace Period', value: '5 days' },
                  { label: 'Payment Method', value: 'ACH Direct Debit' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[#0D0D0D] border-opacity-15 last:border-0">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{item.label}</span>
                    <span className="text-[11px] font-bold" style={{ color: '#0D0D0D' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Recent Payments">
              <div className="space-y-0">
                {data.payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-2.5 border-b border-[#0D0D0D] border-opacity-15 last:border-0">
                    <p className="text-[11px] font-bold" style={{ color: '#9B9B9B' }}>{formatDate(payment.date)}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrencyDecimal(payment.totalAmount)}</span>
                      <Badge label={payment.status === 'paid' ? 'Paid' : 'Pending'} color={payment.status === 'paid' ? COLORS.green : COLORS.yellow} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
