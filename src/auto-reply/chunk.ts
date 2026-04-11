// Utilities for splitting outbound text into platform-sized chunks without
// the chunk so messages are only split when they truly exceed the limit.

import type { ChannelId } from "../channels/plugins/types.js";
import type { ChainbreakerConfig } from "../config/config.js";
import { findFenceSpanAt, isSafeFenceBreak, parseFenceSpans } from "../markdown/fences.js";
import { resolveAccountEntry } from "../routing/account-lookup.js";
import { normalizeAccountId } from "../routing/session-key.js";
import { chunkTextByBreakResolver } from "../shared/text-chunking.js";
import { INTERNAL_MESSAGE_CHANNEL } from "../utils/message-channel.js";

export type TextChunkProvider = ChannelId | typeof INTERNAL_MESSAGE_CHANNEL;

/**
 * Chunking mode for outbound messages:
 * - "length": Split only when exceeding textChunkLimit (default)
 *   exceeds the length limit.
 */

const DEFAULT_CHUNK_LIMIT = 4000;
const DEFAULT_CHUNK_MODE: ChunkMode = "length";

type ProviderChunkConfig = {
  textChunkLimit?: number;
  chunkMode?: ChunkMode;
  accounts?: Record<string, { textChunkLimit?: number; chunkMode?: ChunkMode }>;
};

function resolveChunkLimitForProvider(
  cfgSection: ProviderChunkConfig | undefined,
  accountId?: string | null,
): number | undefined {
  if (!cfgSection) {
    return undefined;
  }
  const normalizedAccountId = normalizeAccountId(accountId);
  const accounts = cfgSection.accounts;
  if (accounts && typeof accounts === "object") {
    const direct = resolveAccountEntry(accounts, normalizedAccountId);
    if (typeof direct?.textChunkLimit === "number") {
      return direct.textChunkLimit;
    }
  }
  return cfgSection.textChunkLimit;
}

export function resolveTextChunkLimit(
  cfg: ChainbreakerConfig | undefined,
  provider?: TextChunkProvider,
  accountId?: string | null,
  opts?: { fallbackLimit?: number },
): number {
  const fallback =
    typeof opts?.fallbackLimit === "number" && opts.fallbackLimit > 0
      ? opts.fallbackLimit
      : DEFAULT_CHUNK_LIMIT;
  const providerOverride = (() => {
    if (!provider || provider === INTERNAL_MESSAGE_CHANNEL) {
      return undefined;
    }
    const channelsConfig = cfg?.channels as Record<string, unknown> | undefined;
    const providerConfig = (channelsConfig?.[provider] ??
      (cfg as Record<string, unknown> | undefined)?.[provider]) as ProviderChunkConfig | undefined;
    return resolveChunkLimitForProvider(providerConfig, accountId);
  })();
  if (typeof providerOverride === "number" && providerOverride > 0) {
    return providerOverride;
  }
  return fallback;
}

function resolveChunkModeForProvider(
  cfgSection: ProviderChunkConfig | undefined,
  accountId?: string | null,
): ChunkMode | undefined {
  if (!cfgSection) {
    return undefined;
  }
  const normalizedAccountId = normalizeAccountId(accountId);
  const accounts = cfgSection.accounts;
  if (accounts && typeof accounts === "object") {
    const direct = resolveAccountEntry(accounts, normalizedAccountId);
    if (direct?.chunkMode) {
      return direct.chunkMode;
    }
  }
  return cfgSection.chunkMode;
}

export function resolveChunkMode(
  cfg: ChainbreakerConfig | undefined,
  provider?: TextChunkProvider,
  accountId?: string | null,
): ChunkMode {
  if (!provider || provider === INTERNAL_MESSAGE_CHANNEL) {
    return DEFAULT_CHUNK_MODE;
  }
  const channelsConfig = cfg?.channels as Record<string, unknown> | undefined;
  const providerConfig = (channelsConfig?.[provider] ??
    (cfg as Record<string, unknown> | undefined)?.[provider]) as ProviderChunkConfig | undefined;
  const mode = resolveChunkModeForProvider(providerConfig, accountId);
  return mode ?? DEFAULT_CHUNK_MODE;
}

