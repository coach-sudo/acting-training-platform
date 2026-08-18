import { z } from "zod";
export const emailSchema = z.email("Enter a valid email address.");
export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(8),
});
export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2).max(80),
  organizationName: z.string().trim().min(2).max(120),
});
export const updatePasswordSchema = z
  .object({ password: z.string().min(8), confirmPassword: z.string().min(8) })
  .refine((v) => v.password === v.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
