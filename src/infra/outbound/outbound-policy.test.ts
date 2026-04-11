import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { vi } from "vitest";
import type { ChannelMessageActionName } from "../../channels/plugins/types.js";
import type { ChainbreakerConfig } from "../../config/config.js";

let applyCrossContextDecoration: typeof import("./outbound-policy.js").applyCrossContextDecoration;
let buildCrossContextDecoration: typeof import("./outbound-policy.js").buildCrossContextDecoration;
let enforceCrossContextPolicy: typeof import("./outbound-policy.js").enforceCrossContextPolicy;
let shouldApplyCrossContextMarker: typeof import("./outbound-policy.js").shouldApplyCrossContextMarker;

const mocks = vi.hoisted(() => ({
  getChannelMessageAdapter: vi.fn(() => ({ supportsComponentsV2: false })),
  normalizeTargetForProvider: vi.fn((_channel: string, raw: string) => {
    const trimmed = raw.trim();
    return trimmed || undefined;
  }),
  lookupDirectoryDisplay: vi.fn(async ({ targetId }: { targetId: string }) =>
    targetId.replace(/^#/, ""),
  ),
  formatTargetDisplay: vi.fn(
    ({ target, display }: { target: string; display?: string }) => display ?? target,
  ),
}));

vi.mock("./channel-adapters.js", () => ({
  getChannelMessageAdapter: mocks.getChannelMessageAdapter,
}));

vi.mock("./target-normalization.js", () => ({
  normalizeTargetForProvider: mocks.normalizeTargetForProvider,
}));

vi.mock("./target-resolver.js", () => ({
  formatTargetDisplay: mocks.formatTargetDisplay,
  lookupDirectoryDisplay: mocks.lookupDirectoryDisplay,
}));

const telegramConfig = {
  channels: {
    telegram: {
      botToken: "123:abc",
    },
  },
} as ChainbreakerConfig;

function expectCrossContextPolicyResult(params: {
  cfg: ChainbreakerConfig;
  channel: string;
  action: "send" | "upload-file";
  to: string;
  currentChannelId: string;
  currentChannelProvider: string;
  expected: "allow" | RegExp;
}) {
  const run = () =>
    enforceCrossContextPolicy({
      cfg: params.cfg,
      channel: params.channel,
      action: params.action,
      args: { to: params.to },
      toolContext: {
        currentChannelId: params.currentChannelId,
        currentChannelProvider: params.currentChannelProvider,
      },
    });
  if (params.expected === "allow") {
    expect(run).not.toThrow();
    return;
  }
  expect(run).toThrow(params.expected);
}

describe("outbound policy helpers", () => {
  beforeAll(async () => {
    ({
      applyCrossContextDecoration,
      buildCrossContextDecoration,
      enforceCrossContextPolicy,
      shouldApplyCrossContextMarker,
    } = await import("./outbound-policy.js"));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    {
      cfg: {
        ...telegramConfig,
        tools: {
          message: { crossContext: { allowAcrossProviders: true } },
        },
      } as ChainbreakerConfig,
      channel: "whatsapp",
      action: "send" as const,
      to: "whatsapp:+15550001111",
      currentChannelId: "12345",
      currentChannelProvider: "telegram",
      expected: "allow" as const,
    },
    {
      cfg: telegramConfig,
      channel: "whatsapp",
      action: "send" as const,
      to: "whatsapp:+15550001111",
      currentChannelId: "12345",
      currentChannelProvider: "telegram",
      expected: /target provider "whatsapp" while bound to "telegram"/,
    },
  ])("enforces cross-context policy for %j", (params) => {
    expectCrossContextPolicyResult(params);
  });

  it("returns null when decoration is skipped and falls back to text markers", async () => {
    await expect(
      buildCrossContextDecoration({
        cfg: telegramConfig,
        channel: "telegram",
        target: "123",
        toolContext: {
          currentChannelId: "12345",
          currentChannelProvider: "telegram",
          skipCrossContextDecoration: true,
        },
      }),
    ).resolves.toBeNull();

    const applied = applyCrossContextDecoration({
      message: "hello",
      decoration: { prefix: "[from ops] ", suffix: " [cc]" },
      preferComponents: true,
    });
    expect(applied).toEqual({
      message: "[from ops] hello [cc]",
      usedComponents: false,
    });
  });

  it.each([
    { action: "send", expected: true },
    { action: "upload-file", expected: true },
    { action: "thread-reply", expected: true },
    { action: "thread-create", expected: false },
  ] satisfies Array<{ action: ChannelMessageActionName; expected: boolean }>)(
    "marks supported cross-context action %j",
    ({ action, expected }) => {
      expect(shouldApplyCrossContextMarker(action)).toBe(expected);
    },
  );
});
