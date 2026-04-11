import { describe, expect, it } from "vitest";
import {
  findChannelAgnosticBoundaryViolations,
  findAcpUserFacingChannelNameViolations,
  findChannelCoreReverseDependencyViolations,
  findSystemMarkLiteralViolations,
} from "../../scripts/check-channel-agnostic-boundaries.mjs";

describe("check-channel-agnostic-boundaries", () => {
  it("flags direct channel module imports", () => {
    const source = `
      const x = 1;
    `;
    expect(findChannelAgnosticBoundaryViolations(source)).toEqual([
      {
      },
    ]);
  });

  it("flags channel config path access", () => {
    const source = `
    `;
    expect(findChannelAgnosticBoundaryViolations(source)).toEqual([
      {
      },
    ]);
  });

  it("flags channel-literal comparisons", () => {
    const source = `
        return true;
      }
    `;
    expect(findChannelAgnosticBoundaryViolations(source)).toEqual([
      {
      },
    ]);
  });

  it("flags object literals with explicit channel ids", () => {
    const source = `
      const payload = { channel: "telegram" };
    `;
    expect(findChannelAgnosticBoundaryViolations(source)).toEqual([
      {
        reason: 'assigns channel id literal to "channel" ("telegram")',
      },
    ]);
  });

  it("ignores non-channel literals and unrelated text", () => {
    const source = `
      const payload = { mode: "persistent" };
      const x = cfg.session.threadBindings?.enabled;
    `;
    expect(findChannelAgnosticBoundaryViolations(source)).toEqual([]);
  });

  it("reverse-deps mode flags channel module re-exports", () => {
    const source = `
    `;
    expect(findChannelCoreReverseDependencyViolations(source)).toEqual([
      {
      },
    ]);
  });

  it("reverse-deps mode ignores channel literals when no imports are present", () => {
    const source = `
    `;
    expect(findChannelCoreReverseDependencyViolations(source)).toEqual([]);
  });

  it("user-facing text mode flags channel names in string literals", () => {
    const source = `
      const message = "Bind a Discord thread first.";
    `;
    expect(findAcpUserFacingChannelNameViolations(source)).toEqual([
      {
        reason: 'user-facing text references channel name ("Bind a Discord thread first.")',
      },
    ]);
  });

  it("user-facing text mode ignores channel names in import specifiers", () => {
    const source = `
    `;
    expect(findAcpUserFacingChannelNameViolations(source)).toEqual([]);
  });

  it("system-mark guard flags hardcoded gear literals", () => {
    const source = `
    `;
    expect(findSystemMarkLiteralViolations(source)).toEqual([
      {
        reason: 'hardcoded system mark literal ("⚙️ Thread bindings enabled.")',
      },
    ]);
  });

  it("system-mark guard ignores module import specifiers", () => {
    const source = `
      import { x } from "../infra/system-message.js";
    `;
    expect(findSystemMarkLiteralViolations(source)).toEqual([]);
  });
});
