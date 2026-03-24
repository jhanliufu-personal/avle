'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { NavItem } from '@/lib/constants'

interface SidebarProps {
  portalName: string
  navItems: NavItem[]
  accentColor: string
}

export default function Sidebar({ portalName, navItems, accentColor }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Brand block */}
      <div className="px-6 pt-7 pb-0">
        <div
          className="text-[10px] font-black tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#F5F0E8' }}
        >
          ARCUS VENTURIS
        </div>
        <div
          className="text-[9px] tracking-[0.35em] uppercase mt-0.5"
          style={{ color: accentColor }}
        >
          {portalName}
        </div>
        {/* Accent rule */}
        <div className="mt-4 h-[3px] w-full" style={{ backgroundColor: accentColor }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors"
              style={
                active
                  ? { color: '#F5F0E8', borderLeft: `4px solid ${accentColor}`, paddingLeft: '8px' }
                  : { color: '#9B9B9B', borderLeft: '4px solid transparent', paddingLeft: '8px' }
              }
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-5 border-t border-[#2a2a2a]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center px-3 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors text-[#9B9B9B] hover:text-[#D62828]"
          style={{ borderLeft: '4px solid transparent', paddingLeft: '8px' }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  )
}
