# Acting Training Platform

Phase 1 foundation for training-continuity software for acting coaches.

## Setup

Requires Node.js 20.9+, npm, and Supabase.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Apply `supabase/migrations/202608170001_phase1_foundation.sql`, then run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

Core versions: Next.js 16.3.1, React 19.2.8, Supabase JS 2.112.3, Supabase SSR 0.12.4, Zod 4.4.3, TypeScript 6.x, Vitest 4.1.11.
