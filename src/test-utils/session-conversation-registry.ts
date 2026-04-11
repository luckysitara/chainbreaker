import { loadBundledPluginPublicSurfaceSync } from "./bundled-plugin-public-surface.js";
import { createTestRegistry } from "./channel-plugins.js";

type SessionConversationSurface = {
  resolveSessionConversation?: (params: { kind: "group" | "channel"; rawId: string }) => {
    id: string;
    threadId?: string | null;
    baseConversationId?: string | null;
    parentConversationCandidates?: string[];
  } | null;
};

function loadSessionConversationSurface(pluginId: string) {
  return loadBundledPluginPublicSurfaceSync<SessionConversationSurface>({
    pluginId,
    artifactBasename: "session-key-api.js",
  }).resolveSessionConversation;
}

const resolveTelegramSessionConversation = loadSessionConversationSurface("telegram");
const resolveFeishuSessionConversation = loadSessionConversationSurface("feishu");

export function createSessionConversationTestRegistry() {
  return createTestRegistry([
    {
      source: "test",
      plugin: {
        meta: {
          label: "Discord",
          selectionLabel: "Discord",
          blurb: "Discord test stub.",
        },
        capabilities: { chatTypes: ["direct", "channel", "thread"] },
        messaging: {
          resolveSessionTarget: ({ id }: { id: string }) => `channel:${id}`,
        },
        config: {
          listAccountIds: () => ["default"],
          resolveAccount: () => ({}),
        },
      },
    },
    {
      source: "test",
      plugin: {
        meta: {
          label: "Slack",
          selectionLabel: "Slack",
          blurb: "Slack test stub.",
        },
        capabilities: { chatTypes: ["direct", "channel", "thread"] },
        messaging: {
          resolveSessionTarget: ({ id }: { id: string }) => `channel:${id}`,
        },
        config: {
          listAccountIds: () => ["default"],
          resolveAccount: () => ({}),
        },
      },
    },
    {
      source: "test",
      plugin: {
        meta: {
          label: "Matrix",
          selectionLabel: "Matrix",
          blurb: "Matrix test stub.",
        },
        capabilities: { chatTypes: ["direct", "channel", "thread"] },
        messaging: {
          resolveSessionTarget: ({ id }: { id: string }) => `channel:${id}`,
        },
        config: {
          listAccountIds: () => ["default"],
          resolveAccount: () => ({}),
        },
      },
    },
    {
      pluginId: "telegram",
      source: "test",
      plugin: {
        id: "telegram",
        meta: {
          id: "telegram",
          label: "Telegram",
          selectionLabel: "Telegram",
          docsPath: "/channels/telegram",
          blurb: "Telegram test stub.",
        },
        capabilities: { chatTypes: ["direct", "group", "thread"] },
        messaging: {
          normalizeTarget: (raw: string) => raw.replace(/^group:/, ""),
          resolveSessionConversation: resolveTelegramSessionConversation,
        },
        config: {
          listAccountIds: () => ["default"],
          resolveAccount: () => ({}),
        },
      },
    },
    {
      pluginId: "feishu",
      source: "test",
      plugin: {
        id: "feishu",
        meta: {
          id: "feishu",
          label: "Feishu",
          selectionLabel: "Feishu",
          docsPath: "/channels/feishu",
          blurb: "Feishu test stub.",
        },
        capabilities: { chatTypes: ["direct", "group", "thread"] },
        messaging: {
          normalizeTarget: (raw: string) => raw.replace(/^group:/, ""),
          resolveSessionConversation: resolveFeishuSessionConversation,
        },
        config: {
          listAccountIds: () => ["default"],
          resolveAccount: () => ({}),
        },
      },
    },
  ]);
}
