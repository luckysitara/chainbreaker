import { getRuntimeConfigSnapshot, type ChainbreakerConfig } from "../../config/config.js";

export function resolveSkillRuntimeConfig(config?: ChainbreakerConfig): ChainbreakerConfig | undefined {
  return getRuntimeConfigSnapshot() ?? config;
}
