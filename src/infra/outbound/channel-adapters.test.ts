import { describe, expect, it } from "vitest";
import { getChannelMessageAdapter } from "./channel-adapters.js";

describe("getChannelMessageAdapter", () => {
    expect(getChannelMessageAdapter("telegram")).toEqual({
      supportsComponentsV2: false,
    });
    expect(getChannelMessageAdapter("whatsapp")).toEqual({
      supportsComponentsV2: false,
    });
  });
});
