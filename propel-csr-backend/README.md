# Propel CSR Activity Management — Backend Starter

This is a **real, runnable** Node.js + Express + PostgreSQL backend for the
CSR Activity Management App, scaffolded directly from the BRD
(`Business_Requirements_Document.docx`) — not a mockup.

It covers Phase 1 / MVP modules from BRD Section 6:
- Volunteer registration & profile (6.1)
- Community need registration (6.2)
- CSR proposal & event creation (6.3)
- Event publishing & volunteer registration (6.4)
- Volunteer selection & attendance (6.5)
- Budget allocation & utilization, with the "can't exceed approved budget"
  rule enforced server-side (6.7)
- Approval workflow with a mandatory audit trail (6.8)
- Event completion & closure (6.9)

## What's here

```
propel-csr-backend/
├── prisma/
│   ├── schema.prisma   ← full data model (BRD Section 10 entities)
│   └── seed.js         ← seeds the 12 CSR categories from Section 5
├── sql/
│   ├── schema.sql      ← raw PostgreSQL DDL: tables, PK/FK, indexes, CHECK
│   │                      constraints, ENUM types, updated_at triggers —
│   │                      independent of Prisma, for DBA/security review
│   └── seed.sql        ← sample data (categories, employees, one need,
│                          one event) to sanity-check the schema directly
├── src/
│   ├── index.js        ← Express app entrypoint
│   ├── prismaClient.js
│   └── routes/
│       ├── events.js       (proposals, publishing, applications, attendance, closure)
│       ├── volunteers.js   (employee master + volunteer opt-in + leaderboard)
│       ├── needs.js        (community need lifecycle)
│       ├── budget.js       (allocation, requests, utilization)
│       └── approvals.js    (approve/reject + audit history)
├── package.json
└── .env.example
```

### Which schema file should you actually use?

`prisma/schema.prisma` and `sql/schema.sql` describe the **same** data
model in two formats. Pick one path:

- **Prisma-first (recommended for Claude Code workflows):** run
  `npx prisma migrate dev` and let Prisma generate and own the actual
  database tables. Use `sql/schema.sql` as a human-readable reference for
  DBA/security review, not something you also execute.
- **SQL-first:** if your DBA team wants to own and review the DDL
  directly, run `psql -d propel_csr -f sql/schema.sql` yourself, then run
  `npx prisma db pull` so Prisma reads the existing structure back in and
  stays in sync for the application code.

Running **both** independently against the same database will conflict —
don't do that.

I ran `sql/schema.sql` and `sql/seed.sql` against a real PostgreSQL 16
instance while building this: every table, ENUM type, trigger, and index
created without errors, and the foreign key / CHECK / UNIQUE constraints
correctly rejected bad data in testing (invalid category reference,
negative budget amount, duplicate employee ID).

## Getting it running (local dev)

### Prerequisites

You need **PostgreSQL** (the backend does not use MySQL/WAMP). Pick one option:

| Option | Steps |
|---|---|
| **Docker Desktop** (easiest) | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then `npm run db:up` |
| **PostgreSQL installer** | Install from [postgresql.org](https://www.postgresql.org/download/windows/), create database `propel_csr`, update `.env` |
| **Cloud (Neon)** | Free Postgres at [neon.tech](https://neon.tech) — paste connection string into `.env` |

### Setup commands

```bash
cd propel-csr-backend
npm install
```

**Windows — PostgreSQL already installed:** run the DB setup script with the password you chose when PostgreSQL was installed:

```powershell
.\scripts\setup-db.ps1 -PostgresPassword "YOUR_POSTGRES_PASSWORD"
npm run setup
npm run dev
```

**Docker:** `npm run db:up` then `npm run setup` then `npm run dev`.

**Cloud (Neon):** paste your connection string into `.env` as `DATABASE_URL`, then `npm run setup` and `npm run dev`.

Verify:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/events
```

The seed loads 12 categories, 7 employees, 1 community need, and 1 open event (Library Setup — Sulur).

## What this is NOT yet

This is a Phase-1 starter, not a finished product. Deliberately left out,
matching the BRD's own "Out of Scope — Phase 1" list:
- Authentication (no OTP/SSO wired in yet — every route is currently open)
- File upload handling for photos/bills (DocumentAttachment model exists,
  but there's no upload endpoint or cloud storage connection yet)
- Notifications delivery (table exists, no email/SMS/push sending logic)
- Role-based access control enforcement (Role enum exists on Employee, but
  routes don't check it yet)
- The mobile app and admin web dashboard that call this API

## Next steps — continuing this with Claude Code

This repo is meant to be opened in **Claude Code** (terminal or VS Code
extension) by whoever on your team owns the build. Useful first prompts
once it's open in Claude Code:

- "Add JWT-based auth with OTP login for the Employee model, and add a
  middleware that enforces the Role enum on each route."
- "Add a file upload endpoint for DocumentAttachment using [Azure Blob /
  AWS S3], matching BRD section 6.6 and 6.9."
- "Scaffold a React Native app that calls this API, starting with the
  Volunteer persona screens from the existing prototype at
  Propel_CSR_App_Prototype.jsx — reuse its screen structure and mock data
  as the UI reference, but wire it to real API calls instead of useState."
- "Write integration tests for the budget utilization endpoint, especially
  the over-budget rejection rule."

The existing `Propel_CSR_App_Prototype.jsx` (the clickable demo) is the UI
reference — its screens, fields, and flows are the spec for what the real
mobile app and admin dashboard should look like, once they're wired to
this API instead of local mock state.
