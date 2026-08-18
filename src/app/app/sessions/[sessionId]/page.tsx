import { notFound } from "next/navigation";
import { requireCoach } from "@/lib/auth/context";
import { AutosaveTextarea } from "@/components/autosave-textarea";
import {
  completeSession,
  publishRecap,
  savePrivateNote,
  saveRecap,
  toggleSessionFocusArea,
  updateSession,
} from "../../actions";
export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const id = (await params).sessionId,
    { organizationId, supabase } = await requireCoach();
  const [
    { data: s },
    { data: note },
    { data: recap },
    { data: areas },
    { data: links },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("*,students(first_name,last_name,preferred_name),cohorts(name)")
      .eq("id", id)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("session_private_notes")
      .select("content")
      .eq("session_id", id)
      .maybeSingle(),
    supabase
      .from("session_recaps")
      .select("title,content,published_at")
      .eq("session_id", id)
      .maybeSingle(),
    supabase
      .from("focus_areas")
      .select("id,name")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("session_focus_areas")
      .select("focus_area_id")
      .eq("session_id", id),
  ]);
  if (!s) notFound();
  const student = Array.isArray(s.students) ? s.students[0] : s.students,
    cohort = Array.isArray(s.cohorts) ? s.cohorts[0] : s.cohorts,
    selected = new Set(links?.map((x) => x.focus_area_id));
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Session workspace</p>
        <h1>{s.title}</h1>
        <p className="lead">
          {student
            ? `${student.preferred_name || student.first_name} ${student.last_name}`
            : cohort?.name}{" "}
          · {s.session_date} · {s.duration_minutes} minutes
        </p>
        <span className="chip">{s.status}</span>
      </div>
      <section className="card">
        <h2>Session details</h2>
        <form action={updateSession}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="studentId" value={s.student_id ?? ""} />
          <input type="hidden" name="cohortId" value={s.cohort_id ?? ""} />
          <div className="grid">
            <label>
              Title
              <input name="title" defaultValue={s.title} />
            </label>
            <label>
              Date
              <input
                type="date"
                name="sessionDate"
                defaultValue={s.session_date}
              />
            </label>
            <label>
              Duration
              <input
                type="number"
                min="1"
                name="durationMinutes"
                defaultValue={s.duration_minutes ?? 60}
              />
            </label>
            <label>
              Status
              <select name="status" defaultValue={s.status}>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
              </select>
            </label>
          </div>
          <button>Save session</button>
        </form>
      </section>
      <section className="card">
        <h2>Focus areas</h2>
        <div className="row">
          {areas?.length ? (
            areas.map((a) => (
              <form action={toggleSessionFocusArea} key={a.id}>
                <input type="hidden" name="sessionId" value={id} />
                <input type="hidden" name="focusAreaId" value={a.id} />
                <input
                  type="hidden"
                  name="enabled"
                  value={String(selected.has(a.id))}
                />
                <button className={selected.has(a.id) ? "" : "secondary"}>
                  {selected.has(a.id) ? "✓ " : ""}
                  {a.name}
                </button>
              </form>
            ))
          ) : (
            <p className="muted">Create focus areas in settings first.</p>
          )}
        </div>
      </section>
      <div className="split">
        <section className="card">
          <h2>Private coaching notes</h2>
          <p className="error">
            <strong>Students cannot see this.</strong>
          </p>
          <AutosaveTextarea
            name="content"
            initialValue={note?.content ?? ""}
            sessionId={id}
            action={savePrivateNote}
            label="Private notes"
          />
        </section>
        <section className="card">
          <h2>Student-visible recap</h2>
          <p>
            This is separate from private notes and remains hidden until you
            publish it.
          </p>
          <form>
            <input type="hidden" name="sessionId" value={id} />
            <label>
              Title
              <input name="title" defaultValue={recap?.title ?? ""} />
            </label>
            <label>
              Recap
              <textarea name="content" defaultValue={recap?.content ?? ""} />
            </label>
            <div className="actions">
              <button formAction={saveRecap} className="secondary">
                Save draft
              </button>
              <button formAction={publishRecap}>Publish to student</button>
            </div>
          </form>
          {recap?.published_at && (
            <p className="save-status">
              Published {new Date(recap.published_at).toLocaleString()}
            </p>
          )}
        </section>
      </div>
      {s.status !== "completed" && (
        <form action={completeSession}>
          <input type="hidden" name="id" value={id} />
          <button>Mark session complete</button>
          <p className="muted">
            Completing a session does not publish its recap.
          </p>
        </form>
      )}
    </main>
  );
}
