# Phases 2 and 3

## Phase 2 — teaching relationships

- Student records exist before account linking and support profile editing and active/inactive status.
- Student lists support search and show active-goal counts.
- Cohorts support create, edit, status, add member, remove member, and member view.
- Focus areas support create, rename, description, reorder, deactivate, and reactivate.
- Goals support create, edit, active, paused, and completed states with optional focus area and target date.

## Phase 3 — training continuity

- Individual and cohort sessions support create, edit, status, date, duration, and custom focus areas.
- Private notes autosave to a coach-only table and report save failures without discarding text.
- Recaps remain separate drafts until an explicit publish action.
- Completing a session never publishes its recap.
- Student timelines derive recent sessions, goals, and recap events from source records.

## Verification

The linked database migrations are current. A live two-user RLS check proved that a linked student sees only their record and published recap, and sees neither coach private notes nor draft recaps. The transactional pgTAP equivalent is in `supabase/tests/phases_2_3_rls.sql` for local Supabase CI.
