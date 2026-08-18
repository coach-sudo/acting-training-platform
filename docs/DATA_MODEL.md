# Data model

Phase 1 defines `profiles`, `organizations`, and `organization_memberships`. A profile shares the Auth user ID. Memberships connect a user to an organization as owner, coach, or student. `create_coach_organization` atomically creates coach onboarding data.

Later migrations add students, cohorts, goals, sessions, separate notes/recaps, resources, plans, assignments, invitations, feedback, and events.
