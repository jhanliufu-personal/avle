'use client'

import { useEffect, useState } from 'react'
import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

interface DocumentItem { id: string; name: string; type: string; signedDate: string | null; status: string }

const typeColors: Record<string, string> = {
  agreement: COLORS.client,
  disclosure: COLORS.yellow,
  terms: COLORS.blue,
  notice: COLORS.green,
}
const typeLabels: Record<string, string> = { agreement: 'Agreement', disclosure: 'Disclosure', terms: 'Terms', notice: 'Notice' }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  useEffect(() => {
    fetch('/api/client/documents')
      .then((res) => res.json())
      .then((d) => { setDocuments(d.documents || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  const docTypes = ['all', ...Array.from(new Set(documents.map((d) => d.type)))]

  if (loading) {
    return (
      <div>
        <TopBar greeting="Documents" subtitle="Loading…" accentColor={COLORS.client} />
        <div className="p-8 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse border-2 border-[#0D0D0D]" style={{ backgroundColor: '#EAE4D9' }} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <TopBar greeting="Documents" subtitle="Your signed agreements and notices" accentColor={COLORS.client} />
      <div className="p-8">
        {/* Search + Filter */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 max-w-md border-2 px-3 py-2 text-sm outline-none"
            style={{ borderColor: '#0D0D0D', backgroundColor: '#F5F0E8', color: '#0D0D0D' }}
          />
          <div className="flex items-center gap-1">
            {docTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors"
                style={filterType === type ? { backgroundColor: '#0D0D0D', color: '#F5F0E8' } : { backgroundColor: '#EAE4D9', color: '#9B9B9B' }}
              >
                {type === 'all' ? 'All' : typeLabels[type] || type}
              </button>
            ))}
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>No documents found</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc) => {
              const color = typeColors[doc.type] || COLORS.client
              return (
                <div key={doc.id} className="flex items-center justify-between p-4 border-2 border-[#0D0D0D] transition-colors hover:bg-[#EAE4D9]" style={{ borderLeft: `4px solid ${color}` }}>
                  <div>
                    <h4 className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>{doc.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge label={typeLabels[doc.type] || doc.type} color={color} />
                      <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                        {doc.signedDate ? `Signed ${formatDate(doc.signedDate)}` : 'Pending signature'}
                      </span>
                    </div>
                  </div>
                  <Badge label={doc.status === 'signed' ? 'Signed' : 'Pending'} color={doc.status === 'signed' ? COLORS.green : COLORS.yellow} />
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-6 pt-4 border-t-2 border-[#0D0D0D] flex items-center gap-6">
          {[
            { label: 'Total', value: documents.length },
            { label: 'Signed', value: documents.filter((d) => d.status === 'signed').length },
            { label: 'Pending', value: documents.filter((d) => d.status !== 'signed').length },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#9B9B9B' }}>{s.label}</span>
              <span className="text-[13px] font-black" style={{ color: '#0D0D0D', fontFamily: "'Space Grotesk', sans-serif" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
