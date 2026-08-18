import Link from "next/link";
import { requireCoach } from "@/lib/auth/context";
export default async function Page() {
  const { organizationId, supabase } = await requireCoach();
  const [{ count: students }, { count: cohorts }, { data: sessions }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "active"),
      supabase
        .from("cohorts")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "active"),
      supabase
        .from("sessions")
        .select("id,title,session_date,status")
        .eq("organization_id", organizationId)
        .order("session_date", { ascending: false })
        .limit(5),
    ]);
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Coach workspace</p>
        <h1>Keep the work moving.</h1>
        <div className="actions">
          <Link className="button" href="/app/students">
            Add student
          </Link>
          <Link className="button secondary" href="/app/sessions">
            Create session
          </Link>
        </div>
      </div>
      <section className="grid">
        <div className="card">
          <h2>{students ?? 0}</h2>
          <p>Active students</p>
        </div>
        <div className="card">
          <h2>{cohorts ?? 0}</h2>
          <p>Active cohorts</p>
        </div>
      </section>
      <section className="card">
        <h2>Recent sessions</h2>
        {sessions?.length ? (
          <div className="stack">
            {sessions.map((s) => (
              <Link key={s.id} href={`/app/sessions/${s.id}`}>
                {s.session_date} · {s.title}{" "}
                <span className="chip">{s.status}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="muted">
            Create your first session to begin the continuity record.
          </p>
        )}
      </section>
    </main>
  );
}
