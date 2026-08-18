import { notFound } from "next/navigation";
import { requireCoach } from "@/lib/auth/context";
import {
  addCohortMember,
  removeCohortMember,
  updateCohort,
} from "../../actions";
export default async function Page({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const id = (await params).cohortId,
    { organizationId, supabase } = await requireCoach();
  const [{ data: c }, { data: members }, { data: students }] =
    await Promise.all([
      supabase
        .from("cohorts")
        .select("*")
        .eq("id", id)
        .eq("organization_id", organizationId)
        .maybeSingle(),
      supabase
        .from("cohort_members")
        .select("student_id,students(id,first_name,last_name,preferred_name)")
        .eq("cohort_id", id),
      supabase
        .from("students")
        .select("id,first_name,last_name,preferred_name")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .order("last_name"),
    ]);
  if (!c) notFound();
  const joined = new Set(members?.map((m) => m.student_id));
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Cohort</p>
        <h1>{c.name}</h1>
      </div>
      <div className="split">
        <section className="card">
          <h2>Cohort details</h2>
          <form action={updateCohort}>
            <input type="hidden" name="id" value={id} />
            <label>
              Name
              <input name="name" defaultValue={c.name} />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={c.description ?? ""} />
            </label>
            <label>
              Status
              <select name="status" defaultValue={c.status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button>Save cohort</button>
          </form>
          <h2>Add student</h2>
          <form action={addCohortMember}>
            <input type="hidden" name="cohortId" value={id} />
            <label>
              Student
              <select name="studentId" required>
                <option value="">Choose student</option>
                {students
                  ?.filter((s) => !joined.has(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.preferred_name || s.first_name} {s.last_name}
                    </option>
                  ))}
              </select>
            </label>
            <button>Add to cohort</button>
          </form>
        </section>
        <section className="card">
          <h2>Members</h2>
          <div className="stack">
            {members?.length ? (
              members.map((m) => {
                const s = Array.isArray(m.students)
                  ? m.students[0]
                  : m.students;
                return (
                  <form
                    className="row"
                    action={removeCohortMember}
                    key={m.student_id}
                  >
                    <input type="hidden" name="cohortId" value={id} />
                    <input
                      type="hidden"
                      name="studentId"
                      value={m.student_id}
                    />
                    <strong>
                      {s?.preferred_name || s?.first_name} {s?.last_name}
                    </strong>
                    <button className="secondary">Remove</button>
                  </form>
                );
              })
            ) : (
              <p className="muted">No students in this cohort.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
