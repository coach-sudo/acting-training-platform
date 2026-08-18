"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  credentialsSchema,
  emailSchema,
  onboardingSchema,
  updatePasswordSchema,
} from "@/lib/validation/auth";
const val = (f: FormData, n: string) => String(f.get(n) ?? "");
export async function login(f: FormData) {
  const p = credentialsSchema.safeParse({
    email: val(f, "email"),
    password: val(f, "password"),
  });
  if (!p.success) redirect("/login?error=Invalid+credentials");
  const s = await createClient();
  if ((await s.auth.signInWithPassword(p.data)).error)
    redirect("/login?error=Unable+to+log+in");
  redirect("/app");
}
export async function signup(f: FormData) {
  const p = credentialsSchema.safeParse({
    email: val(f, "email"),
    password: val(f, "password"),
  });
  if (!p.success)
    redirect("/signup?error=Use+a+valid+email+and+8-character+password");
  const s = await createClient();
  const origin = val(f, "origin");
  const { data, error } = await s.auth.signUp({
    ...p.data,
    options: { emailRedirectTo: `${origin}/auth/callback?next=/onboarding` },
  });
  if (error) redirect("/signup?error=Unable+to+create+account");
  redirect(data.session ? "/onboarding" : "/check-email");
}
export async function reset(f: FormData) {
  const p = emailSchema.safeParse(val(f, "email"));
  if (!p.success) redirect("/forgot-password?error=Invalid+email");
  const s = await createClient();
  const origin = val(f, "origin");
  await s.auth.resetPasswordForEmail(p.data, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });
  redirect("/forgot-password?sent=1");
}
export async function updatePassword(f: FormData) {
  const p = updatePasswordSchema.safeParse({
    password: val(f, "password"),
    confirmPassword: val(f, "confirmPassword"),
  });
  if (!p.success)
    redirect(
      "/update-password?error=Passwords+must+match+and+contain+8+characters",
    );
  const s = await createClient();
  if ((await s.auth.updateUser({ password: p.data.password })).error)
    redirect("/update-password?error=Unable+to+update+password");
  redirect("/app");
}
export async function onboard(f: FormData) {
  const p = onboardingSchema.safeParse({
    displayName: val(f, "displayName"),
    organizationName: val(f, "organizationName"),
  });
  if (!p.success) redirect("/onboarding?error=Enter+both+names");
  const s = await createClient();
  if (
    (
      await s.rpc("create_coach_organization", {
        p_display_name: p.data.displayName,
        p_organization_name: p.data.organizationName,
      })
    ).error
  )
    redirect("/onboarding?error=Unable+to+create+studio");
  redirect("/app");
}
export async function logout() {
  const s = await createClient();
  await s.auth.signOut();
  redirect("/");
}
