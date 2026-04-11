import type { ChannelPlugin } from "../../channels/plugins/types.js";
import type { ChainbreakerConfig } from "../../config/config.js";
import {
  buildChannelOutboundSessionRoute,
} from "../../plugin-sdk/core.js";
import {
  buildOutboundBaseSessionKey,
  normalizeOutboundThreadId,
  resolveThreadSessionKeys,
  type RoutePeer,
} from "../../plugin-sdk/routing.js";
import { setActivePluginRegistry } from "../../plugins/runtime.js";
import {
  createChannelTestPluginBase,
  createTestRegistry,
} from "../../test-utils/channel-plugins.js";

function createSessionRouteTestPlugin(params: {
  id: ChannelPlugin["id"];
  label: string;
  resolveOutboundSessionRoute: (
    params: import("../../plugin-sdk/core.js").ChannelOutboundSessionRouteParams,
  ) => Awaited<
    ReturnType<NonNullable<NonNullable<ChannelPlugin["messaging"]>["resolveOutboundSessionRoute"]>>
  >;
}): ChannelPlugin {
  return {
    ...createChannelTestPluginBase({
      id: params.id,
      label: params.label,
      capabilities: { chatTypes: ["direct", "group", "channel"] },
    }),
    messaging: {
      resolveOutboundSessionRoute: params.resolveOutboundSessionRoute,
    },
  };
}

function buildThreadedChannelRoute(params: {
  cfg: ChainbreakerConfig;
  agentId: string;
  channel: string;
  accountId?: string | null;
  peer: RoutePeer;
  chatType: "direct" | "group" | "channel";
  from: string;
  to: string;
  threadId?: string | number;
  useSuffix?: boolean;
}) {
  const baseSessionKey = buildOutboundBaseSessionKey({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: params.channel,
    accountId: params.accountId,
    peer: params.peer,
  });
  const normalizedThreadId = normalizeOutboundThreadId(params.threadId);
  const threadKeys = resolveThreadSessionKeys({
    baseSessionKey,
    threadId: normalizedThreadId,
    useSuffix: params.useSuffix,
  });
  return {
    sessionKey: threadKeys.sessionKey,
    baseSessionKey,
    peer: params.peer,
    chatType: params.chatType,
    from: params.from,
    to: params.to,
    ...(normalizedThreadId !== undefined ? { threadId: params.threadId } : {}),
  };
}

function parseTelegramTargetForTest(raw: string): {
  chatId: string;
  messageThreadId?: number;
  chatType: "direct" | "group" | "unknown";
} {
  const trimmed = raw
    .trim()
    .replace(/^telegram:/i, "")
    .replace(/^tg:/i, "")
    .replace(/^group:/i, "");
  const prefixedTopic = /^([^:]+):topic:(\d+)$/i.exec(trimmed);
  if (prefixedTopic) {
    const chatId = prefixedTopic[1];
    return {
      chatId,
      messageThreadId: Number.parseInt(prefixedTopic[2], 10),
      chatType: chatId.startsWith("-") ? "group" : "direct",
    };
  }
  return {
    chatId: trimmed,
    chatType: trimmed.startsWith("-") ? "group" : trimmed.startsWith("@") ? "unknown" : "direct",
  };
}

function parseTelegramThreadIdForTest(threadId?: string | number | null): number | undefined {
  const normalized = normalizeOutboundThreadId(threadId);
  if (!normalized) {
    return undefined;
  }
  const topicMatch = /(?:^|:topic:|:)(\d+)$/i.exec(normalized);
  if (!topicMatch) {
    return undefined;
  }
  return Number.parseInt(topicMatch[1], 10);
}

function buildTelegramGroupPeerIdForTest(chatId: string, messageThreadId?: number): string {
  return messageThreadId ? `${chatId}:topic:${messageThreadId}` : chatId;
}

function resolveTelegramOutboundSessionRouteForTest(params: import("../../plugin-sdk/core.js").ChannelOutboundSessionRouteParams) {
  const parsed = parseTelegramTargetForTest(params.target);
  const chatId = parsed.chatId.trim();
  if (!chatId) {
    return null;
  }
  const resolvedThreadId = parsed.messageThreadId ?? parseTelegramThreadIdForTest(params.threadId);
  const isGroup =
    parsed.chatType === "group" ||
    (parsed.chatType === "unknown" &&
      params.resolvedTarget?.kind !== undefined &&
      params.resolvedTarget.kind !== "user");
  const peerId =
    isGroup && resolvedThreadId
      ? buildTelegramGroupPeerIdForTest(chatId, resolvedThreadId)
      : chatId;
  const peer: RoutePeer = {
    kind: isGroup ? "group" : "direct",
    id: peerId,
  };
  if (isGroup) {
    return buildChannelOutboundSessionRoute({
      cfg: params.cfg,
      agentId: params.agentId,
      channel: "telegram",
      accountId: params.accountId,
      peer,
      chatType: "group",
      from: `telegram:group:${peerId}`,
      to: `telegram:${chatId}`,
      ...(resolvedThreadId !== undefined ? { threadId: resolvedThreadId } : {}),
    });
  }
  return buildThreadedChannelRoute({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: "telegram",
    accountId: params.accountId,
    peer,
    chatType: "direct",
    from:
      resolvedThreadId !== undefined
        ? `telegram:${chatId}:topic:${resolvedThreadId}`
        : `telegram:${chatId}`,
    to: `telegram:${chatId}`,
    threadId: resolvedThreadId,
  });
}

function resolveWhatsAppOutboundSessionRouteForTest(params: import("../../plugin-sdk/core.js").ChannelOutboundSessionRouteParams) {
  const normalized = params.target.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  const isGroup = normalized.endsWith("@g.us");
  return buildChannelOutboundSessionRoute({
    cfg: params.cfg,
    agentId: params.agentId,
    channel: "whatsapp",
    accountId: params.accountId,
    peer: { kind: isGroup ? "group" : "direct", id: normalized },
    chatType: isGroup ? "group" : "direct",
    from: normalized,
    to: normalized,
  });
}

export function setMinimalOutboundSessionPluginRegistryForTests(): void {
  const plugins: ChannelPlugin[] = [
    createSessionRouteTestPlugin({
      id: "whatsapp",
      label: "WhatsApp",
      resolveOutboundSessionRoute: resolveWhatsAppOutboundSessionRouteForTest,
    }),
    createSessionRouteTestPlugin({
      id: "telegram",
      label: "Telegram",
      resolveOutboundSessionRoute: resolveTelegramOutboundSessionRouteForTest,
    }),
  ];
  setActivePluginRegistry(
    createTestRegistry(
      plugins.map((plugin) => ({
        pluginId: plugin.id as string,
        plugin,
        source: "test",
      })),
    ),
  );
}
