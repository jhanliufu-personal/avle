'use client'
import Sidebar from '@/components/layout/Sidebar'
import { CLIENT_NAV, COLORS } from '@/lib/constants'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#EAE4D9' }}>
      <Sidebar portalName="CLIENT PORTAL" navItems={CLIENT_NAV} accentColor={COLORS.client} />
      <main className="ml-60 flex-1">{children}</main>
    </div>
  )
}
