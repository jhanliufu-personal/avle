'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'

interface Landlord {
  id: string; name: string; email: string
  propertyCount: number; totalUnits: number; occupancyRate: number; activeContracts: number
  properties: { id: string; address: string; city: string; state: string }[]
}

const platformFeatures = [
  { title: 'Property Portfolio Overview', description: 'Complete visibility into property performance, tenant placements, and contract status across all units.', color: COLORS.blue },
  { title: 'Disbursement Tracking', description: 'Real-time tracking of lease payment disbursements, reserve fund allocations, and payment schedules.', color: COLORS.green },
  { title: 'Occupancy Rates', description: 'Live occupancy metrics with vacancy alerts and tenant pipeline status for open units.', color: COLORS.yellow },
  { title: 'Communication Portal', description: 'Direct messaging with AV operations team for maintenance requests, lease questions, and support.', color: COLORS.admin },
]

export default function AdminLandlordsPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/landlords')
      .then((res) => res.json())
      .then((json) => setLandlords(json.landlords || []))
      .catch((err) => console.error('Failed to load landlords:', err))
      .finally(() => setLoading(false))
  }, [])

  const totalProperties = landlords.reduce((sum, l) => sum + l.propertyCount, 0)
  const avgOccupancy = landlords.length ? landlords.reduce((sum, l) => sum + l.occupancyRate, 0) / landlords.length : 0

  return (
    <div className="min-h-screen">
      <TopBar greeting="Landlord Management" subtitle="Property owner relationships and portfolio oversight" accentColor={COLORS.admin} />
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-3 gap-px border-2 border-[#0D0D0D] overflow-hidden">
          {[
            { label: 'Total Landlords', value: landlords.length, color: COLORS.admin },
            { label: 'Total Properties', value: totalProperties, color: COLORS.blue },
            { label: 'Avg. Occupancy', value: `${avgOccupancy.toFixed(1)}%`, color: COLORS.green },
          ].map((item) => (
            <div key={item.label} className="p-4" style={{ backgroundColor: '#F5F0E8' }}>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{item.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: item.color, fontFamily: "'Space Grotesk', sans-serif" }}>{item.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-3">
            <div className="w-4 h-4 border-2 border-[#0D0D0D] border-t-transparent animate-spin" />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>Loading landlords…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {landlords.map((landlord) => (
              <div key={landlord.id} className="border-2 border-[#0D0D0D] overflow-hidden" style={{ backgroundColor: '#F5F0E8' }}>
                <div className="h-[5px]" style={{ backgroundColor: COLORS.admin }} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-[13px] uppercase tracking-wide" style={{ color: '#0D0D0D' }}>{landlord.name}</h3>
                      <p className="text-[10px] mt-0.5" style={{ color: '#9B9B9B' }}>{landlord.email}</p>
                    </div>
                    <Badge label={`${landlord.activeContracts} active`} color={COLORS.blue} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Properties', value: landlord.propertyCount, color: COLORS.blue },
                      { label: 'Units', value: landlord.totalUnits, color: COLORS.blue },
                      { label: 'Occupancy', value: `${landlord.occupancyRate}%`, color: landlord.occupancyRate >= 90 ? COLORS.green : COLORS.yellow },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{stat.label}</p>
                        <p className="text-xl font-black" style={{ color: stat.color, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  {/* Bauhaus occupancy bar */}
                  <div className="h-2.5 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
                    <div className="h-full transition-all" style={{ width: `${landlord.occupancyRate}%`, backgroundColor: landlord.occupancyRate >= 90 ? COLORS.green : COLORS.yellow }} />
                  </div>
                  {landlord.properties.length > 0 && (
                    <div className="mt-4 pt-3 border-t-2 border-[#0D0D0D]">
                      <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: '#9B9B9B' }}>Properties</p>
                      {landlord.properties.slice(0, 3).map((prop) => (
                        <p key={prop.id} className="text-[10px] truncate mb-0.5" style={{ color: '#9B9B9B' }}>{prop.address}, {prop.city}, {prop.state}</p>
                      ))}
                      {landlord.properties.length > 3 && (
                        <p className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: COLORS.admin }}>+{landlord.properties.length - 3} more</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {landlords.length === 0 && (
              <div className="col-span-full text-center py-8 text-[11px] font-bold uppercase tracking-widest" style={{ color: '#9B9B9B' }}>No landlords found</div>
            )}
          </div>
        )}

        <Card title="Landlord Portal Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {platformFeatures.map((feature) => (
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
