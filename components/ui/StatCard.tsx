interface StatCardProps {
  value: string
  label: string
  accentColor: string
  subtitle?: string
}

export default function StatCard({ value, label, accentColor, subtitle }: StatCardProps) {
  return (
    <div className="overflow-hidden border-2" style={{ borderColor: '#0D0D0D', backgroundColor: '#F5F0E8' }}>
      <div className="h-[6px]" style={{ backgroundColor: accentColor }} />
      <div className="px-5 py-4">
        <div
          className="text-3xl font-black leading-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#0D0D0D' }}
        >
          {value}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.18em] mt-2" style={{ color: '#9B9B9B' }}>
          {label}
        </div>
        {subtitle && (
          <div className="text-[10px] mt-0.5" style={{ color: '#9B9B9B' }}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}
