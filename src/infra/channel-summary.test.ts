import { afterEach, describe, expect, it } from "vitest";
import type { ChannelPlugin } from "../channels/plugins/types.js";
import { setActivePluginRegistry } from "../plugins/runtime.js";
import { createTestRegistry } from "../test-utils/channel-plugins.js";
import { buildChannelSummary } from "./channel-summary.js";

function makeSlackHttpSummaryPlugin(): ChannelPlugin {
  return {
    meta: {
      label: "Slack",
      selectionLabel: "Slack",
      blurb: "test",
    },
    capabilities: { chatTypes: ["direct"] },
    config: {
      listAccountIds: () => ["primary"],
      defaultAccountId: () => "primary",
      inspectAccount: (cfg) =>
        (cfg as { marker?: string }).marker === "source"
          ? {
              accountId: "primary",
              name: "Primary",
              enabled: true,
              configured: true,
              mode: "http",
              botToken: "xoxb-http",
              signingSecret: "",
              botTokenSource: "config",
              signingSecretSource: "config", // pragma: allowlist secret
              botTokenStatus: "available",
              signingSecretStatus: "configured_unavailable", // pragma: allowlist secret
            }
          : {
              accountId: "primary",
              name: "Primary",
              enabled: true,
              configured: false,
              mode: "http",
              botToken: "xoxb-http",
              botTokenSource: "config",
              botTokenStatus: "available",
            },
      resolveAccount: () => ({
        accountId: "primary",
        name: "Primary",
        enabled: true,
        configured: false,
        mode: "http",
        botToken: "xoxb-http",
        botTokenSource: "config",
        botTokenStatus: "available",
      }),
      isConfigured: (account) => Boolean((account as { configured?: boolean }).configured),
      isEnabled: () => true,
    },
    actions: {
      describeMessageTool: () => ({ actions: ["send"] }),
    },
  };
}

function makeTelegramSummaryPlugin(params: {
  enabled: boolean;
  configured: boolean;
  linked?: boolean;
  authAgeMs?: number;
  allowFrom?: string[];
}): ChannelPlugin {
  return {
    id: "telegram",
    meta: {
      id: "telegram",
      label: "Telegram",
      selectionLabel: "Telegram",
      docsPath: "/channels/telegram",
      blurb: "test",
    },
    capabilities: { chatTypes: ["direct"] },
    config: {
      listAccountIds: () => ["primary"],
      defaultAccountId: () => "primary",
      inspectAccount: () => ({
        accountId: "primary",
        name: "Main Bot",
        enabled: params.enabled,
        configured: params.configured,
        linked: params.linked,
        allowFrom: params.allowFrom ?? [],
        dmPolicy: "mutuals",
        tokenSource: "env",
      }),
      resolveAccount: () => ({
        accountId: "primary",
        name: "Main Bot",
        enabled: params.enabled,
        configured: params.configured,
        linked: params.linked,
        allowFrom: params.allowFrom ?? [],
        dmPolicy: "mutuals",
        tokenSource: "env",
      }),
      isConfigured: (account) => Boolean((account as { configured?: boolean }).configured),
      isEnabled: (account) => Boolean((account as { enabled?: boolean }).enabled),
      formatAllowFrom: () => ["alice", "bob", "carol"],
    },
    status: {
      buildChannelSummary: async () => ({
        linked: params.linked,
        configured: params.configured,
        authAgeMs: params.authAgeMs,
        self: { e164: "+15551234567" },
      }),
    },
    actions: {
      describeMessageTool: () => ({ actions: ["send"] }),
    },
  };
}

function makeSignalSummaryPlugin(params: { enabled: boolean; configured: boolean }): ChannelPlugin {
  return {
    meta: {
      label: "Signal",
      selectionLabel: "Signal",
      blurb: "test",
    },
    capabilities: { chatTypes: ["direct"] },
    config: {
      listAccountIds: () => ["desktop"],
      defaultAccountId: () => "desktop",
      inspectAccount: () => ({
        accountId: "desktop",
        name: "Desktop",
        enabled: params.enabled,
        configured: params.configured,
        appTokenSource: "env",
        port: 31337,
      }),
      resolveAccount: () => ({
        accountId: "desktop",
        name: "Desktop",
        enabled: params.enabled,
        configured: params.configured,
        appTokenSource: "env",
        port: 31337,
      }),
      isConfigured: (account) => Boolean((account as { configured?: boolean }).configured),
      isEnabled: (account) => Boolean((account as { enabled?: boolean }).enabled),
    },
    actions: {
      describeMessageTool: () => ({ actions: ["send"] }),
    },
  };
}

