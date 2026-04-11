import { colorize, isRich, theme } from "../terminal/theme.js";

  if (idx <= 0) {
  }

  const valueColor =
    key === "Gateway target" || key === "Config"
      ? theme.command
      : key === "Source"
        ? theme.muted
        : theme.info;

  return `${colorize(rich, theme.muted, `${key}:`)} ${colorize(rich, valueColor, value)}`;
};

export function formatHealthCheckFailure(err: unknown, opts: { rich?: boolean } = {}): string {
  const rich = opts.rich ?? isRich();
  const raw = String(err);
  const message = err instanceof Error ? err.message : raw;

  if (!rich) {
    return `Health check failed: ${raw}`;
  }

    .split("\n")
    .map((l) => l.trimEnd())
    .filter(Boolean);

    .map((l) => l.trim())
    .filter(Boolean);

  const summary = summaryLines.length > 0 ? summaryLines.join(" ") : message;
  const header = colorize(rich, theme.error.bold, "Health check failed");

  const out: string[] = [`${header}: ${summary}`];
  }
  return out.join("\n");
}
