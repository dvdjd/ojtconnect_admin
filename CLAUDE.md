# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Generate Prisma client, then build for production (prisma generate && next build)
npm run start        # Start production server
npm run lint         # Run ESLint
```

No test suite is configured yet.

After modifying `prisma/schema.prisma`, run:
```bash
npx prisma generate          # Regenerate Prisma client
npx prisma migrate dev       # Create and apply a new migration
```

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + PostgreSQL + Prisma + Tailwind CSS v4

**Path alias**: `@/*` maps to `src/*`

### Directory layout

```
src/
├── app/
│   ├── (root)/           # Root layout group — login page at /
│   ├── api/              # API route handlers (server-side only)
│   │   ├── login/        # POST: authenticate admin, set JWT cookie
│   │   └── user/         # GET/PUT/DELETE: user management
│   └── dashboard/        # Protected admin UI
├── components/
│   ├── ui/               # Generic primitives (Button, Input)
│   └── modules/          # Feature components (Login, UserList)
├── core/hooks/           # Custom React hooks (useUser)
├── lib/
│   ├── prisma.ts         # Prisma client singleton (PostgreSQL adapter via pg)
│   ├── jwt.ts            # JWT creation & verification (jose library)
│   └── utils/api.ts      # Generic fetch wrapper
└── proxy.ts              # Next.js middleware — JWT auth guard for /dashboard/*
```

### Authentication flow

1. Admin POSTs credentials to `/api/login` → queries `user_admin` table → creates JWT via `lib/jwt.ts`
2. JWT stored as HTTP-only cookie (`secure` in production)
3. `proxy.ts` (Next.js middleware) validates the JWT cookie on every `/dashboard/*` request; redirects to `/` on failure

### Database

Prisma 6 with `@prisma/adapter-pg` (native PostgreSQL). The generated client lives at `prisma/app/generated/prisma` (gitignored — always run `prisma generate` after a fresh clone or schema change).

Key model groups in `prisma/schema.prisma`:
- **Auth**: `user_access`, `user_admin`, `audit_log`
- **Students**: `student_profile`, `student_resume`, `student_document`, plus resume sub-tables
- **Companies**: `company_profile`, `employer_subscription`, `employer_feedback`
- **Jobs & Applications**: `job_post`, `application`, `interview_schedule`, `student_placement`
- **OJT Tracking**: `ojt_tracking`, `daily_time_record`, `student_evaluation`
- **Universities**: `university`, `university_profile`, `university_coordinator`, `university_department`
- **Billing**: `subscription_plan`, `employer_subscription`, `university_subscription`, `billing_history`

### Environment variables

Required in `.env`:
- `DB_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret used by `lib/jwt.ts`
