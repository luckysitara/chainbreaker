import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  ChannelMessagingAdapter,
  ChannelPlugin,
  ChannelThreadingAdapter,
} from "../../channels/plugins/types.js";
import type { ChainbreakerConfig } from "../../config/config.js";
import { setActivePluginRegistry } from "../../plugins/runtime.js";
import {
  createChannelTestPluginBase,
  createTestRegistry,
} from "../../test-utils/channel-plugins.js";
import { SILENT_REPLY_TOKEN } from "../tokens.js";

const mocks = vi.hoisted(() => ({
  deliverOutboundPayloads: vi.fn(),
}));

vi.mock("../../infra/outbound/deliver-runtime.js", async () => {
  const actual = await vi.importActual<typeof import("../../infra/outbound/deliver-runtime.js")>(
    "../../infra/outbound/deliver-runtime.js",
  );
  return {
    ...actual,
    deliverOutboundPayloads: mocks.deliverOutboundPayloads,
  };
});

const { routeReply } = await import("./route-reply.js");

  enableInteractiveReplies: ({ cfg }) =>
      ?.capabilities?.interactiveReplies === true,
  hasStructuredReplyPayload: ({ payload }) => {
    if (typeof blocks === "string") {
      return blocks.trim().length > 0;
    }
    return Array.isArray(blocks) && blocks.length > 0;
  },
};

  resolveReplyTransport: ({ threadId, replyToId }) => ({
    replyToId: replyToId ?? (threadId != null && threadId !== "" ? String(threadId) : undefined),
    threadId: null,
  }),
};

function createChannelPlugin(
  id: ChannelPlugin["id"],
  options: {
    messaging?: ChannelMessagingAdapter;
    threading?: ChannelThreadingAdapter;
    label?: string;
  } = {},
): ChannelPlugin {
  return {
    ...createChannelTestPluginBase({
      id,
      label: options.label ?? String(id),
      config: { listAccountIds: () => [], resolveAccount: () => ({}) },
    }),
    ...(options.messaging ? { messaging: options.messaging } : {}),
    ...(options.threading ? { threading: options.threading } : {}),
  };
}

function expectLastDelivery(
  matcher: Partial<Parameters<(typeof mocks.deliverOutboundPayloads.mock.calls)[number][0]>[0]>,
) {
  expect(mocks.deliverOutboundPayloads).toHaveBeenLastCalledWith(expect.objectContaining(matcher));
}

async function expectSlackNoDelivery(
  payload: Parameters<typeof routeReply>[0]["payload"],
  overrides: Partial<Parameters<typeof routeReply>[0]> = {},
) {
  mocks.deliverOutboundPayloads.mockClear();
  const res = await routeReply({
    payload,
    to: "channel:C123",
    cfg: {} as never,
    ...overrides,
  });
  expect(res.ok).toBe(true);
  expect(mocks.deliverOutboundPayloads).not.toHaveBeenCalled();
  return res;
}

