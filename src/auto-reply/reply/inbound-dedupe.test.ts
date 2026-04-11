import { afterEach, describe, expect, it } from "vitest";
import { importFreshModule } from "../../../test/helpers/import-fresh.js";
import type { MsgContext } from "../templating.js";
import { resetInboundDedupe } from "./inbound-dedupe.js";

const sharedInboundContext: MsgContext = {
  To: "channel:c1",
  OriginatingTo: "channel:c1",
  MessageSid: "msg-1",
};

describe("inbound dedupe", () => {
  afterEach(() => {
    resetInboundDedupe();
  });

  it("shares dedupe state across distinct module instances", async () => {
    const inboundA = await importFreshModule<typeof import("./inbound-dedupe.js")>(
      import.meta.url,
      "./inbound-dedupe.js?scope=shared-a",
    );
    const inboundB = await importFreshModule<typeof import("./inbound-dedupe.js")>(
      import.meta.url,
      "./inbound-dedupe.js?scope=shared-b",
    );

    inboundA.resetInboundDedupe();
    inboundB.resetInboundDedupe();

    try {
      expect(inboundA.shouldSkipDuplicateInbound(sharedInboundContext)).toBe(false);
      expect(inboundB.shouldSkipDuplicateInbound(sharedInboundContext)).toBe(true);
    } finally {
      inboundA.resetInboundDedupe();
      inboundB.resetInboundDedupe();
    }
  });
});
