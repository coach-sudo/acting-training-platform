"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCoach } from "@/lib/auth/context";
import {
  cohortSchema,
  focusSchema,
  goalSchema,
  sessionSchema,
  studentSchema,
} from "@/lib/validation/continuity";
const v = (f: FormData, n: string) => String(f.get(n) ?? "");
const fail = (path: string, m = "Invalid form values"): never =>
  redirect(`${path}?error=${encodeURIComponent(m)}`);
export async function createStudent(f: FormData) {
  const p = studentSchema.safeParse({
    firstName: v(f, "firstName"),
    lastName: v(f, "lastName"),
    preferredName: v(f, "preferredName"),
    email: v(f, "email"),
    pronouns: v(f, "pronouns"),
    generalContext: v(f, "generalContext"),
  });
  if (!p.success) fail("/app/students");
  const d = p.data!;
  const { organizationId, supabase } = await requireCoach();
  const { data, error } = await supabase
    .from("students")
    .insert({
      organization_id: organizationId,
      first_name: d.firstName,
      last_name: d.lastName,
      preferred_name: d.preferredName,
      email: d.email,
      pronouns: d.pronouns,
      general_context: d.generalContext,
    })
    .select("id")
    .single();
  if (error) fail("/app/students", "Unable to add student");
  redirect(`/app/students/${data!.id}`);
}
export async function updateStudent(f: FormData) {
  const id = v(f, "id"),
    p = studentSchema.safeParse({
      firstName: v(f, "firstName"),
      lastName: v(f, "lastName"),
      preferredName: v(f, "preferredName"),
      email: v(f, "email"),
      pronouns: v(f, "pronouns"),
      generalContext: v(f, "generalContext"),
    });
  if (!p.success) fail(`/app/students/${id}`);
  const d = p.data!;
  const { organizationId, supabase } = await requireCoach();
  const { error } = await supabase
    .from("students")
    .update({
      first_name: d.firstName,
      last_name: d.lastName,
      preferred_name: d.preferredName,
      email: d.email,
      pronouns: d.pronouns,
      general_context: d.generalContext,
    })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) fail(`/app/students/${id}`, "Unable to update student");
  revalidatePath(`/app/students/${id}`);
}
export async function toggleStudent(f: FormData) {
  const { organizationId, supabase } = await requireCoach();
  const id = v(f, "id"),
    status = v(f, "status") === "active" ? "inactive" : "active";
  await supabase
    .from("students")
    .update({ status })
    .eq("id", id)
    .eq("organization_id", organizationId);
  revalidatePath(`/app/students/${id}`);
  revalidatePath("/app/students");
}
export async function createFocusArea(f: FormData) {
  const p = focusSchema.safeParse({
    name: v(f, "name"),
    description: v(f, "description"),
  });
  if (!p.success) fail("/app/focus-areas");
  const d = p.data!;
  const { organizationId, supabase } = await requireCoach(),
    { count } = await supabase
      .from("focus_areas")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId);
  const { error } = await supabase.from("focus_areas").insert({
    organization_id: organizationId,
    name: d.name,
    description: d.description,
    sort_order: count ?? 0,
  });
  if (error) fail("/app/focus-areas", "Unable to add focus area");
  revalidatePath("/app/focus-areas");
}
export async function toggleFocusArea(f: FormData) {
  const { organizationId, supabase } = await requireCoach();
  await supabase
    .from("focus_areas")
    .update({ active: v(f, "active") !== "true" })
    .eq("id", v(f, "id"))
    .eq("organization_id", organizationId);
  revalidatePath("/app/focus-areas");
}
export async function updateFocusArea(f: FormData) {
  const p = focusSchema.safeParse({
    name: v(f, "name"),
    description: v(f, "description"),
  });
  if (!p.success) fail("/app/focus-areas");
  const { organizationId, supabase } = await requireCoach(),
    d = p.data!;
  const { error } = await supabase
    .from("focus_areas")
    .update({ name: d.name, description: d.description })
    .eq("id", v(f, "id"))
    .eq("organization_id", organizationId);
  if (error) fail("/app/focus-areas", "Unable to update focus area");
  revalidatePath("/app/focus-areas");
}
export async function moveFocusArea(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    id = v(f, "id"),
    direction = v(f, "direction");
  const { data } = await supabase
    .from("focus_areas")
    .select("id,sort_order")
    .eq("organization_id", organizationId)
    .order("sort_order")
    .order("created_at");
  if (!data) return;
  const index = data.findIndex((x) => x.id === id),
    swap = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || swap < 0 || swap >= data.length) return;
  await Promise.all([
    supabase
      .from("focus_areas")
      .update({ sort_order: data[swap].sort_order })
      .eq("id", data[index].id),
    supabase
      .from("focus_areas")
      .update({ sort_order: data[index].sort_order })
      .eq("id", data[swap].id),
  ]);
  revalidatePath("/app/focus-areas");
}
export async function createGoal(f: FormData) {
  const p = goalSchema.safeParse({
    studentId: v(f, "studentId"),
    focusAreaId: v(f, "focusAreaId"),
    title: v(f, "title"),
    description: v(f, "description"),
    targetDate: v(f, "targetDate"),
  });
  if (!p.success) fail(`/app/students/${v(f, "studentId")}`);
  const d = p.data!;
  const { organizationId, supabase } = await requireCoach();
  const { error } = await supabase.from("student_goals").insert({
    organization_id: organizationId,
    student_id: d.studentId,
    focus_area_id: d.focusAreaId,
    title: d.title,
    description: d.description,
    target_date: d.targetDate,
  });
  if (error) fail(`/app/students/${d.studentId}`, "Unable to add goal");
  revalidatePath(`/app/students/${d.studentId}`);
}
export async function setGoalStatus(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    status = v(f, "status");
  if (!["active", "paused", "completed"].includes(status)) return;
  await supabase
    .from("student_goals")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", v(f, "id"))
    .eq("organization_id", organizationId);
  revalidatePath(`/app/students/${v(f, "studentId")}`);
}
export async function updateGoal(f: FormData) {
  const p = goalSchema.safeParse({
    studentId: v(f, "studentId"),
    focusAreaId: v(f, "focusAreaId"),
    title: v(f, "title"),
    description: v(f, "description"),
    targetDate: v(f, "targetDate"),
  });
  if (!p.success) fail(`/app/students/${v(f, "studentId")}`);
  const { organizationId, supabase } = await requireCoach(),
    d = p.data!;
  const { error } = await supabase
    .from("student_goals")
    .update({
      focus_area_id: d.focusAreaId,
      title: d.title,
      description: d.description,
      target_date: d.targetDate,
    })
    .eq("id", v(f, "id"))
    .eq("organization_id", organizationId)
    .eq("student_id", d.studentId);
  if (error) fail(`/app/students/${d.studentId}`, "Unable to update goal");
  revalidatePath(`/app/students/${d.studentId}`);
}
export async function createCohort(f: FormData) {
  const p = cohortSchema.safeParse({
    name: v(f, "name"),
    description: v(f, "description"),
  });
  if (!p.success) fail("/app/cohorts");
  const d = p.data!;
  const { organizationId, supabase } = await requireCoach(),
    { data, error } = await supabase
      .from("cohorts")
      .insert({ organization_id: organizationId, ...d })
      .select("id")
      .single();
  if (error) fail("/app/cohorts", "Unable to create cohort");
  redirect(`/app/cohorts/${data!.id}`);
}
export async function updateCohort(f: FormData) {
  const id = v(f, "id"),
    p = cohortSchema.safeParse({
      name: v(f, "name"),
      description: v(f, "description"),
    });
  if (!p.success) fail(`/app/cohorts/${id}`);
  const { organizationId, supabase } = await requireCoach(),
    d = p.data!;
  const { error } = await supabase
    .from("cohorts")
    .update({
      name: d.name,
      description: d.description,
      status: v(f, "status") === "active" ? "active" : "inactive",
    })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) fail(`/app/cohorts/${id}`, "Unable to update cohort");
  revalidatePath(`/app/cohorts/${id}`);
  revalidatePath("/app/cohorts");
}
export async function addCohortMember(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    cohortId = v(f, "cohortId"),
    studentId = v(f, "studentId");
  const [{ data: c }, { data: s }] = await Promise.all([
    supabase
      .from("cohorts")
      .select("id")
      .eq("id", cohortId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
  ]);
  if (c && s)
    await supabase
      .from("cohort_members")
      .upsert({
        cohort_id: cohortId,
        student_id: studentId,
        organization_id: organizationId,
      });
  revalidatePath(`/app/cohorts/${cohortId}`);
}
export async function removeCohortMember(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    cohortId = v(f, "cohortId");
  const { data: c } = await supabase
    .from("cohorts")
    .select("id")
    .eq("id", cohortId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (c)
    await supabase
      .from("cohort_members")
      .delete()
      .eq("cohort_id", cohortId)
      .eq("student_id", v(f, "studentId"));
  revalidatePath(`/app/cohorts/${cohortId}`);
}
export async function createSession(f: FormData) {
  const [targetType, targetId] = v(f, "target").split(":");
  const p = sessionSchema.safeParse({
    title: v(f, "title"),
    sessionDate: v(f, "sessionDate"),
    durationMinutes: v(f, "durationMinutes"),
    targetType,
    targetId,
  });
  if (!p.success) fail("/app/sessions");
  const d = p.data!;
  const { organizationId, user, supabase } = await requireCoach(),
    table = d.targetType === "student" ? "students" : "cohorts";
  const { data: target } = await supabase
    .from(table)
    .select("id")
    .eq("id", d.targetId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!target) fail("/app/sessions", "Target not found");
  const { data, error } = await supabase
    .from("sessions")
    .insert({
      organization_id: organizationId,
      coach_user_id: user.id,
      title: d.title,
      session_date: d.sessionDate,
      duration_minutes: d.durationMinutes,
      student_id: d.targetType === "student" ? d.targetId : null,
      cohort_id: d.targetType === "cohort" ? d.targetId : null,
    })
    .select("id")
    .single();
  if (error) fail("/app/sessions", "Unable to create session");
  redirect(`/app/sessions/${data!.id}`);
}
export async function updateSession(f: FormData) {
  const id = v(f, "id"),
    targetType = v(f, "studentId") ? "student" : "cohort",
    targetId = v(f, targetType === "student" ? "studentId" : "cohortId"),
    p = sessionSchema.safeParse({
      title: v(f, "title"),
      sessionDate: v(f, "sessionDate"),
      durationMinutes: v(f, "durationMinutes"),
      targetType,
      targetId,
    });
  if (!p.success) fail(`/app/sessions/${id}`);
  const { organizationId, supabase } = await requireCoach(),
    d = p.data!,
    status = v(f, "status");
  if (!["planned", "completed", "canceled"].includes(status))
    fail(`/app/sessions/${id}`);
  const { error } = await supabase
    .from("sessions")
    .update({
      title: d.title,
      session_date: d.sessionDate,
      duration_minutes: d.durationMinutes,
      status,
    })
    .eq("id", id)
    .eq("organization_id", organizationId);
  if (error) fail(`/app/sessions/${id}`, "Unable to update session");
  revalidatePath(`/app/sessions/${id}`);
  revalidatePath("/app/sessions");
}
export async function completeSession(f: FormData) {
  const { organizationId, supabase } = await requireCoach();
  await supabase
    .from("sessions")
    .update({ status: "completed" })
    .eq("id", v(f, "id"))
    .eq("organization_id", organizationId);
  revalidatePath(`/app/sessions/${v(f, "id")}`);
}
export async function toggleSessionFocusArea(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    sessionId = v(f, "sessionId"),
    focusAreaId = v(f, "focusAreaId"),
    enabled = v(f, "enabled") === "true";
  const [{ data: s }, { data: a }] = await Promise.all([
    supabase
      .from("sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
    supabase
      .from("focus_areas")
      .select("id")
      .eq("id", focusAreaId)
      .eq("organization_id", organizationId)
      .maybeSingle(),
  ]);
  if (s && a) {
    if (enabled)
      await supabase
        .from("session_focus_areas")
        .delete()
        .eq("session_id", sessionId)
        .eq("focus_area_id", focusAreaId);
    else
      await supabase
        .from("session_focus_areas")
        .insert({
          session_id: sessionId,
          focus_area_id: focusAreaId,
          organization_id: organizationId,
        });
  }
  revalidatePath(`/app/sessions/${sessionId}`);
}
export async function savePrivateNote(f: FormData) {
  const { organizationId, user, supabase } = await requireCoach(),
    sessionId = v(f, "sessionId");
  const { data: s } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!s) throw new Error("Session not found");
  const { error } = await supabase.from("session_private_notes").upsert(
    {
      session_id: sessionId,
      organization_id: organizationId,
      author_user_id: user.id,
      content: v(f, "content"),
    },
    { onConflict: "session_id" },
  );
  if (error) throw new Error("Unable to save private note");
  revalidatePath(`/app/sessions/${sessionId}`);
}
export async function saveRecap(f: FormData) {
  const { organizationId, user, supabase } = await requireCoach(),
    sessionId = v(f, "sessionId");
  const { data: s, error: sessionError } = await supabase
    .from("sessions")
    .select("id,student_id")
    .eq("id", sessionId)
    .eq("organization_id", organizationId)
    .single();
  if (sessionError || !s) throw new Error("Session not found");
  const { error } = await supabase.from("session_recaps").upsert(
    {
      session_id: sessionId,
      organization_id: organizationId,
      student_id: s.student_id,
      title: v(f, "title") || null,
      content: v(f, "content"),
      created_by: user.id,
    },
    { onConflict: "session_id" },
  );
  if (error) throw new Error("Unable to save recap");
  revalidatePath(`/app/sessions/${sessionId}`);
}
export async function publishRecap(f: FormData) {
  const { organizationId, supabase } = await requireCoach(),
    sessionId = v(f, "sessionId");
  await saveRecap(f);
  await supabase
    .from("session_recaps")
    .update({ published_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("organization_id", organizationId);
  revalidatePath(`/app/sessions/${sessionId}`);
}
