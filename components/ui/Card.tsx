interface CardProps {
  title?: string
  className?: string
  children: React.ReactNode
  accent?: string
}

export default function Card({ title, className, children, accent }: CardProps) {
  return (
    <div
      className={`overflow-hidden border-2 ${className ?? ''}`}
      style={{
        backgroundColor: '#F5F0E8',
        borderColor: '#0D0D0D',
        borderLeft: accent ? `4px solid ${accent}` : undefined,
      }}
    >
      {title && (
        <div
          className="px-5 py-3"
          style={{ backgroundColor: '#0D0D0D' }}
        >
          <h3
            className="text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ color: '#F5F0E8', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {title}
          </h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
