import { describe, expect, it } from "vitest";
import {
  resolveAcpSessionCwd,
  resolveAcpSessionIdentifierLinesFromIdentity,
  resolveAcpThreadSessionDetailLines,
} from "./session-identifiers.js";

describe("session identifier helpers", () => {
  it("hides unresolved identifiers from thread intro details while pending", () => {
      sessionKey: "agent:codex:acp:pending-1",
      meta: {
        backend: "acpx",
        agent: "codex",
        runtimeSessionName: "runtime-1",
        identity: {
          state: "pending",
          source: "ensure",
          lastUpdatedAt: Date.now(),
          acpxSessionId: "acpx-123",
          agentSessionId: "inner-123",
        },
        mode: "persistent",
        state: "idle",
        lastActivityAt: Date.now(),
      },
    });

  });

  it("adds a Codex resume hint when agent identity is resolved", () => {
      sessionKey: "agent:codex:acp:resolved-1",
      meta: {
        backend: "acpx",
        agent: "codex",
        runtimeSessionName: "runtime-1",
        identity: {
          state: "resolved",
          source: "status",
          lastUpdatedAt: Date.now(),
          acpxSessionId: "acpx-123",
          agentSessionId: "inner-123",
        },
        mode: "persistent",
        state: "idle",
        lastActivityAt: Date.now(),
      },
    });

      "resume in Codex CLI: `codex resume inner-123` (continues this conversation).",
    );
  });

  it("adds a Kimi resume hint when agent identity is resolved", () => {
      sessionKey: "agent:kimi:acp:resolved-1",
      meta: {
        backend: "acpx",
        agent: "kimi",
        runtimeSessionName: "runtime-1",
        identity: {
          state: "resolved",
          source: "status",
          lastUpdatedAt: Date.now(),
          acpxSessionId: "acpx-kimi-123",
          agentSessionId: "kimi-inner-123",
        },
        mode: "persistent",
        state: "idle",
        lastActivityAt: Date.now(),
      },
    });

      "resume in Kimi CLI: `kimi resume kimi-inner-123` (continues this conversation).",
    );
  });

  it("shows pending identity text for status rendering", () => {
      backend: "acpx",
      mode: "status",
      identity: {
        state: "pending",
        source: "status",
        lastUpdatedAt: Date.now(),
        agentSessionId: "inner-123",
      },
    });

  });

  it("prefers runtimeOptions.cwd over legacy meta.cwd", () => {
    const cwd = resolveAcpSessionCwd({
      backend: "acpx",
      agent: "codex",
      runtimeSessionName: "runtime-1",
      mode: "persistent",
      runtimeOptions: {
        cwd: "/repo/new",
      },
      cwd: "/repo/old",
      state: "idle",
      lastActivityAt: Date.now(),
    });
    expect(cwd).toBe("/repo/new");
  });
});
