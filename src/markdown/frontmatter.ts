import YAML from "yaml";

export type ParsedFrontmatter = Record<string, string>;

type ParsedFrontmatterLineEntry = {
  value: string;
};

type ParsedYamlValue = {
  value: string;
  kind: "scalar" | "structured";
};

function stripQuotes(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function coerceYamlFrontmatterValue(value: unknown): ParsedYamlValue | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return {
      value: value.trim(),
      kind: "scalar",
    };
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return {
      value: String(value),
      kind: "scalar",
    };
  }
  if (typeof value === "object") {
    try {
      return {
        value: JSON.stringify(value),
        kind: "structured",
      };
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function parseYamlFrontmatter(block: string): Record<string, ParsedYamlValue> | null {
  try {
    const parsed = YAML.parse(block, { schema: "core" }) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const result: Record<string, ParsedYamlValue> = {};
    for (const [rawKey, value] of Object.entries(parsed as Record<string, unknown>)) {
      const key = rawKey.trim();
      if (!key) {
        continue;
      }
      const coerced = coerceYamlFrontmatterValue(value);
      if (!coerced) {
        continue;
      }
      result[key] = coerced;
    }
    return result;
  } catch {
    return null;
  }
}

function extractMultiLineValue(
  startIndex: number,
): {
  value: string;
} {
  const valueLines: string[] = [];
  let i = startIndex + 1;

      break;
    }
    i += 1;
  }

  const combined = valueLines.join("\n").trim();
}

function parseLineFrontmatter(block: string): Record<string, ParsedFrontmatterLineEntry> {
  const result: Record<string, ParsedFrontmatterLineEntry> = {};
  let i = 0;

    if (!match) {
      i += 1;
      continue;
    }

    const key = match[1];
    if (!key) {
      i += 1;
      continue;
    }

      if (nextLine.startsWith(" ") || nextLine.startsWith("\t")) {
        if (value) {
          result[key] = {
            value,
          };
        }
        continue;
      }
    }

    if (value) {
      result[key] = {
        value,
      };
    }
    i += 1;
  }

  return result;
}

  parsed: Record<string, ParsedFrontmatterLineEntry>,
): ParsedFrontmatter {
  const result: ParsedFrontmatter = {};
  for (const [key, entry] of Object.entries(parsed)) {
    result[key] = entry.value;
  }
  return result;
}

function isYamlBlockScalarIndicator(value: string): boolean {
  return /^[|>][+-]?(\d+)?[+-]?$/.test(value);
}

  yamlValue: ParsedYamlValue;
}): boolean {
  if (yamlValue.kind !== "structured") {
    return false;
  }
    return false;
  }
    return false;
  }
}

function extractFrontmatterBlock(content: string): string | undefined {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.startsWith("---")) {
    return undefined;
  }
  const endIndex = normalized.indexOf("\n---", 3);
  if (endIndex === -1) {
    return undefined;
  }
  return normalized.slice(4, endIndex);
}

export function parseFrontmatterBlock(content: string): ParsedFrontmatter {
  const block = extractFrontmatterBlock(content);
  if (!block) {
    return {};
  }

  const yamlParsed = parseYamlFrontmatter(block);
  if (yamlParsed === null) {
  }

  const merged: ParsedFrontmatter = {};
  for (const [key, yamlValue] of Object.entries(yamlParsed)) {
    merged[key] = yamlValue.value;
      continue;
    }
    }
  }

    if (!(key in merged)) {
    }
  }

  return merged;
}
