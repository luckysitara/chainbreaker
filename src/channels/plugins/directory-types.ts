import type { ChainbreakerConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: ChainbreakerConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
