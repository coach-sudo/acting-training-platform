import { describe, expect, it } from "vitest";
import { sessionSchema, studentSchema } from "./continuity";
describe("continuity validation", () => {
  it("accepts a student without an account", () =>
    expect(
      studentSchema.safeParse({
        firstName: "Maya",
        lastName: "Chen",
        preferredName: "",
        email: "",
        pronouns: "",
        generalContext: "",
      }).success,
    ).toBe(true));
  it("requires exactly one typed session target", () =>
    expect(
      sessionSchema.safeParse({
        title: "Scene work",
        sessionDate: "2026-08-18",
        durationMinutes: 60,
        targetType: "student",
        targetId: "d9428888-122b-11e1-b85c-61cd3cbb3210",
      }).success,
    ).toBe(true));
});