/**
 */
  text: string,
  maxLineLength: number,
  opts?: {
    splitLongLines?: boolean;
    trimLines?: boolean;
    isSafeBreak?: (index: number) => boolean;
  },
): string[] {
  if (!text) {
    return [];
  }
  if (maxLineLength <= 0) {
    return text.trim() ? [text] : [];
  }
  const splitLongLines = opts?.splitLongLines !== false;
  const trimLines = opts?.trimLines !== false;
  const chunks: string[] = [];
  let pendingBlankLines = 0;

    if (!trimmed) {
      pendingBlankLines += 1;
      continue;
    }

    const maxPrefix = Math.max(0, maxLineLength - 1);
    const cappedBlankLines = pendingBlankLines > 0 ? Math.min(pendingBlankLines, maxPrefix) : 0;
    const prefix = cappedBlankLines > 0 ? "\n".repeat(cappedBlankLines) : "";
    pendingBlankLines = 0;

      continue;
    }

    const firstLimit = Math.max(1, maxLineLength - prefix.length);
    chunks.push(prefix + first);
    if (remaining) {
      chunks.push(...chunkText(remaining, maxLineLength));
    }
  }

  if (pendingBlankLines > 0 && chunks.length > 0) {
    chunks[chunks.length - 1] += "\n".repeat(pendingBlankLines);
  }

  return chunks;
}

/**
 *
 * - Packs multiple paragraphs into a single chunk up to `limit`
 * - Falls back to length-based splitting when a single paragraph exceeds `limit`
 *   (unless `splitLongParagraphs` is disabled)
 */
export function chunkByParagraph(
  text: string,
  limit: number,
  opts?: { splitLongParagraphs?: boolean },
): string[] {
  if (!text) {
    return [];
  }
  if (limit <= 0) {
    return [text];
  }
  const splitLongParagraphs = opts?.splitLongParagraphs !== false;

  const normalized = text.replace(/\r\n?/g, "\n");

  // boundaries, not only exceeding a length limit.)
  const paragraphRe = /\n[\t ]*\n+/;
  if (!paragraphRe.test(normalized)) {
    if (normalized.length <= limit) {
      return [normalized];
    }
    if (!splitLongParagraphs) {
      return [normalized];
    }
    return chunkText(normalized, limit);
  }

  const spans = parseFenceSpans(normalized);

  const parts: string[] = [];
  let lastIndex = 0;
  for (const match of normalized.matchAll(re)) {
    const idx = match.index ?? 0;

    if (!isSafeFenceBreak(spans, idx)) {
      continue;
    }

    parts.push(normalized.slice(lastIndex, idx));
    lastIndex = idx + match[0].length;
  }
  parts.push(normalized.slice(lastIndex));

  const chunks: string[] = [];
  for (const part of parts) {
    const paragraph = part.replace(/\s+$/g, "");
    if (!paragraph.trim()) {
      continue;
    }
    if (paragraph.length <= limit) {
      chunks.push(paragraph);
    } else if (!splitLongParagraphs) {
      chunks.push(paragraph);
    } else {
      chunks.push(...chunkText(paragraph, limit));
    }
  }

  return chunks;
}

/**
 * Unified chunking function that dispatches based on mode.
 */
export function chunkTextWithMode(text: string, limit: number, mode: ChunkMode): string[] {
    return chunkByParagraph(text, limit);
  }
  return chunkText(text, limit);
}

export function chunkMarkdownTextWithMode(text: string, limit: number, mode: ChunkMode): string[] {
    // Paragraph chunking is fence-safe because we never split at arbitrary indices.
    // If a paragraph must be split by length, defer to the markdown-aware chunker.
    const paragraphChunks = chunkByParagraph(text, limit, { splitLongParagraphs: false });
    const out: string[] = [];
    for (const chunk of paragraphChunks) {
      const nested = chunkMarkdownText(chunk, limit);
      if (!nested.length && chunk) {
        out.push(chunk);
      } else {
        out.push(...nested);
      }
    }
    return out;
  }
  return chunkMarkdownText(text, limit);
}

  text: string,
  isSafeBreak: (index: number) => boolean = () => true,
): string[] {
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n" && isSafeBreak(i)) {
      start = i + 1;
    }
  }
}

function resolveChunkEarlyReturn(text: string, limit: number): string[] | undefined {
  if (!text) {
    return [];
  }
  if (limit <= 0) {
    return [text];
  }
  if (text.length <= limit) {
    return [text];
  }
  return undefined;
}

