import { describe, expect, it } from "vitest";
import { resolveNativeCommandSessionTargets } from "./native-command-session-targets.js";

describe("resolveNativeCommandSessionTargets", () => {
  it("uses the bound session for both targets when present", () => {
    expect(
      resolveNativeCommandSessionTargets({
        agentId: "codex",
        userId: "user-1",
      }),
    ).toEqual({
    });
  });

  it("falls back to the routed session target when unbound", () => {
    expect(
      resolveNativeCommandSessionTargets({
        agentId: "qwen",
        sessionPrefix: "telegram:slash",
        userId: "user-1",
        targetSessionKey: "agent:qwen:telegram:direct:user-1",
      }),
    ).toEqual({
      sessionKey: "agent:qwen:telegram:slash:user-1",
      commandTargetSessionKey: "agent:qwen:telegram:direct:user-1",
    });
  });

  it("supports lowercase session keys for providers that already normalize", () => {
    expect(
      resolveNativeCommandSessionTargets({
        agentId: "Qwen",
        sessionPrefix: "Slack:Slash",
        userId: "U123",
        lowercaseSessionKey: true,
      }),
    ).toEqual({
    });
  });
});
