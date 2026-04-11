import type { ChainbreakerConfig } from "../../config/config.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<ChainbreakerConfig["session"]>> = {},
): NonNullable<ChainbreakerConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
