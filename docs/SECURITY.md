# Security

RLS is enabled on every table. Users update only their profile. Members read their organization; only owners update it. The onboarding function derives identity from `auth.uid()`. Secrets never use public environment variables.

| Resource | Coach | Target student | Other student | Outside org |
|---|---|---|---|---|
| Profile | Own | Own | No | No |
| Organization | Member read | Member read | No | No |
| Private notes (future) | Authorized | Never | Never | Never |
| Published recap (future) | Authorized | Target only | No | No |
