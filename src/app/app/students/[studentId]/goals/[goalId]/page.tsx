import { notFound } from "next/navigation";
import { requireCoach } from "@/lib/auth/context";
import { updateGoal } from "../../../../actions";

export default async function Page({
  params,
}: {
  params: Promise<{ studentId: string; goalId: string }>;
}) {
  const { studentId, goalId } = await params;
  const { organizationId, supabase } = await requireCoach();
  const [{ data: goal }, { data: areas }] = await Promise.all([
    supabase
      .from("student_goals")
      .select("*")
      .eq("id", goalId)
      .eq("student_id", studentId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("focus_areas")
      .select("id,name")
      .eq("organization_id", organizationId)
      .eq("active", true)
      .order("sort_order"),
  ]);
  if (!goal) notFound();
  return (
    <main className="shell dashboard">
      <section className="card">
        <p className="eyebrow">Edit goal</p>
        <h1>{goal.title}</h1>
        <form action={updateGoal}>
          <input type="hidden" name="id" value={goalId} />
          <input type="hidden" name="studentId" value={studentId} />
          <label>
            Goal
            <input name="title" defaultValue={goal.title} />
          </label>
          <label>
            Focus area
            <select name="focusAreaId" defaultValue={goal.focus_area_id ?? ""}>
              <option value="">None</option>
              {areas?.map((a) => (
                <option value={a.id} key={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea
              name="description"
              defaultValue={goal.description ?? ""}
            />
          </label>
          <label>
            Target date
            <input
              type="date"
              name="targetDate"
              defaultValue={goal.target_date ?? ""}
            />
          </label>
          <button>Save goal</button>
        </form>
      </section>
    </main>
  );
}
