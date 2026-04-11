import { describe, expect, it } from "vitest";
import {
  collectOpenPolicyAllowFromWarnings,
  maybeRepairOpenPolicyAllowFrom,
} from "./open-policy-allowfrom.js";

describe("doctor open-policy allowFrom repair", () => {
  it('adds top-level wildcard when dmPolicy="open" has no allowFrom', () => {
    const result = maybeRepairOpenPolicyAllowFrom({
      channels: {
          dmPolicy: "open",
        },
      },
    });

    expect(result.changes).toEqual([
    ]);
  });

  it("repairs nested-only googlechat dm allowFrom", () => {
    const result = maybeRepairOpenPolicyAllowFrom({
      channels: {
        googlechat: {
          dm: {
            policy: "open",
          },
        },
      },
    });

    expect(result.changes).toEqual([
      '- channels.googlechat.dm.allowFrom: set to ["*"] (required by dmPolicy="open")',
    ]);
    expect(result.config.channels?.googlechat?.dm?.allowFrom).toEqual(["*"]);
  });

    const result = maybeRepairOpenPolicyAllowFrom({
      channels: {
          dm: {
            policy: "open",
          },
        },
      },
    });

    expect(result.changes).toEqual([
    ]);
  });

    const result = maybeRepairOpenPolicyAllowFrom({
      channels: {
          dm: {
            policy: "open",
            allowFrom: ["123"],
          },
        },
      },
    });

    expect(result.changes).toEqual([
    ]);
  });

  it("formats open-policy wildcard warnings", () => {
    const warnings = collectOpenPolicyAllowFromWarnings({
      doctorFixCommand: "chainbreaker doctor --fix",
    });

    expect(warnings).toEqual([
      expect.stringContaining('Run "chainbreaker doctor --fix"'),
    ]);
  });
});
