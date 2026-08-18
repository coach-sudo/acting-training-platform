import { requireCoach } from "@/lib/auth/context";
import {
  createFocusArea,
  moveFocusArea,
  toggleFocusArea,
  updateFocusArea,
} from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams,
    { organizationId, supabase } = await requireCoach();
  const { data } = await supabase
    .from("focus_areas")
    .select("*")
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("created_at");
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Settings</p>
        <h1>Focus areas</h1>
        <p className="lead">Use your own language and methodology.</p>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <section className="card">
          <h2>Add focus area</h2>
          <form action={createFocusArea}>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <button>Add focus area</button>
          </form>
        </section>
        <section className="stack">
          {data?.map((x) => (
            <div className="card" key={x.id}>
              <form action={updateFocusArea}>
                <input type="hidden" name="id" value={x.id} />
                <label>
                  Name
                  <input name="name" defaultValue={x.name} />
                </label>
                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={x.description ?? ""}
                  />
                </label>
                <button>Save</button>
              </form>
              <div className="row">
                <form action={moveFocusArea}>
                  <input type="hidden" name="id" value={x.id} />
                  <button name="direction" value="up" className="secondary">
                    Move up
                  </button>
                  <button name="direction" value="down" className="secondary">
                    Move down
                  </button>
                </form>
                <form action={toggleFocusArea}>
                  <input type="hidden" name="id" value={x.id} />
                  <input type="hidden" name="active" value={String(x.active)} />
                  <button className="secondary">
                    {x.active ? "Deactivate" : "Reactivate"}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
