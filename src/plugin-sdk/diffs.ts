// Narrow plugin-sdk surface for the bundled diffs plugin.
// Keep this list additive and scoped to the bundled diffs surface.

export { definePluginEntry } from "./plugin-entry.js";
export type { ChainbreakerConfig } from "../config/config.js";
export { resolvePreferredChainbreakerTmpDir } from "../infra/tmp-chainbreaker-dir.js";
export type {
  AnyAgentTool,
  ChainbreakerPluginApi,
  ChainbreakerPluginConfigSchema,
  ChainbreakerPluginToolContext,
  PluginLogger,
} from "../plugins/types.js";
