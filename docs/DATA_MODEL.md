# Data model

Phase 1 defines `profiles`, `organizations`, and `organization_memberships`. A profile shares the Auth user ID. Memberships connect a user to an organization as owner, coach, or student. `create_coach_organization` atomically creates coach onboarding data.

Phase 2 adds `students`, `cohorts`, `cohort_members`, `focus_areas`, and `student_goals`. Phase 3 adds `sessions`, `session_focus_areas`, `session_private_notes`, and `session_recaps`. A session targets exactly one student or cohort. One session has at most one private-note document and one recap document.

Later migrations add resources, plans, assignments, invitations, feedback, and events.
