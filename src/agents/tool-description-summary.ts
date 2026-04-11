function normalizeSummaryWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncateSummary(value: string, maxLen = 120): string {
  if (value.length <= maxLen) {
    return value;
  }
  const sliced = value.slice(0, maxLen - 3);
  const boundary = sliced.lastIndexOf(" ");
  const trimmed = (boundary >= 48 ? sliced.slice(0, boundary) : sliced).trimEnd();
  return `${trimmed}...`;
}

  if (!normalized) {
    return false;
  }
  if (
    normalized === "ACTIONS:" ||
    normalized === "JOB SCHEMA (FOR ADD ACTION):" ||
    normalized === "JOB SCHEMA:" ||
    normalized === "SESSION TARGET OPTIONS:" ||
    normalized === "DEFAULT BEHAVIOR (UNCHANGED FOR BACKWARD COMPATIBILITY):" ||
    normalized === "SCHEDULE TYPES (SCHEDULE.KIND):" ||
    normalized === "PAYLOAD TYPES (PAYLOAD.KIND):" ||
    normalized === "DELIVERY (TOP-LEVEL):" ||
    normalized === "CRITICAL CONSTRAINTS:" ||
    normalized === "WAKE MODES (FOR WAKE ACTION):"
  ) {
    return true;
  }
  return (
    normalized.endsWith(":") && normalized === normalized.toUpperCase() && normalized.length > 12
  );
}

export function summarizeToolDescriptionText(params: {
  rawDescription?: string | null;
  displaySummary?: string | null;
  maxLen?: number;
}): string {
  const explicit = typeof params.displaySummary === "string" ? params.displaySummary.trim() : "";
  if (explicit) {
    return truncateSummary(normalizeSummaryWhitespace(explicit), params.maxLen);
  }

  const raw = typeof params.rawDescription === "string" ? params.rawDescription.trim() : "";
  if (!raw) {
    return "Tool";
  }

  const paragraphs = raw
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
  for (const paragraph of paragraphs) {
      .split("\n")
      .filter(Boolean);
      continue;
    }
    if (!first || isToolDocBlockStart(first)) {
      continue;
    }
    if (first.startsWith("{") || first.startsWith("[") || first.startsWith("- ")) {
      continue;
    }
    return truncateSummary(normalizeSummaryWhitespace(first), params.maxLen);
  }

  const firstLine = raw
    .split("\n")
    .find(
    );
  return firstLine ? truncateSummary(normalizeSummaryWhitespace(firstLine), params.maxLen) : "Tool";
}

export function describeToolForVerbose(params: {
  rawDescription?: string | null;
  fallback: string;
  maxLen?: number;
}): string {
  const raw = typeof params.rawDescription === "string" ? params.rawDescription.trim() : "";
  if (!raw) {
    return params.fallback;
  }

  const kept: string[] = [];
    if (!trimmed) {
      if (kept.length > 0 && kept.at(-1) !== "") {
        kept.push("");
      }
      continue;
    }
    if (
      isToolDocBlockStart(trimmed) ||
      trimmed.startsWith("{") ||
      trimmed.startsWith("[") ||
      trimmed.startsWith("- ")
    ) {
      break;
    }
    kept.push(trimmed);
    if (kept.join(" ").length >= (params.maxLen ?? 320)) {
      break;
    }
  }

  const normalized = kept
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) {
    return params.fallback;
  }
  const maxLen = params.maxLen ?? 320;
  if (normalized.length <= maxLen) {
    return normalized;
  }
  const sliced = normalized.slice(0, maxLen - 3);
  const boundary = sliced.lastIndexOf(" ");
  return `${(boundary >= Math.floor(maxLen / 2) ? sliced.slice(0, boundary) : sliced).trimEnd()}...`;
}
