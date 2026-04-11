import { describe, expect, it } from "vitest";
import type { MsgContext } from "../../auto-reply/templating.js";
import { normalizeExplicitSessionKey } from "./explicit-session-key-normalization.js";

function makeCtx(overrides: Partial<MsgContext>): MsgContext {
  return {
    Body: "",
    From: "",
    To: "",
    ...overrides,
  } as MsgContext;
}

describe("normalizeExplicitSessionKey", () => {
    expect(
      normalizeExplicitSessionKey(
        makeCtx({
          ChatType: "direct",
          SenderId: "123456",
        }),
      ),
  });

  it("infers the provider from From when explicit provider fields are absent", () => {
    expect(
      normalizeExplicitSessionKey(
        makeCtx({
          ChatType: "direct",
          SenderId: "123456",
        }),
      ),
  });

  it("uses Provider when Surface is absent", () => {
    expect(
      normalizeExplicitSessionKey(
        makeCtx({
          Provider: "Discord",
          ChatType: "direct",
          SenderId: "123456",
        }),
      ),
  });

  it("lowercases and passes through unknown providers unchanged", () => {
    expect(
      normalizeExplicitSessionKey(
        "Agent:Fina:Slack:DM:ABC",
        makeCtx({
        }),
      ),
  });
});
