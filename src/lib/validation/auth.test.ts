import { describe, expect, it } from "vitest";
import { credentialsSchema } from "./auth";
describe("credentials", () => {
  it("accepts valid input", () =>
    expect(
      credentialsSchema.safeParse({
        email: "coach@example.com",
        password: "long-enough",
      }).success,
    ).toBe(true));
  it("rejects short passwords", () =>
    expect(
      credentialsSchema.safeParse({
        email: "coach@example.com",
        password: "short",
      }).success,
    ).toBe(false));
});
