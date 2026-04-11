import { expect, vi } from "vitest";
import { telegramOutbound } from "../../../../test/channel-outbounds.js";
import { whatsappOutbound } from "../../../../test/channel-outbounds.js";
import { createOutboundSendDeps } from "../../../cli/deps.js";
import { deliverOutboundPayloads } from "../../../infra/outbound/deliver.js";
import type { ChannelId, ChannelOutboundAdapter } from "../types.js";

type OutboundPayloadHarness = {
  sendMock: any;
  to: string;
  run: () => Promise<Record<string, unknown>>;
};

function createOutboundPayloadHarness(params: {
  channel: ChannelId;
  adapter: ChannelOutboundAdapter;
  to: string;
  accountId?: string;
}): OutboundPayloadHarness {
  const sendMock = vi.fn(async () => ({ ok: true as const, messageId: "m1" }));
  const deps = { [params.channel]: { sendMessage: sendMock } };

  return {
    sendMock,
    to: params.to,
    run: async () => {
      const results = await deliverOutboundPayloads({
        cfg: {} as any,
        channel: params.channel,
        to: params.to,
        accountId: params.accountId,
        payloads: [{ text: "hello" }],
        deps: createOutboundSendDeps(deps),
      });
      return (results[0] as any)?.channelData ?? {};
    },
  };
}

export function createTelegramOutboundPayloadHarness(): OutboundPayloadHarness {
  return createOutboundPayloadHarness({
    channel: "telegram",
    adapter: telegramOutbound,
    to: "12345",
  });
}

export function createWhatsAppOutboundPayloadHarness(): OutboundPayloadHarness {
  return createOutboundPayloadHarness({
    channel: "whatsapp",
    adapter: whatsappOutbound,
    to: "15550001111@s.whatsapp.net",
  });
}

export async function testOutboundPayloadContract(params: {
  label: string;
  harness: OutboundPayloadHarness;
}) {
  const data = await params.harness.run();
  expect(params.harness.sendMock).toHaveBeenCalledOnce();
  const call = params.harness.sendMock.mock.calls[0];
  expect(call?.[0]).toMatchObject({
    to: params.harness.to,
  });
  return data;
}
