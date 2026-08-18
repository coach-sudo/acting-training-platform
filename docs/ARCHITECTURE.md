# Architecture

Next.js App Router uses server components and validated server actions. `src/proxy.ts` refreshes Supabase sessions and protects `/app`. Supabase Auth owns identity; profiles hold presentation data; organizations and contextual memberships authorize access. Every organization-scoped table uses RLS.

Authentication includes email confirmation and password-recovery callbacks. Protected coach routes include the dashboard, students, cohorts, focus areas, sessions, and nested student/session workspaces. Server actions derive organization and user identity from the authenticated session.

The student timeline is derived from goals, sessions, and recaps rather than duplicated in a timeline table. Private notes and publishable recaps are structurally separate.
