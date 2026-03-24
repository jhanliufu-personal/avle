'use client'

import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'

const DOCUMENT_CATEGORIES = [
	{
		title: 'Fund Documents',
		color: COLORS.investor,
		documents: [
			{ name: 'Limited Partnership Agreement', date: 'January 2025', status: 'Current' },
			{ name: 'Private Placement Memorandum', date: 'January 2025', status: 'Current' },
			{ name: 'Subscription Agreement', date: 'January 2025', status: 'Executed' },
		],
	},
	{
		title: 'Compliance & Legal',
		color: COLORS.blue,
		documents: [
			{ name: 'Audited Financial Statements — FY2025', date: 'March 2026', status: 'Published' },
			{ name: 'Regulatory Filing — Form D', date: 'January 2025', status: 'Filed' },
			{ name: 'Anti-Money Laundering Policy', date: 'January 2025', status: 'Current' },
		],
	},
	{
		title: 'Quarterly Reports',
		color: COLORS.green,
		documents: [
			{ name: 'Q4 2025 Investor Letter', date: 'January 2026', status: 'Published' },
			{ name: 'Q3 2025 Investor Letter', date: 'October 2025', status: 'Published' },
			{ name: 'Q2 2025 Investor Letter', date: 'July 2025', status: 'Published' },
			{ name: 'Q1 2025 Investor Letter', date: 'April 2025', status: 'Published' },
		],
	},
]

const STATUS_COLORS: Record<string, string> = {
	Current: COLORS.green,
	Executed: COLORS.investor,
	Published: COLORS.green,
	Filed: COLORS.blue,
}

export default function DocumentsPage() {
	return (
		<>
			<TopBar
				greeting="Documents"
				subtitle="Fund documents, compliance filings, and investor communications"
				accentColor={COLORS.investor}
			/>
			<div className="p-8 space-y-6">
				{DOCUMENT_CATEGORIES.map((category) => (
					<Card key={category.title} title={category.title} accent={category.color}>
						<div className="space-y-2">
							{category.documents.map((doc, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 border border-[#0D0D0D] hover:bg-[#EAE4D9] transition-colors"
									style={{ borderLeft: `4px solid ${category.color}` }}
								>
									<div>
										<p className="text-[12px] font-bold" style={{ color: '#0D0D0D' }}>
											{doc.name}
										</p>
										<p className="text-[10px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#9B9B9B' }}>
											{doc.date}
										</p>
									</div>
									<Badge label={doc.status} color={STATUS_COLORS[doc.status] || COLORS.blue} />
								</div>
							))}
						</div>
					</Card>
				))}

				<div className="p-6 border-2 border-[#0D0D0D] text-center" style={{ borderLeft: `4px solid ${COLORS.investor}` }}>
					<p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#0D0D0D' }}>
						Document Vault
					</p>
					<p className="text-xs" style={{ color: '#9B9B9B' }}>
						All documents are stored securely and available for download. Document management features including upload, versioning, and
						e-signatures will be available in a future release.
					</p>
				</div>
			</div>
		</>
	)
}
