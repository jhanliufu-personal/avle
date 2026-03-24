# Production Readiness Checklist

This document tracks everything currently running in a simplified/dummy state that must be addressed before going to production.

---

## 1. Authentication & User Management

**Current state:** Auth reads from the database (`prisma.user.findUnique`) but passwords are stored and compared as plain text.

**Files:**
- `lib/auth.ts` — compares `credentials.password === user.password` directly

**What needs to change:**
- Store passwords as bcrypt hashes in the `User.password` field (rename to `passwordHash`)
- Switch `lib/auth.ts` to use `bcrypt.compare(credentials.password, user.passwordHash)`
- Add user registration / invite flow for onboarding new investors, clients, and admins
- Consider adding session expiry, refresh token rotation, and remember-me behaviour

**Example production `authorize` function:**
```ts
const user = await prisma.user.findUnique({ where: { email: credentials.email } })
if (!user) return null
const valid = await bcrypt.compare(credentials.password, user.passwordHash)
if (!valid) return null
return { id: user.id, email: user.email, name: user.name, role: user.role }
```

---

## 2. Environment Variables & Secrets

**Current state:** `NEXTAUTH_SECRET` is a placeholder string.

**What needs to change:**
- Generate a cryptographically secure secret: `openssl rand -base64 32`
- Store all secrets in a secrets manager (e.g. AWS Secrets Manager, Vercel env vars, Doppler)
- Never commit `.env.local` or any secrets to the repository
- Add a `.env.local.example` file with placeholder keys for developer onboarding

**Required production env vars:**
```env
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=<secure-random-string>
DATABASE_URL=<your-database-connection-string>
```

---

## 3. Database

**Current state:** No database connected. Prisma is installed but no schema or migrations exist.

**What needs to change:**
- Define a Prisma schema (`prisma/schema.prisma`) covering at minimum:
  - `User` (id, name, email, passwordHash, role, createdAt)
  - `Contract`, `Property`, `Payment`, `EquityAccount`, `Document` — based on the data shapes used across all pages
- Run `prisma migrate dev` to create initial migrations
- Run `prisma generate` to generate the client
- Seed the database with test data to replace the hardcoded fallbacks in each page

---

## 4. API Routes — All Missing

**Current state:** Every data-fetching call across all portals hits an API endpoint that does not exist. Pages fall back to empty states or fallback hardcoded values.

**Missing endpoints:**

| Portal   | Route                        | Used By                        |
|----------|------------------------------|--------------------------------|
| Investor | `/api/investor/dashboard`    | investor/dashboard             |
| Investor | `/api/investor/portfolio`    | investor/portfolio             |
| Investor | `/api/investor/returns`      | investor/returns               |
| Investor | `/api/investor/noi`          | investor/noi                   |
| Investor | `/api/investor/reports`      | investor/reports               |
| Investor | `/api/investor/documents`    | investor/documents             |
| Client   | `/api/client/dashboard`      | client/dashboard               |
| Client   | `/api/client/payments`       | client/payments                |
| Client   | `/api/client/equity`         | client/equity                  |
| Client   | `/api/client/contract`       | client/contract                |
| Client   | `/api/client/documents`      | client/documents               |
| Admin    | `/api/admin/dashboard`       | admin/dashboard                |
| Admin    | `/api/admin/contracts`       | admin/contracts, admin/portfolio, admin/risk |
| Admin    | `/api/admin/payments`        | admin/payments                 |
| Admin    | `/api/admin/risk`            | admin/risk                     |
| Admin    | `/api/admin/landlords`       | admin/landlords                |

**What needs to change:**
- Implement each route under `app/api/`
- Each route should authenticate the session (`getServerSession(authOptions)`) and authorise by role before returning data
- Return real data from the database via Prisma

**Example pattern for a protected route:**
```ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await prisma.contract.findMany({ where: { userId: session.user.id } })
  return NextResponse.json(data)
}
```

---

## 5. Role-Based Access Control

**Current state:** Middleware redirects unauthenticated users and wrong-role users. No server-side enforcement within API routes.

**What needs to change:**
- Every API route must verify the session and check the user's role server-side — middleware alone is not sufficient
- Consider a shared `requireRole(role)` utility to avoid repetition across routes

---

## 6. Document & Report Downloads

**Current state:** Download and view buttons on the Client Documents, Client Contract, and Admin Reports pages are UI-only — no file handling is wired up.

**What needs to change:**
- Store documents in an object storage service (e.g. AWS S3, Cloudflare R2)
- Generate short-lived presigned URLs server-side and return them to the client on demand
- Never expose raw storage URLs directly to the client

---

## 7. Admin Reports — Hardcoded Data

**Current state:** The admin Reports page (`app/(admin)/admin/reports/page.tsx`) uses fully hardcoded report entries with no real generation logic.

**What needs to change:**
- Implement a report generation system (scheduled jobs or on-demand)
- Track report status and download availability in the database
- Wire the Download buttons to real file URLs (see section 6)

---

## 8. Admin Dashboard — Fallback Data

**Current state:** The admin Dashboard uses hardcoded fallback stats (`activeContracts: 142`, `monthlyCollections: 234000`, etc.) and hardcoded pipeline stages when the API returns nothing.

**What needs to change:**
- Remove all hardcoded fallback values once the API is implemented
- Compute all stats from real database queries

---

## 9. Security Hardening

Items not yet addressed that are required for production:

- **HTTPS only** — enforce via hosting platform (Vercel, AWS) or reverse proxy
- **Rate limiting** — add rate limiting to `/api/auth/callback/credentials` to prevent brute-force attacks
- **Content Security Policy** — add CSP headers via `next.config.js`
- **Input validation** — validate and sanitise all API inputs (consider Zod)
- **Audit logging** — log auth events (login, logout, failed attempts) to a persistent store
- **Password policy** — enforce minimum length and complexity on any user-facing password creation
