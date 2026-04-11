import { createConfigIO, getRuntimeConfigSnapshot, type ChainbreakerConfig } from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): ChainbreakerConfig {
  return getRuntimeConfigSnapshot() ?? createConfigIO().loadConfig();
}
