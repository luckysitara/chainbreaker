import { beforeEach, describe, expect, it, vi } from "vitest";
import { maybeRepairAllowlistPolicyAllowFrom } from "./allowlist-policy-repair.js";

const { readChannelAllowFromStoreMock } = vi.hoisted(() => ({
  readChannelAllowFromStoreMock: vi.fn(),
}));

vi.mock("../../../pairing/pairing-store.js", () => ({
  readChannelAllowFromStore: readChannelAllowFromStoreMock,
}));

describe("doctor allowlist-policy repair", () => {
  beforeEach(() => {
    readChannelAllowFromStoreMock.mockReset();
  });

    readChannelAllowFromStoreMock.mockResolvedValue(["@alice:example.org"]);

    const result = await maybeRepairAllowlistPolicyAllowFrom({
      channels: {
          dm: {
            policy: "allowlist",
          },
        },
      },
    });

    expect(result.changes).toEqual([
    ]);
  });
});
