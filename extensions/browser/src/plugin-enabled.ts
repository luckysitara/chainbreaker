import type { ChainbreakerConfig } from "chainbreaker/plugin-sdk/browser-support";
import {
  normalizePluginsConfig,
  resolveEffectiveEnableState,
} from "chainbreaker/plugin-sdk/browser-support";

export function isDefaultBrowserPluginEnabled(cfg: ChainbreakerConfig): boolean {
  return resolveEffectiveEnableState({
    id: "browser",
    origin: "bundled",
    config: normalizePluginsConfig(cfg.plugins),
    rootConfig: cfg,
    enabledByDefault: true,
  }).enabled;
}
