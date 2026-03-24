'use client'

import TopBar from '@/components/layout/TopBar'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { COLORS } from '@/lib/constants'

const reportCategories = [
	{
		title: 'Financial Reports',
		description:
			'Revenue summaries, disbursement tracking, and platform fee reconciliation.',
		color: COLORS.admin,
		reports: [
			{ name: 'Monthly Revenue Summary', period: 'Mar 2026', status: 'Ready' },
			{ name: 'Disbursement Report', period: 'Feb 2026', status: 'Ready' },
			{
				name: 'Platform Fee Reconciliation',
				period: 'Feb 2026',
				status: 'Ready',
			},
		],
	},
	{
		title: 'Portfolio Reports',
		description:
			'Contract performance, occupancy metrics, and portfolio health analysis.',
		color: COLORS.green,
		reports: [
			{ name: 'Portfolio Performance', period: 'Q1 2026', status: 'Pending' },
			{ name: 'Occupancy Analytics', period: 'Mar 2026', status: 'Ready' },
			{
				name: 'Contract Lifecycle Report',
				period: 'Feb 2026',
				status: 'Ready',
			},
		],
	},
	{
		title: 'Risk Reports',
		description:
			'MAUI scoring summaries, at-risk contract alerts, and trend analysis.',
		color: COLORS.yellow,
		reports: [
			{ name: 'MAUI Risk Summary', period: 'Mar 2026', status: 'Ready' },
			{ name: 'At-Risk Contract Alerts', period: 'Weekly', status: 'Ready' },
			{
				name: 'Risk Trend Analysis',
				period: 'Q4 2025 – Q1 2026',
				status: 'Pending',
			},
		],
	},
	{
		title: 'Compliance Reports',
		description:
			'Regulatory compliance, audit trails, and documentation status.',
		color: COLORS.blue,
		reports: [
			{ name: 'Compliance Audit Trail', period: 'Q1 2026', status: 'Pending' },
			{
				name: 'Document Verification Status',
				period: 'Mar 2026',
				status: 'Ready',
			},
			{
				name: 'Regulatory Filing Summary',
				period: 'Annual 2025',
				status: 'Ready',
			},
		],
	},
]

export default function AdminReportsPage() {
	const allReports = reportCategories.flatMap((c) => c.reports)
	const readyCount = allReports.filter((r) => r.status === 'Ready').length
	const pendingCount = allReports.filter((r) => r.status === 'Pending').length

	return (
		<div className="min-h-screen">
			<TopBar
				greeting="Reports"
				subtitle="Generate and download operational reports"
				accentColor={COLORS.admin}
			/>
			<div className="p-8 space-y-6">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-px border-2 border-[#0D0D0D] overflow-hidden">
					{[
						{
							label: 'Total Reports',
							value: allReports.length,
							color: COLORS.blue,
						},
						{
							label: 'Ready',
							value: readyCount,
							color: COLORS.green,
						},
						{
							label: 'Pending',
							value: pendingCount,
							color: COLORS.yellow,
						},
						{
							label: 'Last Generated',
							value: 'Today',
							color: COLORS.black,
						},
					].map((item) => (
						<div
							key={item.label}
							className="p-4"
							style={{ backgroundColor: '#F5F0E8' }}
						>
							<p
								className="text-[9px] font-black uppercase tracking-widest"
								style={{ color: '#9B9B9B' }}
							>
								{item.label}
							</p>
							<p
								className="text-2xl font-black mt-1"
								style={{
									color: item.color,
									fontFamily: "'Space Grotesk', sans-serif",
								}}
							>
								{item.value}
							</p>
						</div>
					))}
				</div>

				{reportCategories.map((category) => (
					<Card key={category.title} title={category.title} accent={category.color}>
						<p
							className="text-xs mb-4"
							style={{ color: '#9B9B9B' }}
						>
							{category.description}
						</p>
						<div className="space-y-2">
							{category.reports.map((report) => (
								<div
									key={report.name}
									className="flex items-center justify-between p-3 border border-[#0D0D0D]"
									style={{ borderLeft: `4px solid ${category.color}` }}
								>
									<div className="flex-1">
										<p
											className="text-[12px] font-bold"
											style={{ color: '#0D0D0D' }}
										>
											{report.name}
										</p>
										<p
											className="text-[10px] font-bold uppercase tracking-wide mt-0.5"
											style={{ color: '#9B9B9B' }}
										>
											{report.period}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<Badge
											label={report.status}
											color={
												report.status === 'Ready'
													? COLORS.green
													: COLORS.yellow
											}
										/>
										<button
											className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 transition-opacity hover:opacity-80 disabled:opacity-40"
											style={{
												backgroundColor:
													report.status === 'Ready'
														? COLORS.black
														: '#EAE4D9',
												color:
													report.status === 'Ready'
														? '#F5F0E8'
														: '#9B9B9B',
												cursor:
													report.status === 'Ready'
														? 'pointer'
														: 'not-allowed',
											}}
											disabled={report.status !== 'Ready'}
										>
											{report.status === 'Ready'
												? 'Download'
												: 'Generating…'}
										</button>
									</div>
								</div>
							))}
						</div>
					</Card>
				))}
			</div>
		</div>
	)
}
