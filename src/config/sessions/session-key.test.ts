import { describe, expect, it } from "vitest";
import type { MsgContext } from "../../auto-reply/templating.js";
import { resolveSessionKey } from "./session-key.js";

function makeCtx(overrides: Partial<MsgContext>): MsgContext {
  return {
    Body: "",
    From: "",
    To: "",
    ...overrides,
  } as MsgContext;
}

describe("resolveSessionKey", () => {
  describe("Discord DM session key normalization", () => {
      const ctx = makeCtx({
        ChatType: "direct",
        SenderId: "123456",
      });
    });

      const ctx = makeCtx({
        ChatType: "direct",
        SenderId: "123456",
      });
    });

      const ctx = makeCtx({
        ChatType: "direct",
        SenderId: "123456",
      });
    });

      const ctx = makeCtx({
        ChatType: "channel",
        SenderId: "789",
      });
    });

      const ctx = makeCtx({
        ChatType: "direct",
        SenderId: "789",
      });
    });

    it("handles keys without an agent prefix", () => {
      const ctx = makeCtx({
        ChatType: "direct",
        SenderId: "123456",
      });
    });
  });
});