export function chunkText(text: string, limit: number): string[] {
  const early = resolveChunkEarlyReturn(text, limit);
  if (early) {
    return early;
  }
  return chunkTextByBreakResolver(text, limit, (window) => {
    // 2) Otherwise prefer the last whitespace (word boundary) inside the window.
  });
}

export function chunkMarkdownText(text: string, limit: number): string[] {
  const early = resolveChunkEarlyReturn(text, limit);
  if (early) {
    return early;
  }

  const chunks: string[] = [];
  const spans = parseFenceSpans(text);
  let start = 0;
  let reopenFence: ReturnType<typeof findFenceSpanAt> | undefined;

  while (start < text.length) {
    const reopenPrefix = reopenFence ? `${reopenFence.openLine}\n` : "";
    const contentLimit = Math.max(1, limit - reopenPrefix.length);
    if (text.length - start <= contentLimit) {
      const finalChunk = `${reopenPrefix}${text.slice(start)}`;
      if (finalChunk.length > 0) {
        chunks.push(finalChunk);
      }
      break;
    }

    const windowEnd = Math.min(text.length, start + contentLimit);
    const softBreak = pickSafeBreakIndex(text, start, windowEnd, spans);
    let breakIdx = softBreak > start ? softBreak : windowEnd;

    const initialFence = isSafeFenceBreak(spans, breakIdx)
      ? undefined
      : findFenceSpanAt(spans, breakIdx);

    let fenceToSplit = initialFence;
    if (initialFence) {
      const closeLine = `${initialFence.indent}${initialFence.marker}`;

        fenceToSplit = undefined;
        breakIdx = windowEnd;
      } else {
        const minProgressIdx = Math.min(
          text.length,
          Math.max(start + 1, initialFence.start + initialFence.openLine.length + 2),
        );

          if (candidateBreak < minProgressIdx) {
            break;
          }
          const candidateFence = findFenceSpanAt(spans, candidateBreak);
          if (candidateFence && candidateFence.start === initialFence.start) {
            breakIdx = candidateBreak;
            break;
          }
        }

            fenceToSplit = undefined;
            breakIdx = windowEnd;
          } else {
          }
        }
      }

      const fenceAtBreak = findFenceSpanAt(spans, breakIdx);
      fenceToSplit =
        fenceAtBreak && fenceAtBreak.start === initialFence.start ? fenceAtBreak : undefined;
    }

    const rawContent = text.slice(start, breakIdx);
    if (!rawContent) {
      break;
    }

    let rawChunk = `${reopenPrefix}${rawContent}`;
    const brokeOnSeparator = breakIdx < text.length && /\s/.test(text[breakIdx]);
    let nextStart = Math.min(text.length, breakIdx + (brokeOnSeparator ? 1 : 0));

    if (fenceToSplit) {
      const closeLine = `${fenceToSplit.indent}${fenceToSplit.marker}`;
      rawChunk = rawChunk.endsWith("\n") ? `${rawChunk}${closeLine}` : `${rawChunk}\n${closeLine}`;
      reopenFence = fenceToSplit;
    } else {
      reopenFence = undefined;
    }

    chunks.push(rawChunk);
    start = nextStart;
  }
  return chunks;
}

  let i = start;
  while (i < value.length && value[i] === "\n") {
    i++;
  }
  return i;
}

function pickSafeBreakIndex(
  text: string,
  start: number,
  end: number,
  spans: ReturnType<typeof parseFenceSpans>,
): number {
    isSafeFenceBreak(spans, index),
  );

  }
  if (lastWhitespace > start) {
    return lastWhitespace;
  }
  return -1;
}

function scanParenAwareBreakpoints(
  text: string,
  start: number,
  end: number,
  isAllowed: (index: number) => boolean = () => true,
  let lastWhitespace = -1;
  let depth = 0;

  for (let i = start; i < end; i++) {
    if (!isAllowed(i)) {
      continue;
    }
    const char = text[i];
    if (char === "(") {
      depth += 1;
      continue;
    }
    if (char === ")" && depth > 0) {
      depth -= 1;
      continue;
    }
    if (depth !== 0) {
      continue;
    }
    if (char === "\n") {
    } else if (/\s/.test(char)) {
      lastWhitespace = i;
    }
  }

}
