import Link from "next/link";
import { requireCoach } from "@/lib/auth/context";
import { createCohort } from "../actions";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams,
    { organizationId, supabase } = await requireCoach();
  const { data } = await supabase
    .from("cohorts")
    .select("id,name,description,status,cohort_members(count)")
    .eq("organization_id", organizationId)
    .order("name");
  return (
    <main className="shell dashboard stack">
      <div>
        <p className="eyebrow">Cohorts</p>
        <h1>Classes and groups</h1>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="split">
        <section className="card">
          <h2>Create cohort</h2>
          <form action={createCohort}>
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Description
              <textarea name="description" />
            </label>
            <button>Create cohort</button>
          </form>
        </section>
        <section className="stack">
          {data?.length ? (
            data.map((c) => (
              <Link className="card" href={`/app/cohorts/${c.id}`} key={c.id}>
                <h2>{c.name}</h2>
                <p>{c.description}</p>
                <span className="chip">{c.status}</span>{" "}
                <span className="muted">
                  {c.cohort_members[0]?.count ?? 0} students
                </span>
              </Link>
            ))
          ) : (
            <div className="card">
              <p>
                Create a class or workshop group to keep shared training work
                together.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
