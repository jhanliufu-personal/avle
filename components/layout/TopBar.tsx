interface TopBarProps {
  greeting: string
  subtitle?: string
  accentColor?: string
}

export default function TopBar({ greeting, subtitle, accentColor = '#0D0D0D' }: TopBarProps) {
  return (
    <div
      className="px-8 py-6 border-b-2 flex items-start justify-between"
      style={{ backgroundColor: '#F5F0E8', borderBottomColor: '#0D0D0D' }}
    >
      <div>
        <h1
          className="text-3xl font-black uppercase tracking-tight leading-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#0D0D0D' }}
        >
          {greeting}
        </h1>
        {subtitle && (
          <p className="text-[11px] font-bold uppercase tracking-widest mt-1.5" style={{ color: '#9B9B9B' }}>
            {subtitle}
          </p>
        )}
      </div>
      {/* Bauhaus geometric accent square */}
      <div className="w-5 h-5 flex-shrink-0 mt-1" style={{ backgroundColor: accentColor }} />
    </div>
  )
}
