'use client'
import Sidebar from '@/components/layout/Sidebar'
import { INVESTOR_NAV, COLORS } from '@/lib/constants'

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#EAE4D9' }}>
      <Sidebar portalName="INVESTOR PORTAL" navItems={INVESTOR_NAV} accentColor={COLORS.investor} />
      <main className="ml-60 flex-1">{children}</main>
    </div>
  )
}
