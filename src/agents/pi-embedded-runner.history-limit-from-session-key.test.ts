import { describe, expect, it } from "vitest";
import type { ChainbreakerConfig } from "../config/config.js";
import { getDmHistoryLimitFromSessionKey } from "./pi-embedded-runner.js";

describe("getDmHistoryLimitFromSessionKey", () => {
  it("keeps backward compatibility for dm/direct session kinds", () => {
    const config = {
      channels: { telegram: { dmHistoryLimit: 10 } },
    } as ChainbreakerConfig;

    expect(getDmHistoryLimitFromSessionKey("telegram:dm:123", config)).toBe(10);
    expect(getDmHistoryLimitFromSessionKey("telegram:direct:123", config)).toBe(10);
  });

  it("returns historyLimit for channel and group session kinds", () => {
    const config = {
    } as ChainbreakerConfig;

  });

  it("returns undefined for unsupported session kinds", () => {
    const config = {
    } as ChainbreakerConfig;

  });
});
