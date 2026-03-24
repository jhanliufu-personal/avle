export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

export function formatCurrencyDecimal(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

export function formatPercent(n: number): string {
  return `${n.toFixed(2)}%`
}

export function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatShortDate(s: string): string {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
