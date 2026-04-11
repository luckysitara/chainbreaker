import { describe, expect, it } from "vitest";
import {
  getAgentRuntimeCommandSecretTargetIds,
  getScopedChannelsCommandSecretTargets,
  getSecurityAuditCommandSecretTargetIds,
} from "./command-secret-targets.js";

describe("command secret target ids", () => {
  it("includes memorySearch remote targets for agent runtime commands", () => {
    const ids = getAgentRuntimeCommandSecretTargetIds();
    expect(ids.has("agents.defaults.memorySearch.remote.apiKey")).toBe(true);
    expect(ids.has("agents.list[].memorySearch.remote.apiKey")).toBe(true);
    expect(ids.has("tools.web.fetch.firecrawl.apiKey")).toBe(true);
    expect(ids.has("tools.web.x_search.apiKey")).toBe(true);
  });

  it("includes gateway auth and channel targets for security audit", () => {
    const ids = getSecurityAuditCommandSecretTargetIds();
    expect(ids.has("gateway.auth.token")).toBe(true);
    expect(ids.has("gateway.auth.password")).toBe(true);
    expect(ids.has("gateway.remote.token")).toBe(true);
    expect(ids.has("gateway.remote.password")).toBe(true);
  });

  it("scopes channel targets to the requested channel", () => {
    const scoped = getScopedChannelsCommandSecretTargets({
      config: {} as never,
    });

    expect(scoped.targetIds.size).toBeGreaterThan(0);
    expect([...scoped.targetIds].some((id) => id.startsWith("channels.telegram."))).toBe(false);
  });

  it("does not coerce missing accountId to default when channel is scoped", () => {
    const scoped = getScopedChannelsCommandSecretTargets({
      config: {
        channels: {
            defaultAccount: "ops",
            accounts: {
              ops: {
                token: { source: "env", provider: "default", id: "DISCORD_OPS" },
              },
            },
          },
        },
      } as never,
    });

    expect(scoped.allowedPaths).toBeUndefined();
    expect(scoped.targetIds.size).toBeGreaterThan(0);
  });

  it("scopes allowed paths to channel globals + selected account", () => {
    const scoped = getScopedChannelsCommandSecretTargets({
      config: {
        channels: {
            token: { source: "env", provider: "default", id: "DISCORD_DEFAULT" },
            accounts: {
              ops: {
                token: { source: "env", provider: "default", id: "DISCORD_OPS" },
              },
              chat: {
                token: { source: "env", provider: "default", id: "DISCORD_CHAT" },
              },
            },
          },
        },
      } as never,
      accountId: "ops",
    });

    expect(scoped.allowedPaths).toBeDefined();
  });

  it("keeps account-scoped allowedPaths as an empty set when scoped target paths are absent", () => {
    const scoped = getScopedChannelsCommandSecretTargets({
      config: {
        channels: {
            accounts: {
              ops: { enabled: true },
            },
          },
        },
      } as never,
      channel: "custom-plugin-channel-without-secret-targets",
      accountId: "ops",
    });

    expect(scoped.allowedPaths).toBeDefined();
    expect(scoped.allowedPaths?.size).toBe(0);
  });
});
