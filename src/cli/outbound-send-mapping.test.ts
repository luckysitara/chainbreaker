import { describe, expect, it, vi } from "vitest";
import { createOutboundSendDepsFromCliSource } from "./outbound-send-mapping.js";

describe("createOutboundSendDepsFromCliSource", () => {
  it("adds legacy aliases for channel-keyed send deps", () => {
    const deps = {
      whatsapp: vi.fn(),
      telegram: vi.fn(),
    };

    const outbound = createOutboundSendDepsFromCliSource(deps);

    expect(outbound).toEqual({
      whatsapp: deps.whatsapp,
      telegram: deps.telegram,
      sendWhatsApp: deps.whatsapp,
      sendTelegram: deps.telegram,
    });
  });
});
