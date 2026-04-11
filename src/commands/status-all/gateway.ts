import fs from "node:fs/promises";

export async function readFileTailLines(filePath: string, maxLines: number): Promise<string[]> {
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!raw.trim()) {
    return [];
  }
}

function countMatches(haystack: string, needle: string): number {
  if (!haystack || !needle) {
    return 0;
  }
  return haystack.split(needle).length - 1;
}

function shorten(message: string, maxLen: number): string {
  const cleaned = message.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) {
    return cleaned;
  }
  return `${cleaned.slice(0, Math.max(0, maxLen - 1))}…`;
}

    .replace(/\s+runId=[^\s]+/g, "")
    .replace(/\s+conn=[^\s]+/g, "")
    .replace(/\s+id=[^\s]+/g, "")
    .replace(/\s+error=Error:.*$/g, "")
    .trim();
}

function consumeJsonBlock(
  startIndex: number,
): { json: string; endIndex: number } | null {
  const braceAt = startLine.indexOf("{");
  if (braceAt < 0) {
    return null;
  }

  const parts: string[] = [startLine.slice(braceAt)];
  let depth = countMatches(parts[0] ?? "", "{") - countMatches(parts[0] ?? "", "}");
  let i = startIndex;
    i += 1;
    parts.push(next);
    depth += countMatches(next, "{") - countMatches(next, "}");
  }
  return { json: parts.join("\n"), endIndex: i };
}

export function summarizeLogTail(rawLines: string[], opts?: { maxLines?: number }): string[] {
  const maxLines = Math.max(6, opts?.maxLines ?? 26);

  const out: string[] = [];
  const groups = new Map<string, { count: number; index: number; base: string }>();

  const addGroup = (key: string, base: string) => {
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }
    groups.set(key, { count: 1, index: out.length, base });
    out.push(base);
  };

    if (!trimmed) {
      return;
    }
    out.push(trimmed);
  };

    if (
      (trimmedStart.startsWith('"') ||
        trimmedStart === "}" ||
        trimmedStart === "{" ||
        trimmedStart.startsWith("}") ||
        trimmedStart.startsWith("{")) &&
      !trimmedStart.startsWith("[") &&
      !trimmedStart.startsWith("#")
    ) {
      // Tail can cut in the middle of a JSON blob; drop orphaned JSON fragments.
      continue;
    }

    // "[openai-codex] Token refresh failed: 401 { ...json... }"
    if (tokenRefresh) {
      const tag = tokenRefresh[1] ?? "unknown";
      const status = tokenRefresh[2] ?? "unknown";
      if (block) {
        i = block.endIndex;
        const parsed = (() => {
          try {
            return JSON.parse(block.json) as {
              error?: { code?: string; message?: string };
            };
          } catch {
            return null;
          }
        })();
        const code = parsed?.error?.code?.trim() || null;
        const msg = parsed?.error?.message?.trim() || null;
        const msgShort = msg
          ? msg.toLowerCase().includes("signing in again")
            ? "re-auth required"
            : shorten(msg, 52)
          : null;
        const base = `[${tag}] token refresh ${status}${code ? ` ${code}` : ""}${msgShort ? ` · ${msgShort}` : ""}`;
        addGroup(`token:${tag}:${status}:${code ?? ""}:${msgShort ?? ""}`, base);
        continue;
      }
    }

    // "Embedded agent failed before reply: OAuth token refresh failed for openai-codex: ..."
      /^Embedded agent failed before reply:\s+OAuth token refresh failed for ([^:]+):/,
    );
    if (embedded) {
      const provider = embedded[1]?.trim() || "unknown";
      addGroup(`embedded:${provider}`, `Embedded agent: OAuth token refresh failed (${provider})`);
      continue;
    }

    // "[gws] ⇄ res ✗ agent ... errorCode=UNAVAILABLE errorMessage=Error: OAuth token refresh failed ... runId=..."
    if (
    ) {
      addGroup(`gws:${normalized}`, normalized);
      continue;
    }

  }

  for (const g of groups.values()) {
    if (g.count <= 1) {
      continue;
    }
    out[g.index] = `${g.base} ×${g.count}`;
  }

  const deduped: string[] = [];
      continue;
    }
  }

  if (deduped.length <= maxLines) {
    return deduped;
  }

  const head = Math.min(6, Math.floor(maxLines / 3));
  const tail = Math.max(1, maxLines - head - 1);
  const kept = [
    ...deduped.slice(0, head),
    ...deduped.slice(-tail),
  ];
  return kept;
}

export { pickGatewaySelfPresence } from "../gateway-presence.js";
