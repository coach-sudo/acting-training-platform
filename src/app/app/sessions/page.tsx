import Link from "next/link";
import { requireCoach } from "@/lib/auth/context";
import { createSession } from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams,
    { organizationId, supabase } = await requireCoach();
  const [{ data: sessions }, { data: students }, { data: cohorts }] =
    await Promise.all([
      supabase
        .from("sessions")
        .select(
          "id,title,session_date,duration_minutes,status,students(first_name,last_name,preferred_name),cohorts(name)",
        )
        .eq("organization_id", organizationId)
        .order("session_date", { ascending: false }),
      supabase
        .from("students")
        .select("id,first_name,last_name,preferred_name")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("last_name"),
      supabase
        .from("cohorts")
        .select("id,name")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("name"),
    ]);
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Sessions</p>
        <h1>Training sessions</h1>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <section className="card">
          <h2>Create session</h2>
          <form action={createSession}>
            <label>
              Title
              <input name="title" required />
            </label>
            <label>
              Date
              <input type="date" name="sessionDate" required />
            </label>
            <label>
              Duration (minutes)
              <input
                type="number"
                name="durationMinutes"
                min="1"
                defaultValue="60"
                required
              />
            </label>
            <label>
              Student or cohort
              <select name="target" required>
                <option value="">Choose target</option>
                <optgroup label="Students">
                  {students?.map((s) => (
                    <option key={s.id} value={`student:${s.id}`}>
                      {s.preferred_name || s.first_name} {s.last_name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Cohorts">
                  {cohorts?.map((c) => (
                    <option key={c.id} value={`cohort:${c.id}`}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <button>Create session</button>
          </form>
        </section>
        <section className="stack">
          {sessions?.length ? (
            sessions.map((s) => {
              const student = Array.isArray(s.students)
                  ? s.students[0]
                  : s.students,
                cohort = Array.isArray(s.cohorts) ? s.cohorts[0] : s.cohorts;
              return (
                <Link
                  className="card"
                  key={s.id}
                  href={`/app/sessions/${s.id}`}
                >
                  <small>{s.session_date}</small>
                  <h2>{s.title}</h2>
                  <p>
                    {student
                      ? `${student.preferred_name || student.first_name} ${student.last_name}`
                      : cohort?.name}{" "}
                    · {s.duration_minutes} minutes
                  </p>
                  <span className="chip">{s.status}</span>
                </Link>
              );
            })
          ) : (
            <div className="card">
              <p>
                Create a session to connect today&apos;s work with what comes
                next.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
