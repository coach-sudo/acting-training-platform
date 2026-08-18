# Security

RLS is enabled on every table. Users update only their profile. Members read their organization; only owners update it. The onboarding function derives identity from `auth.uid()`. Secrets never use public environment variables.

| Resource        | Coach                 | Target student  | Other student      | Outside org |
| --------------- | --------------------- | --------------- | ------------------ | ----------- |
| Profile         | Own                   | Own             | No                 | No          |
| Organization    | Member read           | Member read     | No                 | No          |
| Students        | Org CRUD              | Own only        | No                 | No          |
| Goals           | Org CRUD              | Own read        | No                 | No          |
| Cohorts         | Org CRUD              | Own cohort read | No roster browsing | No          |
| Sessions        | Org CRUD              | Own read        | No                 | No          |
| Private notes   | Authorized coach only | Never           | Never              | Never       |
| Published recap | Org CRUD              | Target only     | No                 | No          |

The linked remote database was tested with distinct coach and student JWTs: private-note and unpublished-recap queries returned zero rows, while the intended published recap was visible.
