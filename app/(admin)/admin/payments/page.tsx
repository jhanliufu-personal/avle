'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrencyDecimal, formatDate } from '@/lib/utils'
import { COLORS } from '@/lib/constants'

interface Payment {
  id: string
  tenantName: string
  date: string
  totalAmount: number
  baseRent: number
  equityContrib: number
  platformFee: number
  propertyReserve: number
  status: string
}

function getStatusBadge(status: string) {
  const colorMap: Record<string, string> = { paid: COLORS.success, pending: COLORS.warn, late: COLORS.danger, failed: COLORS.danger }
  return <Badge label={status.charAt(0).toUpperCase() + status.slice(1)} color={colorMap[status] || COLORS.teal} />
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payments')
      .then((res) => res.json())
      .then((json) => setPayments(json.payments || []))
      .catch((err) => console.error('Failed to load payments:', err))
      .finally(() => setLoading(false))
  }, [])

  const totals = payments.reduce(
    (acc, p) => ({ total: acc.total + p.totalAmount, baseRent: acc.baseRent + p.baseRent, equity: acc.equity + p.equityContrib, platform: acc.platform + p.platformFee, reserve: acc.reserve + p.propertyReserve }),
    { total: 0, baseRent: 0, equity: 0, platform: 0, reserve: 0 }
  )

  return (
    <div className="min-h-screen">
      <TopBar greeting="Payment Reconciliation" subtitle="Disbursement tracking across all payment streams" accentColor={COLORS.admin} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          {[
            { label: 'Total Collected', value: formatCurrencyDecimal(totals.total), color: COLORS.admin },
            { label: 'Landlord (Lease Payment)', value: formatCurrencyDecimal(totals.baseRent), color: COLORS.black },
            { label: 'Equity Pool', value: formatCurrencyDecimal(totals.equity), color: COLORS.green },
            { label: 'AV Platform Fee', value: formatCurrencyDecimal(totals.platform), color: COLORS.blue },
            { label: 'Property Reserve', value: formatCurrencyDecimal(totals.reserve), color: COLORS.blue },
          ].map((item) => (
            <div key={item.label} className="p-4" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{item.label}</p>
              <p className="text-xl font-black mt-1" style={{ color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</p>
            </div>
          ))}
        </div>

        <Card title="Recent Payments">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading payments…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-[#0D0D0D]">
                    {['Tenant', 'Date', 'Total', 'Lease Pmnt', 'Equity', 'AV Fee', 'Reserve', 'Status'].map((h, i) => (
                      <th key={h} className={`py-2.5 px-3 text-[9px] font-black uppercase tracking-widest ${i <= 1 ? 'text-left' : i === 7 ? 'text-center' : 'text-right'}`} style={{ color: '#9B9B9B' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-[#0D0D0D] border-opacity-15 hover:bg-[#EAE4D9] transition-colors">
                      <td className="py-3 px-3 font-bold text-[12px]" style={{ color: '#0D0D0D' }}>{payment.tenantName}</td>
                      <td className="py-3 px-3 text-[11px]" style={{ color: '#9B9B9B' }}>{formatDate(payment.date)}</td>
                      <td className="py-3 px-3 text-right font-black text-[13px]" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{formatCurrencyDecimal(payment.totalAmount)}</td>
                      <td className="py-3 px-3 text-right text-[11px]" style={{ color: '#9B9B9B' }}>{formatCurrencyDecimal(payment.baseRent)}</td>
                      <td className="py-3 px-3 text-right text-[11px] font-bold" style={{ color: COLORS.green }}>{formatCurrencyDecimal(payment.equityContrib)}</td>
                      <td className="py-3 px-3 text-right text-[11px] font-bold" style={{ color: COLORS.blue }}>{formatCurrencyDecimal(payment.platformFee)}</td>
                      <td className="py-3 px-3 text-right text-[11px]" style={{ color: '#9B9B9B' }}>{formatCurrencyDecimal(payment.propertyReserve)}</td>
                      <td className="py-3 px-3 text-center">{getStatusBadge(payment.status)}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>No payments found</td></tr>
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
