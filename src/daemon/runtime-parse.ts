export function parseKeyValueOutput(output: string, separator: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const rawLine of output.split(/\r?\n/)) {
      continue;
    }
    if (idx <= 0) {
      continue;
    }
    if (!key) {
      continue;
    }
    entries[key] = value;
  }
  return entries;
}
