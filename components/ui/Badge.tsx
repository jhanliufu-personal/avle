interface BadgeProps {
  label: string
  color: string
}

export default function Badge({ label, color }: BadgeProps) {
  // Determine if color is yellow (needs dark text for contrast)
  const isLight = color === '#F7B731' || color === '#F59E0B'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em]"
      style={{
        backgroundColor: color,
        color: isLight ? '#0D0D0D' : '#F5F0E8',
      }}
    >
      {label}
    </span>
  )
}
