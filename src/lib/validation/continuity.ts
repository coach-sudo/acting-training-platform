import { z } from "zod";
const optional = z
  .string()
  .trim()
  .transform((v) => v || null);
export const studentSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  preferredName: optional,
  email: z.union([z.email(), z.literal("")]).transform((v) => v || null),
  pronouns: optional,
  generalContext: optional,
});
export const cohortSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: optional,
});
export const focusSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: optional,
});
export const goalSchema = z.object({
  studentId: z.uuid(),
  focusAreaId: z.union([z.uuid(), z.literal("")]).transform((v) => v || null),
  title: z.string().trim().min(2).max(160),
  description: optional,
  targetDate: z
    .union([z.iso.date(), z.literal("")])
    .transform((v) => v || null),
});
export const sessionSchema = z.object({
  title: z.string().trim().min(2).max(160),
  sessionDate: z.iso.date(),
  durationMinutes: z.coerce.number().int().min(1).max(1440),
  targetType: z.enum(["student", "cohort"]),
  targetId: z.uuid(),
});
