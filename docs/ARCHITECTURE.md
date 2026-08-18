# Architecture

Next.js App Router uses server components and validated server actions. `src/proxy.ts` refreshes Supabase sessions and protects `/app`. Supabase Auth owns identity; profiles hold presentation data; organizations and contextual memberships authorize access. Every organization-scoped table uses RLS.

Phase 1 routes: `/`, `/login`, `/signup`, `/forgot-password`, `/onboarding`, and protected `/app`.
