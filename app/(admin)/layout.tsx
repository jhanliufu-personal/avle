'use client'
import Sidebar from '@/components/layout/Sidebar'
import { ADMIN_NAV, COLORS } from '@/lib/constants'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#EAE4D9' }}>
      <Sidebar portalName="ADMIN PORTAL" navItems={ADMIN_NAV} accentColor={COLORS.admin} />
      <main className="ml-60 flex-1">{children}</main>
    </div>
  )
}
