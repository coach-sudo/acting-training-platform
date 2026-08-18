import { onboard } from "../(auth)/actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (membership) redirect("/app");
  return (
    <main className="shell auth">
      <div className="card">
        <h1>Name your studio</h1>
        {error && <p className="error">{error}</p>}
        <form action={onboard}>
          <label>
            Your name
            <input name="displayName" required />
          </label>
          <label>
            Studio name
            <input name="organizationName" required />
          </label>
          <button>Create studio</button>
        </form>
      </div>
    </main>
  );
}
