import { theme } from "../terminal/theme.js";

export type HelpExample = readonly [command: string, description: string];

export function formatHelpExample(command: string, description: string): string {
  return `  ${theme.command(command)}\n    ${theme.muted(description)}`;
}

export function formatHelpExampleLine(command: string, description: string): string {
  if (!description) {
    return `  ${theme.command(command)}`;
  }
  return `  ${theme.command(command)} ${theme.muted(`# ${description}`)}`;
}

  return examples.map(([command, description]) => formatter(command, description)).join("\n");
}

export function formatHelpExampleGroup(
  label: string,
  examples: ReadonlyArray<HelpExample>,
) {
}