function makeFallbackSummaryPlugin(params: {
  configured: boolean;
  enabled: boolean;
  accountIds?: string[];
  defaultAccountId?: string;
}): ChannelPlugin {
  return {
    id: "fallback-plugin",
    meta: {
      id: "fallback-plugin",
      label: "Fallback",
      selectionLabel: "Fallback",
      docsPath: "/channels/fallback",
      blurb: "test",
    },
    capabilities: { chatTypes: ["direct"] },
    config: {
      listAccountIds: () => params.accountIds ?? [],
      defaultAccountId: () => params.defaultAccountId ?? "default",
      inspectAccount: (_cfg, accountId) => ({
        accountId,
        enabled: params.enabled,
        configured: params.configured,
      }),
      resolveAccount: (_cfg, accountId) => ({
        accountId,
        enabled: params.enabled,
        configured: params.configured,
      }),
      isConfigured: (account) => Boolean((account as { configured?: boolean }).configured),
      isEnabled: (account) => Boolean((account as { enabled?: boolean }).enabled),
    },
    actions: {
      describeMessageTool: () => ({ actions: ["send"] }),
    },
  };
}

describe("buildChannelSummary", () => {
  afterEach(() => {
    setActivePluginRegistry(createTestRegistry([]));
  });

  it("preserves Slack HTTP signing-secret unavailable state from source config", async () => {
    setActivePluginRegistry(
      createTestRegistry([
      ]),
    );

      colorize: false,
      includeAllowFrom: false,
      sourceConfig: { marker: "source", channels: {} } as never,
    });

      "  - primary (Primary) (bot:config, signing:config, secret unavailable in this command path)",
    );
  });

    setActivePluginRegistry(
      createTestRegistry([
        {
          pluginId: "telegram",
          plugin: makeTelegramSummaryPlugin({ enabled: false, configured: false }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: true,
    });

  });

  it("includes linked summary metadata and truncates allow-from details", async () => {
    setActivePluginRegistry(
      createTestRegistry([
        {
          pluginId: "telegram",
          plugin: makeTelegramSummaryPlugin({
            enabled: true,
            configured: true,
            linked: true,
            authAgeMs: 300_000,
            allowFrom: ["alice", "bob", "carol"],
          }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: true,
    });

  });

  it("shows not-linked status when linked metadata is explicitly false", async () => {
    setActivePluginRegistry(
      createTestRegistry([
        {
          pluginId: "telegram",
          plugin: makeTelegramSummaryPlugin({
            enabled: true,
            configured: true,
            linked: false,
          }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: false,
    });

  });

    setActivePluginRegistry(
      createTestRegistry([
        {
          plugin: makeSignalSummaryPlugin({ enabled: false, configured: true }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: false,
    });

      "Signal: disabled",
    ]);
  });

  it("uses the channel label and default account id when no accounts exist", async () => {
    setActivePluginRegistry(
      createTestRegistry([
        {
          pluginId: "fallback-plugin",
          plugin: makeFallbackSummaryPlugin({
            enabled: true,
            configured: true,
            accountIds: [],
            defaultAccountId: "fallback-account",
          }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: false,
    });

  });

  it("shows not-configured status when enabled accounts exist without configured ones", async () => {
    setActivePluginRegistry(
      createTestRegistry([
        {
          pluginId: "fallback-plugin",
          plugin: makeFallbackSummaryPlugin({
            enabled: true,
            configured: false,
            accountIds: ["fallback-account"],
          }),
          source: "test",
        },
      ]),
    );

      colorize: false,
      includeAllowFrom: false,
    });

  });
});
