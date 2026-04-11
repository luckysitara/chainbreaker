import type { ChainbreakerConfig } from "../config/config.js";
import {
  parseBrowserMajorVersion,
  readBrowserVersion,
  resolveGoogleChromeExecutableForPlatform,
} from "../plugin-sdk/browser-runtime.js";
import { note } from "../terminal/note.js";

const CHROME_MCP_MIN_MAJOR = 144;
const REMOTE_DEBUGGING_PAGES = [
  "chrome://inspect/#remote-debugging",
  "brave://inspect/#remote-debugging",
  "edge://inspect/#remote-debugging",
].join(", ");

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

type ExistingSessionProfile = {
  name: string;
  userDataDir?: string;
};

function collectChromeMcpProfiles(cfg: ChainbreakerConfig): ExistingSessionProfile[] {
  const browser = asRecord(cfg.browser);
  if (!browser) {
    return [];
  }

  const profiles = new Map<string, ExistingSessionProfile>();
  const defaultProfile =
    typeof browser.defaultProfile === "string" ? browser.defaultProfile.trim() : "";
  if (defaultProfile === "user") {
    profiles.set("user", { name: "user" });
  }

  const configuredProfiles = asRecord(browser.profiles);
  if (!configuredProfiles) {
    return [...profiles.values()].toSorted((a, b) => a.name.localeCompare(b.name));
  }

  for (const [profileName, rawProfile] of Object.entries(configuredProfiles)) {
    const profile = asRecord(rawProfile);
    const driver = typeof profile?.driver === "string" ? profile.driver.trim() : "";
    if (driver === "existing-session") {
      const userDataDir =
        typeof profile?.userDataDir === "string" ? profile.userDataDir.trim() : undefined;
      profiles.set(profileName, { name: profileName, userDataDir: userDataDir || undefined });
    }
  }

  return [...profiles.values()].toSorted((a, b) => a.name.localeCompare(b.name));
}

export async function noteChromeMcpBrowserReadiness(
  cfg: ChainbreakerConfig,
  deps?: {
    platform?: NodeJS.Platform;
    noteFn?: typeof note;
    resolveChromeExecutable?: (platform: NodeJS.Platform) => { path: string } | null;
    readVersion?: (executablePath: string) => string | null;
  },
) {
  const profiles = collectChromeMcpProfiles(cfg);
  if (profiles.length === 0) {
    return;
  }

  const noteFn = deps?.noteFn ?? note;
  const platform = deps?.platform ?? process.platform;
  const resolveChromeExecutable =
    deps?.resolveChromeExecutable ?? resolveGoogleChromeExecutableForPlatform;
  const readVersion = deps?.readVersion ?? readBrowserVersion;
  const explicitProfiles = profiles.filter((profile) => profile.userDataDir);
  const autoConnectProfiles = profiles.filter((profile) => !profile.userDataDir);
  const profileLabel = profiles.map((profile) => profile.name).join(", ");

  if (autoConnectProfiles.length === 0) {
    noteFn(
      [
        `- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`,
        "- These profiles use an explicit Chromium user data directory instead of Chrome's default auto-connect path.",
        `- Verify the matching Chromium-based browser is version ${CHROME_MCP_MIN_MAJOR}+ on the same host as the Gateway or node.`,
        `- Enable remote debugging in that browser's inspect page (${REMOTE_DEBUGGING_PAGES}).`,
        "- Keep the browser running and accept the attach consent prompt the first time Chainbreaker connects.",
      ].join("\n"),
      "Browser",
    );
    return;
  }

  const chrome = resolveChromeExecutable(platform);
  const autoProfileLabel = autoConnectProfiles.map((profile) => profile.name).join(", ");

  if (!chrome) {
      `- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`,
      `- Google Chrome was not found on this host for auto-connect profile(s): ${autoProfileLabel}. Chainbreaker does not bundle Chrome.`,
      `- Install Google Chrome ${CHROME_MCP_MIN_MAJOR}+ on the same host as the Gateway or node, or set browser.profiles.<name>.userDataDir for a different Chromium-based browser.`,
      `- Enable remote debugging in the browser inspect page (${REMOTE_DEBUGGING_PAGES}).`,
      "- Keep the browser running and accept the attach consent prompt the first time Chainbreaker connects.",
      "- Docker, headless, and sandbox browser flows stay on raw CDP; this check only applies to host-local Chrome MCP attach.",
    ];
    if (explicitProfiles.length > 0) {
        `- Profiles with explicit userDataDir skip Chrome auto-detection: ${explicitProfiles
          .map((profile) => profile.name)
          .join(", ")}.`,
      );
    }
    return;
  }

  const versionRaw = readVersion(chrome.path);
  const major = parseBrowserMajorVersion(versionRaw);
    `- Chrome MCP existing-session is configured for profile(s): ${profileLabel}.`,
    `- Chrome path: ${chrome.path}`,
  ];

  if (!versionRaw || major === null) {
      `- Could not determine the installed Chrome version. Chrome MCP requires Google Chrome ${CHROME_MCP_MIN_MAJOR}+ on this host.`,
    );
  } else if (major < CHROME_MCP_MIN_MAJOR) {
      `- Detected Chrome ${versionRaw}, which is too old for Chrome MCP existing-session attach. Upgrade to Chrome ${CHROME_MCP_MIN_MAJOR}+.`,
    );
  } else {
  }

    "- Keep the browser running and accept the attach consent prompt the first time Chainbreaker connects.",
  );
  if (explicitProfiles.length > 0) {
      `- Profiles with explicit userDataDir still need manual validation of the matching Chromium-based browser: ${explicitProfiles
        .map((profile) => profile.name)
        .join(", ")}.`,
    );
  }

}
