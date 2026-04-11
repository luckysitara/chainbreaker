import { vi } from "vitest";
import { installChromeUserDataDirHooks } from "./chrome-user-data-dir.test-harness.js";

const chromeUserDataDir = { dir: "/tmp/chainbreaker" };
installChromeUserDataDirHooks(chromeUserDataDir);

vi.mock("./chrome.js", () => ({
  isChromeCdpReady: vi.fn(async () => true),
  isChromeReachable: vi.fn(async () => true),
  launchChainbreakerChrome: vi.fn(async () => {
    throw new Error("unexpected launch");
  }),
  resolveChainbreakerUserDataDir: vi.fn(() => chromeUserDataDir.dir),
  stopChainbreakerChrome: vi.fn(async () => {}),
}));
