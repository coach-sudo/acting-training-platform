# Acting Training Platform

Phases 1–3 of training-continuity software for acting coaches: secure studio accounts, teaching relationships, goals, cohorts, sessions, private notes, recaps, and a derived student timeline.

## Setup

Requires Node.js 20.9+, npm, and Supabase.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Apply `supabase/migrations/202608170001_phase1_foundation.sql`, then run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

The coach workspace includes `/app/students`, `/app/cohorts`, `/app/focus-areas`, and `/app/sessions`. Apply every migration with `npx supabase db push`; do not create tables manually in the dashboard.

Core versions: Next.js 16.3.1, React 19.2.8, Supabase JS 2.112.3, Supabase SSR 0.12.4, Zod 4.4.3, TypeScript 6.x, Vitest 4.1.11.
