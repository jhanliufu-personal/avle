export const COLORS = {
  // Bauhaus primaries
  red: '#D62828',
  blue: '#003F88',
  yellow: '#F7B731',
  black: '#0D0D0D',
  white: '#F5F0E8',
  gray: '#9B9B9B',
  green: '#2D6A4F',

  // Role accents
  admin: '#D62828',
  investor: '#003F88',
  client: '#F7B731',

  // Semantic
  success: '#2D6A4F',
  warn: '#F7B731',
  danger: '#D62828',

  // Legacy aliases (kept for pages that still reference old names)
  teal: '#003F88',
  tealLight: '#003F88',
  mint: '#2D6A4F',
  purple: '#D62828',
}

export interface NavItem {
  label: string
  href: string
  icon?: string
}

export const INVESTOR_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/investor/dashboard' },
  { label: 'Portfolio', href: '/investor/portfolio' },
  { label: 'Returns', href: '/investor/returns' },
  { label: 'NOI', href: '/investor/noi' },
  { label: 'Reports', href: '/investor/reports' },
  { label: 'Documents', href: '/investor/documents' },
]

export const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Contracts', href: '/admin/contracts' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Portfolio', href: '/admin/portfolio' },
  { label: 'Risk', href: '/admin/risk' },
  { label: 'Landlords', href: '/admin/landlords' },
  { label: 'Reports', href: '/admin/reports' },
]

export const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', href: '/client/dashboard' },
  { label: 'Payments', href: '/client/payments' },
  { label: 'Equity', href: '/client/equity' },
  { label: 'Contract', href: '/client/contract' },
  { label: 'Documents', href: '/client/documents' },
]

export const ROLE_HOME: Record<string, string> = {
  investor: '/investor/dashboard',
  client: '/client/dashboard',
  admin: '/admin/dashboard',
}
