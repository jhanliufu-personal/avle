# ArcusVenturis — av-1

Internal developer setup guide.

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
# Clone the repository
git clone git@github.com:noah-av-code/av-1.git
cd av-1

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local and fill in the required values (see below)

# Run the database migration and seed
DATABASE_URL="file:./prisma/dev.db" npx prisma migrate dev
npm run seed

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file at the project root with the following:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-for-local-dev
DATABASE_URL="file:./prisma/dev.db"
```

## Dev Login Credentials

| Role     | Email                     | Password     |
|----------|---------------------------|--------------|
| Investor | investor@example.com      | investor123  |
| Investor | investor2@example.com     | investor456  |
| Client   | client@example.com        | client123    |
| Client   | client2@example.com       | client456    |
| Admin    | admin@example.com         | admin123     |

All credentials and data are served from the SQLite database. Run `npm run seed` to populate it.

## Inspecting the Database

All data lives in a single SQLite file at `prisma/dev.db`. Two ways to inspect it:

**SQLite shell:**
```bash
sqlite3 prisma/dev.db

# Then run SQL, e.g.:
.tables
SELECT name, email, role FROM User;
SELECT * FROM Contract;
.quit
```

**Prisma visual browser:**
```bash
DATABASE_URL="file:./prisma/dev.db" npx prisma studio
```

Opens a web UI at `http://localhost:5555` where you can browse and edit all records.

The file is local-only and not committed to git. Run `npm run seed` at any time to recreate all mock data from scratch.

## Project Structure

```
app/
  (auth)/login/        — Login page
  (investor)/          — Investor portal layout + pages
  (client)/            — Client portal layout + pages
  (admin)/             — Admin portal layout + pages
  api/auth/            — NextAuth route handler
components/
  layout/              — Sidebar, TopBar
  ui/                  — Card, StatCard, Badge, ProgressBar
lib/
  auth.ts              — NextAuth configuration (reads users from DB)
  prisma.ts            — PrismaClient singleton
  constants.ts         — Shared colors, nav items
  utils.ts             — Formatting helpers
prisma/
  schema.prisma        — Database schema
  seed.ts              — Mock seed data (2 investors, 2 clients, 2 contracts)
  dev.db               — SQLite database (generated, not committed)
middleware.ts          — Role-based route protection
```
