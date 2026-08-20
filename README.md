<div align="center">

# PathForge

**An AI-powered career operating system for software engineers — from skill gaps to job offers.**

PathForge turns a vague job search into a measurable pipeline: track skills, close gaps with generated
learning plans, manage applications through a Kanban tracker, prep for interviews, and negotiate offers —
all backed by a single career data model.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## Table of Contents

- [What It Does](#what-it-does)
- [Project Status](#project-status)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Engineering Highlights](#engineering-highlights)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Plans & Entitlements](#plans--entitlements)
- [Roadmap](#roadmap)
- [License](#license)

---

## What It Does

Job searching is usually spread across a spreadsheet, a resume folder, and a lot of guesswork. PathForge
consolidates the whole loop into one product with a shared data model, so progress in one area updates the
others — logging an interview moves the application pipeline, which recalculates the career dashboard.

| Area | What the user gets |
|---|---|
| **Career dashboard** | A composite career score with progress, streaks, and derived read models for job match and interview readiness |
| **Skills & gap analysis** | Personal skill inventory scored against a reference catalog to surface what's blocking target roles |
| **Goals & roadmaps** | Career goals with milestones, linked to the specific skills each goal requires |
| **Learning plans** | Structured plans with trackable items, either self-directed or aligned to a goal |
| **Job tracker** | Saved postings plus a drag-and-drop Kanban application pipeline that creates interview and offer records as cards move |
| **Interview prep** | Interview records by type and status, feeding a readiness projection |
| **Salary negotiation** | Offer analysis and negotiation tracking with an audit trail across multi-week negotiations |
| **Resume workspace** | Versioned resumes broken into sections, set up for ATS-style analysis |
| **AI career coach** | Persistent coaching conversations, quota-metered per subscription plan |
| **Portfolio** | Independent project entries with verification status and linked skills |
| **Community** | Posts, comments, and reactions with moderation-aware counts |
| **Gamification** | Achievement and badge definitions unlocked from real user activity, plus streaks |
| **Notifications** | Server-persisted notification feed with unread counts and deep links |

---

## Project Status

This is an actively developed portfolio project, and I'd rather be precise than oversell it:

**Working end to end** — authentication (email/password with verification and reset, plus Google and GitHub
OAuth), the full career data model, all feature modules above with real persistence, onboarding, settings,
server-side plan enforcement, transactional email, and a one-command Docker setup.

**Intentionally stubbed** — the AI coach runs through a stubbed response generator. The surrounding
infrastructure is real and complete: conversation and message persistence, token accounting, per-plan
quotas, and plan guards. Swapping in an LLM provider is a single service-layer change, which is the next
milestone.

**Not yet integrated** — payment processing. Subscription tiers, entitlements, and quota enforcement are
fully implemented server-side, but Stripe checkout and webhooks are not wired up, so plan changes are
applied directly rather than purchased.

---

## Screenshots

Save captures as `landing.png`, `dashboard.png`, `tracker.png`, and `coach.png` in `docs/screenshots/`,
then delete the two comment markers below to publish the gallery.

<!--
| Landing | Dashboard |
|---|---|
| ![Landing page](docs/screenshots/landing.png) | ![Career dashboard](docs/screenshots/dashboard.png) |

| Job Tracker | AI Coach |
|---|---|
| ![Kanban job tracker](docs/screenshots/tracker.png) | ![AI career coach](docs/screenshots/coach.png) |
-->


---

## Tech Stack

**Frontend**

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4 with a custom design system built on Radix UI primitives
- Recharts for data visualisation, React Hook Form for forms, Sonner for toasts, Lucide for icons
- Context-based state slices per domain (auth, jobs, resumes, coach, gamification, community, portfolio)

**Backend**

- NestJS 11 with TypeScript, organised into 17 feature modules
- Prisma 7 against PostgreSQL (Supabase), with `pgvector` enabled for upcoming semantic search
- Passport with JWT access tokens, rotating refresh tokens, and Google/GitHub OAuth strategies
- bcrypt password hashing, `class-validator` DTO validation on every endpoint
- Nodemailer with SMTP or Resend for verification, reset, and notification email

**Infrastructure**

- Docker Compose orchestrating three services: schema/seed init, API, and web
- Idempotent database bootstrap (extension check, schema push, optional seed) before the API boots
- Optional local Postgres override using the `pgvector/pgvector` image for offline development

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Next.js 16 App Router  (port 3000)                      │
│  views → domain adapters → typed API client              │
└───────────────────────────┬──────────────────────────────┘
                            │ REST /api  (JWT bearer)
┌───────────────────────────▼──────────────────────────────┐
│  NestJS 11 API  (port 5000)                              │
│                                                          │
│  Global guards:  JwtAuthGuard → PlanGuard                │
│  17 feature modules  ·  DTO validation  ·  PlanService   │
│  Projection layer writes CQRS-style read models          │
└───────────────────────────┬──────────────────────────────┘
                            │ Prisma 7
┌───────────────────────────▼──────────────────────────────┐
│  PostgreSQL (Supabase)  ·  pgvector                      │
│  40+ models  ·  12 aggregate roots  ·  read models       │
└──────────────────────────────────────────────────────────┘
```

The data model was designed deliberately rather than grown ad hoc. It went through four documented
revisions of aggregate analysis (see `frontend/src/domain/v2/ARCHITECTURE-v4.md`), converging from 18
loosely-defined entities to **12 aggregate roots** with explicit consistency boundaries, child entities,
value objects, reference data, and read models.

Expensive dashboard values aren't computed on every request. A dedicated projector maintains read models
(`CareerMetrics`, `ProgressDashboard`, `JobMatchInsight`, `InterviewReadiness`) so the dashboard reads
pre-aggregated rows instead of fanning out across the pipeline tables.

---

## Engineering Highlights

The parts I'd point to in a code review:

**Server-side entitlements, not client-side hints.** Plan restrictions are enforced by a global
`PlanGuard` reading a `@RequirePlan('pro')` decorator, so gating lives next to the route it protects and
can't be bypassed by calling the API directly. A separate `PlanService` handles metered quotas — monthly
AI messages, resume count, tracked applications — and throws a message naming the limit and the plan.

```ts
@Controller('negotiations')
@UseGuards(JwtAuthGuard)
@RequirePlan('premium')
export class NegotiationsController { /* ... */ }
```

**Domain leakage handled explicitly.** Salary negotiation needs an application record to analyse, but
synthetic negotiation drafts shouldn't inflate someone's real application count. Rather than scattering
filters, a single `tracked-applications.ts` module owns the definition of a "real" application and is
reused across the tracker, dashboard metrics, projections, and quota counting — so the Kanban board and
the analytics page can't drift apart.

**Auth done properly.** Short-lived access tokens with rotating refresh tokens persisted per session,
email verification and password reset flows, password change with refresh-token invalidation, and OAuth
account linking for Google and GitHub.

**Reproducible from a cold clone.** `docker compose up` enables the required Postgres extension, pushes
the Prisma schema, optionally seeds reference data, and only then starts the API — so there's no
half-initialised first run.

---

## Quick Start

### Prerequisites

- Docker and Docker Compose, or Node.js 20+ with a PostgreSQL database
- A free [Supabase](https://supabase.com) project, or the bundled local Postgres override

### Option 1 — Docker (recommended)

```bash
git clone https://github.com/oussamakharrat/pathforge-saas.git
cd pathforge-saas

# Configure the backend: add your database URLs and a JWT secret
cp backend/.env.example backend/.env

docker compose up --build
```

Web app on [http://localhost:3000](http://localhost:3000), API on [http://localhost:5000/api](http://localhost:5000/api).

To run against a throwaway local database instead of Supabase, layer in the override:

```bash
docker compose -f docker-compose.yml -f docker-compose.local-db.yml up --build
```

### Option 2 — Local development

```bash
# Backend
cd backend
npm install
cp .env.example .env          # set DATABASE_URL, DIRECT_URL, JWT_SECRET
npm run db:setup              # enable pgvector + push schema
npm run db:seed               # optional reference data
npm run start:dev             # http://localhost:5000

# Frontend (second terminal)
cd frontend
npm install
npm run dev                   # http://localhost:3000
```

### Configuration

Everything is documented inline in `backend/.env.example`. The essentials:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Pooled connection (port 6543) used by the API at runtime |
| `DIRECT_URL` | Direct connection (port 5432) used for schema pushes and migrations |
| `JWT_SECRET` | Signing secret — generate with `openssl rand -base64 32` |
| `CORS_ORIGINS` | Comma-separated allowed origins; no implicit localhost fallback |

Optional integrations, all off by default: SMTP or Resend for email, Google and GitHub OAuth credentials,
and API keys reserved for the AI and payment milestones.

---

## Project Structure

```
pathforge-saas/
├── backend/                      # NestJS API
│   ├── prisma/
│   │   ├── schema.prisma         # 40+ models, ~720 lines
│   │   └── migrations/           # includes idempotent pgvector setup
│   ├── scripts/
│   │   └── ensure-pgvector.ts    # enables the extension before schema push
│   └── src/
│       ├── auth/                 # JWT, refresh tokens, OAuth, guards, decorators
│       ├── common/               # PlanService, projector, email, gamification unlocks
│       ├── dashboard/            # aggregated career metrics and insights
│       ├── goals/  learning-plans/  resumes/  jobs/  negotiations/
│       ├── ai-coach/  community/  portfolio/  notifications/
│       └── subscriptions/  users/  reference/  domain/
├── frontend/                     # Next.js 16 app
│   └── src/
│       ├── app/                  # App Router routes (25 pages)
│       ├── views/                # page-level compositions
│       ├── components/           # design system and feature components
│       ├── contexts/             # per-domain state slices
│       ├── domain/               # domain model and architecture docs
│       ├── domain-adapter/       # maps API payloads to domain types
│       └── lib/                  # typed API client, router, utilities
├── docker-compose.yml            # init + API + web
└── docker-compose.local-db.yml   # optional local Postgres with pgvector
```

Roughly 96 TypeScript files on the backend and 210 on the frontend.

---

## Plans & Entitlements

Tiers are enforced server-side. Free limits are metered; paid tiers lift the caps and unlock feature areas.

| | Free | Pro — $29/mo | Premium — $79/mo |
|---|---|---|---|
| AI coach messages | 5 / month | Unlimited | Unlimited |
| Resumes | 1 | Unlimited | Unlimited |
| Tracked applications | 10 | Unlimited | Unlimited |
| Career insights & roadmaps | Basic | Full | Full |
| Job match insights | — | Yes | Yes |
| Mock interviews & readiness | — | — | Yes |
| Salary negotiation agent | — | — | Yes |

---

## Roadmap

- [ ] Replace the stubbed coach with a real LLM provider behind the existing service interface
- [ ] Semantic skill and job matching using the already-enabled `pgvector` column
- [ ] Stripe checkout and webhooks to drive subscription state
- [ ] Resume ATS scoring against live job descriptions
- [ ] Expand automated test coverage beyond the current smoke test
- [ ] Background job runner for projections and scheduled digest email

---

## License

Proprietary — all rights reserved. Available for review as a portfolio project.

<div align="center">

Built by [Oussama Kharrat](https://github.com/oussamakharrat)

</div>
