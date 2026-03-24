import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Users ──────────────────────────────────────────────────────────────────
  const [alexInvestor, morganInvestor, caseyClient, jordanClient, adminUser] =
    await Promise.all([
      prisma.user.upsert({
        where: { email: 'investor@example.com' },
        update: {},
        create: { name: 'Alex Investor', email: 'investor@example.com', password: 'investor123', role: 'investor' },
      }),
      prisma.user.upsert({
        where: { email: 'investor2@example.com' },
        update: {},
        create: { name: 'Morgan Investor', email: 'investor2@example.com', password: 'investor456', role: 'investor' },
      }),
      prisma.user.upsert({
        where: { email: 'client@example.com' },
        update: {},
        create: { name: 'Casey Client', email: 'client@example.com', password: 'client123', role: 'client' },
      }),
      prisma.user.upsert({
        where: { email: 'client2@example.com' },
        update: {},
        create: { name: 'Jordan Client', email: 'client2@example.com', password: 'client456', role: 'client' },
      }),
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: { name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin' },
      }),
    ])

  // ── Landlords ──────────────────────────────────────────────────────────────
  const [landlord1, landlord2] = await Promise.all([
    prisma.landlord.upsert({
      where: { email: 'robert.harrington@landlords.com' },
      update: {},
      create: { name: 'Robert Harrington', email: 'robert.harrington@landlords.com' },
    }),
    prisma.landlord.upsert({
      where: { email: 'sandra.kim@landlords.com' },
      update: {},
      create: { name: 'Sandra Kim', email: 'sandra.kim@landlords.com' },
    }),
  ])

  // ── Properties ─────────────────────────────────────────────────────────────
  const [prop1, prop2, prop3, prop4] = await Promise.all([
    prisma.property.upsert({
      where: { id: 'prop-maple-austin' },
      update: {},
      create: {
        id: 'prop-maple-austin',
        landlordId: landlord1.id,
        address: '412 Maple St',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        type: 'Single Family',
        tier: 'Tier 1',
        marketValue: 285000,
        totalUnits: 1,
      },
    }),
    prisma.property.upsert({
      where: { id: 'prop-cedar-nashville' },
      update: {},
      create: {
        id: 'prop-cedar-nashville',
        landlordId: landlord2.id,
        address: '837 Cedar Ave',
        city: 'Nashville',
        state: 'TN',
        zip: '37215',
        type: 'Single Family',
        tier: 'Tier 2',
        marketValue: 265000,
        totalUnits: 1,
      },
    }),
    prisma.property.upsert({
      where: { id: 'prop-oak-austin' },
      update: {},
      create: {
        id: 'prop-oak-austin',
        landlordId: landlord1.id,
        address: '1204 Oak Dr',
        city: 'Austin',
        state: 'TX',
        zip: '78702',
        type: 'Townhome',
        tier: 'Tier 1',
        marketValue: 310000,
        totalUnits: 1,
      },
    }),
    prisma.property.upsert({
      where: { id: 'prop-elm-nashville' },
      update: {},
      create: {
        id: 'prop-elm-nashville',
        landlordId: landlord2.id,
        address: '550 Elm St',
        city: 'Nashville',
        state: 'TN',
        zip: '37203',
        type: 'Single Family',
        tier: 'Tier 2',
        marketValue: 248000,
        totalUnits: 1,
      },
    }),
  ])

  // ── Contracts ──────────────────────────────────────────────────────────────
  // Casey's contract: started Sep 15 2024 → 18 months active as of Mar 2026
  const caseyContract = await prisma.contract.upsert({
    where: { id: 'contract-casey' },
    update: {},
    create: {
      id: 'contract-casey',
      userId: caseyClient.id,
      propertyId: prop1.id,
      contractModel: 'Lease-to-Own',
      status: 'active',
      startDate: new Date('2024-09-15'),
      preNegotiatedPrice: 285000,
      monthlyTotal: 2850,
      baseRent: 2000,
      equityContribution: 500,
      platformFee: 200,
      propertyReserve: 150,
      vestingMonths: 24,
      purchaseOptionMonth: 36,
      renewalCapPct: 3,
      riskScore: 32,
      riskTier: 'low',
      bankName: 'Chase Bank',
      bankLast4: '4829',
      autopayEnabled: true,
      nextPaymentDate: new Date('2026-04-15'),
    },
  })

  // Jordan's contract: started Nov 1 2024 → 16 months active as of Mar 2026
  const jordanContract = await prisma.contract.upsert({
    where: { id: 'contract-jordan' },
    update: {},
    create: {
      id: 'contract-jordan',
      userId: jordanClient.id,
      propertyId: prop2.id,
      contractModel: 'Lease-to-Own',
      status: 'active',
      startDate: new Date('2024-11-01'),
      preNegotiatedPrice: 265000,
      monthlyTotal: 2600,
      baseRent: 1850,
      equityContribution: 450,
      platformFee: 180,
      propertyReserve: 120,
      vestingMonths: 24,
      purchaseOptionMonth: 36,
      renewalCapPct: 3,
      riskScore: 58,
      riskTier: 'medium',
      bankName: 'Bank of America',
      bankLast4: '7731',
      autopayEnabled: true,
      nextPaymentDate: new Date('2026-04-01'),
    },
  })

  // ── Payments ───────────────────────────────────────────────────────────────
  // Casey: 18 paid + 1 pending (Apr 2026)
  await prisma.payment.deleteMany({ where: { contractId: caseyContract.id } })
  for (let i = 0; i < 18; i++) {
    const d = new Date('2024-09-15')
    d.setMonth(d.getMonth() + i)
    await prisma.payment.create({
      data: {
        contractId: caseyContract.id,
        date: d,
        totalAmount: 2850,
        baseRent: 2000,
        equityContrib: 500,
        platformFee: 200,
        propertyReserve: 150,
        status: 'paid',
      },
    })
  }
  // Mar 2026 pending
  await prisma.payment.create({
    data: {
      contractId: caseyContract.id,
      date: new Date('2026-03-15'),
      totalAmount: 2850,
      baseRent: 2000,
      equityContrib: 500,
      platformFee: 200,
      propertyReserve: 150,
      status: 'pending',
    },
  })

  // Jordan: 16 paid + 1 pending (Apr 2026)
  await prisma.payment.deleteMany({ where: { contractId: jordanContract.id } })
  for (let i = 0; i < 16; i++) {
    const d = new Date('2024-11-01')
    d.setMonth(d.getMonth() + i)
    await prisma.payment.create({
      data: {
        contractId: jordanContract.id,
        date: d,
        totalAmount: 2600,
        baseRent: 1850,
        equityContrib: 450,
        platformFee: 180,
        propertyReserve: 120,
        status: 'paid',
      },
    })
  }
  await prisma.payment.create({
    data: {
      contractId: jordanContract.id,
      date: new Date('2026-03-01'),
      totalAmount: 2600,
      baseRent: 1850,
      equityContrib: 450,
      platformFee: 180,
      propertyReserve: 120,
      status: 'pending',
    },
  })

  // ── Equity Accounts & Snapshots ────────────────────────────────────────────
  // Casey: 18 months, $500/mo contributions
  const caseyDirectContribs = 18 * 500      // 9000
  const caseyMarketReturns = Math.round(caseyDirectContribs * 0.06)  // 540
  const caseyPlatformMatch = Math.round(caseyDirectContribs * 0.05)  // 450
  const caseyTotalBalance = caseyDirectContribs + caseyMarketReturns + caseyPlatformMatch

  const caseyEquity = await prisma.equityAccount.upsert({
    where: { userId: caseyClient.id },
    update: {
      totalBalance: caseyTotalBalance,
      directContributions: caseyDirectContribs,
      marketReturns: caseyMarketReturns,
      platformMatch: caseyPlatformMatch,
      monthsActive: 18,
      projectedFiveYear: 44000,
    },
    create: {
      userId: caseyClient.id,
      totalBalance: caseyTotalBalance,
      directContributions: caseyDirectContribs,
      marketReturns: caseyMarketReturns,
      platformMatch: caseyPlatformMatch,
      targetMarketReturn: 7.5,
      monthsActive: 18,
      projectedFiveYear: 44000,
    },
  })

  await prisma.equitySnapshot.deleteMany({ where: { equityAccountId: caseyEquity.id } })
  for (let i = 0; i < 18; i++) {
    const d = new Date('2024-09-01')
    d.setMonth(d.getMonth() + i)
    const contributions = (i + 1) * 500
    const returns = Math.round(contributions * 0.06 * ((i + 1) / 18))
    await prisma.equitySnapshot.create({
      data: {
        equityAccountId: caseyEquity.id,
        month: d,
        cumulativeTotal: contributions + returns + Math.round(contributions * 0.05 * ((i + 1) / 18)),
        contributions,
        returns,
      },
    })
  }

  // Jordan: 16 months, $450/mo contributions
  const jordanDirectContribs = 16 * 450     // 7200
  const jordanMarketReturns = Math.round(jordanDirectContribs * 0.05)  // 360
  const jordanPlatformMatch = Math.round(jordanDirectContribs * 0.04)  // 288
  const jordanTotalBalance = jordanDirectContribs + jordanMarketReturns + jordanPlatformMatch

  const jordanEquity = await prisma.equityAccount.upsert({
    where: { userId: jordanClient.id },
    update: {
      totalBalance: jordanTotalBalance,
      directContributions: jordanDirectContribs,
      marketReturns: jordanMarketReturns,
      platformMatch: jordanPlatformMatch,
      monthsActive: 16,
      projectedFiveYear: 38500,
    },
    create: {
      userId: jordanClient.id,
      totalBalance: jordanTotalBalance,
      directContributions: jordanDirectContribs,
      marketReturns: jordanMarketReturns,
      platformMatch: jordanPlatformMatch,
      targetMarketReturn: 7.5,
      monthsActive: 16,
      projectedFiveYear: 38500,
    },
  })

  await prisma.equitySnapshot.deleteMany({ where: { equityAccountId: jordanEquity.id } })
  for (let i = 0; i < 16; i++) {
    const d = new Date('2024-11-01')
    d.setMonth(d.getMonth() + i)
    const contributions = (i + 1) * 450
    const returns = Math.round(contributions * 0.05 * ((i + 1) / 16))
    await prisma.equitySnapshot.create({
      data: {
        equityAccountId: jordanEquity.id,
        month: d,
        cumulativeTotal: contributions + returns + Math.round(contributions * 0.04 * ((i + 1) / 16)),
        contributions,
        returns,
      },
    })
  }

  // ── Documents ──────────────────────────────────────────────────────────────
  await prisma.document.deleteMany({ where: { contractId: { in: [caseyContract.id, jordanContract.id] } } })

  const caseyDocs = [
    { name: 'Lease-to-Own Agreement', type: 'agreement', signedDate: new Date('2024-09-10'), status: 'signed' },
    { name: 'AV Platform Terms & Conditions', type: 'terms', signedDate: new Date('2024-09-10'), status: 'signed' },
    { name: 'Property Condition Disclosure', type: 'disclosure', signedDate: new Date('2024-09-12'), status: 'signed' },
    { name: 'Equity Participation Addendum', type: 'agreement', signedDate: new Date('2024-09-13'), status: 'signed' },
    { name: 'Annual Renewal Notice 2025', type: 'notice', signedDate: null, status: 'pending' },
  ]
  for (const doc of caseyDocs) {
    await prisma.document.create({ data: { contractId: caseyContract.id, ...doc } })
  }

  const jordanDocs = [
    { name: 'Lease-to-Own Agreement', type: 'agreement', signedDate: new Date('2024-10-27'), status: 'signed' },
    { name: 'AV Platform Terms & Conditions', type: 'terms', signedDate: new Date('2024-10-27'), status: 'signed' },
    { name: 'Property Condition Disclosure', type: 'disclosure', signedDate: new Date('2024-10-28'), status: 'signed' },
    { name: 'Equity Participation Addendum', type: 'agreement', signedDate: null, status: 'pending' },
  ]
  for (const doc of jordanDocs) {
    await prisma.document.create({ data: { contractId: jordanContract.id, ...doc } })
  }

  // ── Investor Profiles ──────────────────────────────────────────────────────
  await prisma.investorProfile.upsert({
    where: { userId: alexInvestor.id },
    update: {},
    create: {
      userId: alexInvestor.id,
      totalPortfolio: 1250000,
      annualizedReturn: 8.7,
      monthlyNOI: 52000,
      firmName: 'ArcusVenturis Capital',
    },
  })

  await prisma.investorProfile.upsert({
    where: { userId: morganInvestor.id },
    update: {},
    create: {
      userId: morganInvestor.id,
      totalPortfolio: 875000,
      annualizedReturn: 8.2,
      monthlyNOI: 36000,
      firmName: 'ArcusVenturis Capital',
    },
  })

  // ── Portfolio Tiers (fund-level) ───────────────────────────────────────────
  await prisma.portfolioTier.deleteMany()
  await prisma.portfolioTier.createMany({
    data: [
      { name: 'Tier 1 — Premium',  percentage: 45, color: '#028090' },
      { name: 'Tier 2 — Standard', percentage: 35, color: '#02C39A' },
      { name: 'Tier 3 — Entry',    percentage: 20, color: '#7C3AED' },
    ],
  })

  // ── Return Scenarios (fund-level) ──────────────────────────────────────────
  await prisma.returnScenario.deleteMany()
  await prisma.returnScenario.createMany({
    data: [
      { name: 'Conservative', returnPct: 6.8 },
      { name: 'Base Case',    returnPct: 8.7 },
      { name: 'Optimistic',   returnPct: 11.2 },
    ],
  })

  // ── NOI Projections — 24 months forward from Mar 2026 ─────────────────────
  await prisma.nOIProjection.deleteMany()
  for (let i = 0; i < 24; i++) {
    const d = new Date('2026-03-01')
    d.setMonth(d.getMonth() + i)
    const projected = Math.round(50000 * Math.pow(1.015, i))
    const spread = Math.round(projected * 0.08)
    await prisma.nOIProjection.create({
      data: { month: d, projected, lower: projected - spread, upper: projected + spread },
    })
  }

  // ── Pipeline Stages (admin dashboard) ─────────────────────────────────────
  await prisma.pipelineStage.deleteMany()
  await prisma.pipelineStage.createMany({
    data: [
      { name: 'New Applications',         count: 12, color: '#00A896', order: 1 },
      { name: 'Under Review',             count: 8,  color: '#F59E0B', order: 2 },
      { name: 'Approved — Pending Sign',  count: 5,  color: '#10B981', order: 3 },
      { name: 'Active Originations',      count: 3,  color: '#028090', order: 4 },
      { name: 'Flagged for Review',       count: 2,  color: '#EF4444', order: 5 },
    ],
  })

  // ── Investor Reports ───────────────────────────────────────────────────────
  await prisma.investorReport.deleteMany()
  const reports = [
    { title: 'Q4 2025 Quarterly Report',           type: 'quarterly',    period: 'Q4 2025', status: 'published', generatedAt: new Date('2026-01-20') },
    { title: 'December 2025 Monthly Report',       type: 'monthly',      period: 'Dec 2025', status: 'published', generatedAt: new Date('2026-01-10') },
    { title: 'Q3 2025 Quarterly Report',           type: 'quarterly',    period: 'Q3 2025', status: 'published', generatedAt: new Date('2025-10-18') },
    { title: 'Portfolio Risk Assessment — Q4 2025', type: 'risk',         period: 'Q4 2025', status: 'published', generatedAt: new Date('2026-01-25') },
    { title: 'Surveillance Report — Feb 2026',     type: 'surveillance', period: 'Feb 2026', status: 'published', generatedAt: new Date('2026-02-28') },
  ]
  for (const r of reports) {
    await prisma.investorReport.create({ data: { userId: alexInvestor.id, ...r } })
    await prisma.investorReport.create({ data: { userId: morganInvestor.id, ...r } })
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
