import Link from "next/link";
import { requireCoach } from "@/lib/auth/context";
import { createStudent } from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; status?: string }>;
}) {
  const { error, q = "", status = "active" } = await searchParams,
    { organizationId, supabase } = await requireCoach();
  let query = supabase
    .from("students")
    .select(
      "id,first_name,last_name,preferred_name,status,student_goals(id,status)",
    )
    .eq("organization_id", organizationId)
    .order("last_name");
  if (status === "active" || status === "inactive")
    query = query.eq("status", status);
  const safeSearch = q.replace(/[,%()]/g, " ").trim();
  if (safeSearch)
    query = query.or(
      `first_name.ilike.%${safeSearch}%,last_name.ilike.%${safeSearch}%,preferred_name.ilike.%${safeSearch}%`,
    );
  const { data } = await query;
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Students</p>
        <h1>Teaching relationships</h1>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <section className="card">
          <h2>Add an actor</h2>
          <form action={createStudent}>
            <label>
              First name
              <input name="firstName" required />
            </label>
            <label>
              Last name
              <input name="lastName" required />
            </label>
            <label>
              Preferred name
              <input name="preferredName" />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" />
            </label>
            <label>
              Pronouns
              <input name="pronouns" />
            </label>
            <label>
              General context
              <textarea name="generalContext" />
            </label>
            <button>Add student</button>
          </form>
        </section>
        <section className="stack">
          <form>
            <label>
              Search
              <input name="q" defaultValue={q} />
            </label>
            <label>
              Status
              <select name="status" defaultValue={status}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="all">All</option>
              </select>
            </label>
            <button>Search</button>
          </form>
          {data?.length ? (
            data.map((s) => (
              <Link className="card" key={s.id} href={`/app/students/${s.id}`}>
                <h2>
                  {s.preferred_name || s.first_name} {s.last_name}
                </h2>
                <span className="chip">{s.status}</span>{" "}
                <span className="muted">
                  {s.student_goals.filter((g) => g.status === "active").length}{" "}
                  active goals
                </span>
              </Link>
            ))
          ) : (
            <div className="card">
              <h2>Your studio starts here.</h2>
              <p>
                Add an actor to begin tracking lessons, goals, and training
                history.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
