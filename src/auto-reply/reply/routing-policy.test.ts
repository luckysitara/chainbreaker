import { describe, expect, it } from "vitest";
import { resolveReplyRoutingDecision } from "./routing-policy.js";

function isRoutableChannel(channel: string | undefined) {
  return Boolean(
    channel &&
  );
}

describe("resolveReplyRoutingDecision", () => {
  it("routes replies to the originating channel when the current provider differs", () => {
    expect(
      resolveReplyRoutingDecision({
        originatingChannel: "telegram",
        originatingTo: "telegram:123",
        isRoutableChannel,
      }),
    ).toMatchObject({
      originatingChannel: "telegram",
      shouldRouteToOriginating: true,
      shouldSuppressTyping: true,
    });
  });

  it("does not route external replies from internal webchat without explicit delivery", () => {
    expect(
      resolveReplyRoutingDecision({
        provider: "webchat",
        surface: "webchat",
        explicitDeliverRoute: false,
        originatingChannel: "telegram",
        originatingTo: "telegram:123",
        isRoutableChannel,
      }),
    ).toMatchObject({
      currentSurface: "webchat",
      isInternalWebchatTurn: true,
      shouldRouteToOriginating: false,
    });
  });

  it("suppresses direct user delivery for parent-owned background ACP children", () => {
    expect(
      resolveReplyRoutingDecision({
        originatingChannel: "telegram",
        originatingTo: "telegram:123",
        suppressDirectUserDelivery: true,
        isRoutableChannel,
      }),
    ).toMatchObject({
      shouldRouteToOriginating: false,
      shouldSuppressTyping: true,
    });
  });
});
