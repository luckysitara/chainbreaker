import { type ChainbreakerConfig } from "chainbreaker/plugin-sdk/config-runtime";
import { resolveTextChunkLimit } from "chainbreaker/plugin-sdk/reply-runtime";
import { resolveAccountEntry } from "chainbreaker/plugin-sdk/routing";
import { normalizeAccountId } from "chainbreaker/plugin-sdk/routing";
import { TELEGRAM_TEXT_CHUNK_LIMIT } from "./outbound-adapter.js";

const DEFAULT_TELEGRAM_DRAFT_STREAM_MIN = 200;
const DEFAULT_TELEGRAM_DRAFT_STREAM_MAX = 800;

export function resolveTelegramDraftStreamingChunking(
  cfg: ChainbreakerConfig | undefined,
  accountId?: string | null,
): {
  minChars: number;
  maxChars: number;
} {
  const textLimit = resolveTextChunkLimit(cfg, "telegram", accountId, {
    fallbackLimit: TELEGRAM_TEXT_CHUNK_LIMIT,
  });
  const normalizedAccountId = normalizeAccountId(accountId);
  const accountCfg = resolveAccountEntry(cfg?.channels?.telegram?.accounts, normalizedAccountId);
  const draftCfg = accountCfg?.draftChunk ?? cfg?.channels?.telegram?.draftChunk;

  const maxRequested = Math.max(
    1,
    Math.floor(draftCfg?.maxChars ?? DEFAULT_TELEGRAM_DRAFT_STREAM_MAX),
  );
  const maxChars = Math.max(1, Math.min(maxRequested, textLimit));
  const minRequested = Math.max(
    1,
    Math.floor(draftCfg?.minChars ?? DEFAULT_TELEGRAM_DRAFT_STREAM_MIN),
  );
  const minChars = Math.min(minRequested, maxChars);
  const breakPreference =
      ? draftCfg.breakPreference
      : "paragraph";
  return { minChars, maxChars, breakPreference };
}
