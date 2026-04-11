import type { ChainbreakerConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: ChainbreakerConfig, pluginId: string): ChainbreakerConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
