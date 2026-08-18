import { notFound } from "next/navigation";
import Link from "next/link";
import { requireCoach } from "@/lib/auth/context";
import {
  createGoal,
  setGoalStatus,
  toggleStudent,
  updateStudent,
} from "../../actions";
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = { id: (await params).studentId },
    { error } = await searchParams,
    { organizationId, supabase } = await requireCoach();
  const [
    { data: s },
    { data: goals },
    { data: focus },
    { data: sessions },
    { data: recaps },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("student_goals")
      .select("*,focus_areas(name)")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("focus_areas")
      .select("id,name")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("sessions")
      .select("id,title,session_date,status")
      .eq("student_id", id)
      .order("session_date", { ascending: false }),
    supabase
      .from("session_recaps")
      .select("id,title,published_at,created_at,sessions!inner(student_id)")
      .eq("sessions.student_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (!s) notFound();
  const events: { date: string; label: string; href?: string }[] = [
    ...(sessions ?? []).map((x) => ({
      date: x.session_date,
      label: `Session: ${x.title}`,
      href: `/app/sessions/${x.id}`,
    })),
    ...(goals ?? []).map((x) => ({
      date: x.created_at.slice(0, 10),
      label: `Goal ${x.status}: ${x.title}`,
    })),
    ...(recaps ?? []).map((x) => ({
      date: x.created_at.slice(0, 10),
      label: `${x.published_at ? "Recap published" : "Recap drafted"}: ${x.title ?? "Session recap"}`,
    })),
  ];
  events.sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Student</p>
        <h1>
          {s.preferred_name || s.first_name} {s.last_name}
        </h1>
        <span className="chip">{s.status}</span>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <section className="card">
          <h2>Profile</h2>
          <form action={updateStudent}>
            <input type="hidden" name="id" value={id} />
            <label>
              First name
              <input name="firstName" defaultValue={s.first_name} />
            </label>
            <label>
              Last name
              <input name="lastName" defaultValue={s.last_name} />
            </label>
            <label>
              Preferred name
              <input
                name="preferredName"
                defaultValue={s.preferred_name ?? ""}
              />
            </label>
            <label>
              Email
              <input name="email" type="email" defaultValue={s.email ?? ""} />
            </label>
            <label>
              Pronouns
              <input name="pronouns" defaultValue={s.pronouns ?? ""} />
            </label>
            <label>
              General context
              <textarea
                name="generalContext"
                defaultValue={s.general_context ?? ""}
              />
            </label>
            <button>Save profile</button>
          </form>
          <form action={toggleStudent}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={s.status} />
            <button className="secondary">
              Mark {s.status === "active" ? "inactive" : "active"}
            </button>
          </form>
        </section>
        <section className="card">
          <h2>Add goal</h2>
          <form action={createGoal}>
            <input type="hidden" name="studentId" value={id} />
            <label>
              Goal
              <input name="title" required />
            </label>
            <label>
              Focus area
              <select name="focusAreaId">
                <option value="">None</option>
                {focus?.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <label>
              Target date
              <input name="targetDate" type="date" />
            </label>
            <button>Add goal</button>
          </form>
        </section>
      </div>
      <section className="card">
        <h2>Goals</h2>
        <div className="stack">
          {goals?.length ? (
            goals.map((g) => (
              <article key={g.id}>
                <strong>{g.title}</strong>{" "}
                <span className="chip">{g.status}</span>{" "}
                <Link href={`/app/students/${id}/goals/${g.id}`}>Edit</Link>
                <p className="muted">
                  {g.focus_areas?.name}
                  {g.description && ` · ${g.description}`}
                </p>
                <form className="row" action={setGoalStatus}>
                  <input type="hidden" name="id" value={g.id} />
                  <input type="hidden" name="studentId" value={id} />
                  <button name="status" value="active" className="secondary">
                    Active
                  </button>
                  <button name="status" value="paused" className="secondary">
                    Pause
                  </button>
                  <button name="status" value="completed">
                    Complete
                  </button>
                </form>
              </article>
            ))
          ) : (
            <p className="muted">No goals yet.</p>
          )}
        </div>
      </section>
      <section className="card">
        <h2>Training timeline</h2>
        <div className="timeline">
          {events.length ? (
            events.map((e, i) => (
              <div key={`${e.date}-${i}`}>
                <small>{e.date}</small>
                <div>
                  {e.href ? <Link href={e.href}>{e.label}</Link> : e.label}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">
              Sessions, recaps, and goals will appear here chronologically.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