describe("routeReply", () => {
  beforeEach(() => {
    setActivePluginRegistry(
      createTestRegistry([
        {
          source: "test",
        },
        {
            label: "Slack",
          }),
          source: "test",
        },
        {
          pluginId: "telegram",
          plugin: createChannelPlugin("telegram", { label: "Telegram" }),
          source: "test",
        },
        {
          pluginId: "whatsapp",
          plugin: createChannelPlugin("whatsapp", { label: "WhatsApp" }),
          source: "test",
        },
        {
          source: "test",
        },
        {
          source: "test",
        },
        {
          pluginId: "msteams",
          plugin: createChannelPlugin("msteams", { label: "Microsoft Teams" }),
          source: "test",
        },
        {
          pluginId: "mattermost",
          plugin: createChannelPlugin("mattermost", { label: "Mattermost" }),
          source: "test",
        },
      ]),
    );
    mocks.deliverOutboundPayloads.mockReset();
    mocks.deliverOutboundPayloads.mockResolvedValue([]);
  });

  afterEach(() => {
    setActivePluginRegistry(createTestRegistry());
  });

    const controller = new AbortController();
    controller.abort();
    const res = await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      cfg: {} as never,
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("aborted");
    expect(mocks.deliverOutboundPayloads).not.toHaveBeenCalled();
  });

  it("no-ops on empty payload", async () => {
    await expectSlackNoDelivery({});
  });

  it("suppresses reasoning payloads", async () => {
    await expectSlackNoDelivery({ text: "Reasoning:\n_step_", isReasoning: true });
  });

  it("drops silent token payloads", async () => {
    await expectSlackNoDelivery({ text: SILENT_REPLY_TOKEN });
  });

  it("does not drop payloads that merely start with the silent token", async () => {
    const res = await routeReply({
      payload: { text: `${SILENT_REPLY_TOKEN} -- (why am I here?)` },
      to: "channel:C123",
      cfg: {} as never,
    });
    expect(res.ok).toBe(true);
    expectLastDelivery({
      to: "channel:C123",
      payloads: [
        expect.objectContaining({
          text: `${SILENT_REPLY_TOKEN} -- (why am I here?)`,
        }),
      ],
    });
  });

  it("applies responsePrefix when routing", async () => {
    const cfg = {
      messages: { responsePrefix: "[chainbreaker]" },
    } as unknown as ChainbreakerConfig;
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      cfg,
    });
    expectLastDelivery({
      payloads: [expect.objectContaining({ text: "[chainbreaker] hi" })],
    });
  });

  it("routes directive-only Slack replies when interactive replies are enabled", async () => {
    const cfg = {
      channels: {
          capabilities: { interactiveReplies: true },
        },
      },
    } as unknown as ChainbreakerConfig;
    await routeReply({
      to: "channel:C123",
      cfg,
    });
    expectLastDelivery({
      payloads: [
        expect.objectContaining({
          text: undefined,
          interactive: {
            blocks: [
              expect.objectContaining({
                type: "select",
                placeholder: "Choose one",
              }),
            ],
          },
        }),
      ],
    });
  });

  it("does not bypass the empty-reply guard for invalid Slack blocks", async () => {
    await expectSlackNoDelivery({
      text: " ",
      channelData: {
          blocks: " ",
        },
      },
    });
  });

  it("does not derive responsePrefix from agent identity when routing", async () => {
    const cfg = {
      agents: {
        list: [
          {
            id: "rich",
            identity: { name: "Richbot", theme: "lion bot", emoji: "lion" },
          },
        ],
      },
      messages: {},
    } as unknown as ChainbreakerConfig;
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      sessionKey: "agent:rich:main",
      cfg,
    });
    expectLastDelivery({
      payloads: [expect.objectContaining({ text: "hi" })],
    });
  });

  it("uses threadId for Slack when replyToId is missing", async () => {
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      threadId: "456.789",
      cfg: {} as never,
    });
    expectLastDelivery({
      replyToId: "456.789",
      threadId: null,
    });
  });

  it("passes thread id to Telegram sends", async () => {
    await routeReply({
      payload: { text: "hi" },
      channel: "telegram",
      to: "telegram:123",
      threadId: 42,
      cfg: {} as never,
    });
    expectLastDelivery({
      channel: "telegram",
      to: "telegram:123",
      threadId: 42,
    });
  });

  it("formats BTW replies prominently on routed sends", async () => {
    await routeReply({
      payload: { text: "323", btw: { question: "what is 17 * 19?" } },
      to: "channel:C123",
      cfg: {} as never,
    });
    expectLastDelivery({
      payloads: [expect.objectContaining({ text: "BTW\nQuestion: what is 17 * 19?\n\n323" })],
    });
  });

    await routeReply({
      payload: { text: "323", btw: { question: "what is 17 * 19?" } },
      to: "channel:123456",
      cfg: {} as never,
    });
    expectLastDelivery({
      payloads: [expect.objectContaining({ text: "BTW\nQuestion: what is 17 * 19?\n\n323" })],
    });
  });

  it("passes replyToId to Telegram sends", async () => {
    await routeReply({
      payload: { text: "hi", replyToId: "123" },
      channel: "telegram",
      to: "telegram:123",
      cfg: {} as never,
    });
    expectLastDelivery({
      channel: "telegram",
      to: "telegram:123",
      replyToId: "123",
    });
  });

  it("preserves audioAsVoice on routed outbound payloads", async () => {
    await routeReply({
      payload: { text: "voice caption", mediaUrl: "file:///tmp/clip.mp3", audioAsVoice: true },
      to: "channel:C123",
      cfg: {} as never,
    });
    expect(mocks.deliverOutboundPayloads).toHaveBeenCalledTimes(1);
    expectLastDelivery({
      to: "channel:C123",
      payloads: [
        expect.objectContaining({
          text: "voice caption",
          mediaUrl: "file:///tmp/clip.mp3",
          audioAsVoice: true,
        }),
      ],
    });
  });

  it("uses replyToId as threadTs for Slack", async () => {
    await routeReply({
      payload: { text: "hi", replyToId: "1710000000.0001" },
      to: "channel:C123",
      cfg: {} as never,
    });
    expectLastDelivery({
      replyToId: "1710000000.0001",
      threadId: null,
    });
  });

  it("uses threadId as threadTs for Slack when replyToId is missing", async () => {
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      threadId: "1710000000.9999",
      cfg: {} as never,
    });
    expectLastDelivery({
      replyToId: "1710000000.9999",
      threadId: null,
    });
  });

  it("uses threadId as replyToId for Mattermost when replyToId is missing", async () => {
    await routeReply({
      payload: { text: "hi" },
      channel: "mattermost",
      to: "channel:CHAN1",
      threadId: "post-root",
      cfg: {
        channels: {
          mattermost: {
            enabled: true,
            botToken: "test-token",
            baseUrl: "https://chat.example.com",
          },
        },
      } as unknown as ChainbreakerConfig,
    });
    expectLastDelivery({
      channel: "mattermost",
      to: "channel:CHAN1",
      replyToId: "post-root",
      threadId: "post-root",
    });
  });

  it("preserves multiple mediaUrls as a single outbound payload", async () => {
    await routeReply({
      payload: { text: "caption", mediaUrls: ["a", "b"] },
      to: "channel:C123",
      cfg: {} as never,
    });
    expectLastDelivery({
      payloads: [
        expect.objectContaining({
          text: "caption",
          mediaUrls: ["a", "b"],
        }),
      ],
    });
  });

  it("routes WhatsApp with the account id intact", async () => {
    await routeReply({
      payload: { text: "hi" },
      channel: "whatsapp",
      to: "+15551234567",
      accountId: "acc-1",
      cfg: {} as never,
    });
    expectLastDelivery({
      channel: "whatsapp",
      to: "+15551234567",
      accountId: "acc-1",
    });
  });

  it("routes MS Teams via outbound delivery", async () => {
    const cfg = {
      channels: {
        msteams: {
          enabled: true,
        },
      },
    } as unknown as ChainbreakerConfig;
    await routeReply({
      payload: { text: "hi" },
      channel: "msteams",
      to: "conversation:19:abc@thread.tacv2",
      cfg,
    });
    expectLastDelivery({
      channel: "msteams",
      to: "conversation:19:abc@thread.tacv2",
      cfg,
      payloads: [expect.objectContaining({ text: "hi" })],
    });
  });

  it("passes mirror data when sessionKey is set", async () => {
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      sessionKey: "agent:main:main",
      isGroup: true,
      groupId: "channel:C123",
      cfg: {} as never,
    });
    expectLastDelivery({
      mirror: expect.objectContaining({
        sessionKey: "agent:main:main",
        text: "hi",
        isGroup: true,
        groupId: "channel:C123",
      }),
    });
  });

  it("skips mirror data when mirror is false", async () => {
    await routeReply({
      payload: { text: "hi" },
      to: "channel:C123",
      sessionKey: "agent:main:main",
      mirror: false,
      cfg: {} as never,
    });
    expectLastDelivery({
      mirror: undefined,
    });
  });
});
