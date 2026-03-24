interface ProgressBarProps {
  percentage: number
  color: string
  showLabel?: boolean
}

export default function ProgressBar({ percentage, color, showLabel = false }: ProgressBarProps) {
  const pct = Math.min(Math.max(percentage, 0), 100)
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 border border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }}>
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-black w-8 text-right" style={{ color: '#0D0D0D' }}>
          {pct}%
        </span>
      )}
    </div>
  )
}
