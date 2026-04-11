import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { ChainbreakerConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): ChainbreakerConfig | null {
  return null;
}
