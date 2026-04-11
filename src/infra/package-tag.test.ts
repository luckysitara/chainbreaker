import { describe, expect, it } from "vitest";
import { normalizePackageTagInput } from "./package-tag.js";

describe("normalizePackageTagInput", () => {
  const packageNames = ["chainbreaker", "@chainbreaker/plugin"] as const;

  it.each([
    { input: undefined, expected: null },
    { input: "   ", expected: null },
    { input: "chainbreaker@beta", expected: "beta" },
    { input: "@chainbreaker/plugin@2026.2.24", expected: "2026.2.24" },
    { input: "chainbreaker@   ", expected: null },
    { input: "chainbreaker", expected: null },
    { input: " @chainbreaker/plugin ", expected: null },
    { input: " latest ", expected: "latest" },
    { input: "@other/plugin@beta", expected: "@other/plugin@beta" },
    { input: "chainbreakerer@beta", expected: "chainbreakerer@beta" },
  ] satisfies ReadonlyArray<{ input: string | undefined; expected: string | null }>)(
    "normalizes %j",
    ({ input, expected }) => {
      expect(normalizePackageTagInput(input, packageNames)).toBe(expected);
    },
  );
});
