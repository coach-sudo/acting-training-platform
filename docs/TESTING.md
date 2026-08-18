# Testing

Run lint, strict TypeScript, unit tests, and production build. `supabase/tests/phases_2_3_rls.sql` is a transactional pgTAP test for student isolation, private notes, draft recaps, published recaps, and session access. Run it against local Supabase with `npx supabase test db`.

The linked project was also verified using real, distinct coach and student access tokens. Release testing still expands with Playwright as later end-to-end flows are introduced.
