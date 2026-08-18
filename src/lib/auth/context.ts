import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function requireCoach() {
  const supabase = await createClient(),
    {
      data: { user },
    } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase
    .from("organization_memberships")
    .select("organization_id,role,organizations(name)")
    .in("role", ["owner", "coach"])
    .limit(1)
    .maybeSingle();
  if (!membership) redirect("/onboarding");
  const organization = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations;
  return {
    supabase,
    user,
    organizationId: membership.organization_id,
    role: membership.role,
    organizationName: organization?.name ?? "Acting Training",
  };
}
