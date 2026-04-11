import { describe, expect, it } from "vitest";
import { collectEmptyAllowlistPolicyWarningsForAccount } from "./empty-allowlist-policy.js";

describe("doctor empty allowlist policy warnings", () => {
  it("warns when dm allowlist mode has no allowFrom entries", () => {
    const warnings = collectEmptyAllowlistPolicyWarningsForAccount({
      account: { dmPolicy: "allowlist" },
      doctorFixCommand: "chainbreaker doctor --fix",
    });

    expect(warnings).toEqual([
    ]);
  });

  it("warns when non-telegram group allowlist mode does not fall back to allowFrom", () => {
    const warnings = collectEmptyAllowlistPolicyWarningsForAccount({
      account: { groupPolicy: "allowlist" },
      doctorFixCommand: "chainbreaker doctor --fix",
    });

    expect(warnings).toEqual([
      expect.stringContaining("this channel does not fall back to allowFrom"),
    ]);
  });

  it("stays quiet for zalouser hybrid route-and-sender group access", () => {
    const warnings = collectEmptyAllowlistPolicyWarningsForAccount({
      account: { groupPolicy: "allowlist" },
      channelName: "zalouser",
      doctorFixCommand: "chainbreaker doctor --fix",
      prefix: "channels.zalouser",
    });

    expect(warnings).toEqual([]);
  });

  it("stays quiet for channels that do not use sender-based group allowlists", () => {
    const warnings = collectEmptyAllowlistPolicyWarningsForAccount({
      account: { groupPolicy: "allowlist" },
      doctorFixCommand: "chainbreaker doctor --fix",
    });

    expect(warnings).toEqual([]);
  });
});
