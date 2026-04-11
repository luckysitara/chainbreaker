import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fileState = vi.hoisted(() => ({
  hasCliDotEnv: false,
}));

const dotenvState = vi.hoisted(() => {
  const state = {
    profileAtDotenvLoad: undefined as string | undefined,
    containerAtDotenvLoad: undefined as string | undefined,
  };
  return {
    state,
    loadDotEnv: vi.fn(() => {
      state.profileAtDotenvLoad = process.env.CHAINBREAKER_PROFILE;
      state.containerAtDotenvLoad = process.env.CHAINBREAKER_CONTAINER;
    }),
  };
});

const maybeRunCliInContainerMock = vi.hoisted(() =>
  vi.fn((argv: string[]) => ({ handled: false, argv })),
);

vi.mock("node:fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs")>();
  type ExistsSyncPath = Parameters<typeof actual.existsSync>[0];
  return {
    ...actual,
    existsSync: vi.fn((target: ExistsSyncPath) => {
      if (typeof target === "string" && target.endsWith(".env")) {
        return fileState.hasCliDotEnv;
      }
      return actual.existsSync(target);
    }),
  };
});

vi.mock("./dotenv.js", () => ({
  loadCliDotEnv: dotenvState.loadDotEnv,
}));

vi.mock("../infra/env.js", () => ({
  normalizeEnv: vi.fn(),
}));

vi.mock("../infra/runtime-guard.js", () => ({
  assertSupportedRuntime: vi.fn(),
}));

vi.mock("../infra/path-env.js", () => ({
  ensureChainbreakerCliOnPath: vi.fn(),
}));

vi.mock("./route.js", () => ({
  tryRouteCli: vi.fn(async () => true),
}));

vi.mock("./windows-argv.js", () => ({
  normalizeWindowsArgv: (argv: string[]) => argv,
}));

vi.mock("./container-target.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./container-target.js")>();
  return {
    ...actual,
    maybeRunCliInContainer: maybeRunCliInContainerMock,
  };
});

import { runCli } from "./run-main.js";

describe("runCli profile env bootstrap", () => {
  const originalProfile = process.env.CHAINBREAKER_PROFILE;
  const originalStateDir = process.env.CHAINBREAKER_STATE_DIR;
  const originalConfigPath = process.env.CHAINBREAKER_CONFIG_PATH;
  const originalContainer = process.env.CHAINBREAKER_CONTAINER;
  const originalGatewayPort = process.env.CHAINBREAKER_GATEWAY_PORT;
  const originalGatewayUrl = process.env.CHAINBREAKER_GATEWAY_URL;
  const originalGatewayToken = process.env.CHAINBREAKER_GATEWAY_TOKEN;
  const originalGatewayPassword = process.env.CHAINBREAKER_GATEWAY_PASSWORD;

  beforeEach(() => {
    delete process.env.CHAINBREAKER_PROFILE;
    delete process.env.CHAINBREAKER_STATE_DIR;
    delete process.env.CHAINBREAKER_CONFIG_PATH;
    delete process.env.CHAINBREAKER_CONTAINER;
    delete process.env.CHAINBREAKER_GATEWAY_PORT;
    delete process.env.CHAINBREAKER_GATEWAY_URL;
    delete process.env.CHAINBREAKER_GATEWAY_TOKEN;
    delete process.env.CHAINBREAKER_GATEWAY_PASSWORD;
    dotenvState.state.profileAtDotenvLoad = undefined;
    dotenvState.state.containerAtDotenvLoad = undefined;
    dotenvState.loadDotEnv.mockClear();
    maybeRunCliInContainerMock.mockClear();
    fileState.hasCliDotEnv = false;
  });

  afterEach(() => {
    if (originalProfile === undefined) {
      delete process.env.CHAINBREAKER_PROFILE;
    } else {
      process.env.CHAINBREAKER_PROFILE = originalProfile;
    }
    if (originalContainer === undefined) {
      delete process.env.CHAINBREAKER_CONTAINER;
    } else {
      process.env.CHAINBREAKER_CONTAINER = originalContainer;
    }
    if (originalStateDir === undefined) {
      delete process.env.CHAINBREAKER_STATE_DIR;
    } else {
      process.env.CHAINBREAKER_STATE_DIR = originalStateDir;
    }
    if (originalConfigPath === undefined) {
      delete process.env.CHAINBREAKER_CONFIG_PATH;
    } else {
      process.env.CHAINBREAKER_CONFIG_PATH = originalConfigPath;
    }
    if (originalGatewayPort === undefined) {
      delete process.env.CHAINBREAKER_GATEWAY_PORT;
    } else {
      process.env.CHAINBREAKER_GATEWAY_PORT = originalGatewayPort;
    }
    if (originalGatewayUrl === undefined) {
      delete process.env.CHAINBREAKER_GATEWAY_URL;
    } else {
      process.env.CHAINBREAKER_GATEWAY_URL = originalGatewayUrl;
    }
    if (originalGatewayToken === undefined) {
      delete process.env.CHAINBREAKER_GATEWAY_TOKEN;
    } else {
      process.env.CHAINBREAKER_GATEWAY_TOKEN = originalGatewayToken;
    }
    if (originalGatewayPassword === undefined) {
      delete process.env.CHAINBREAKER_GATEWAY_PASSWORD;
    } else {
      process.env.CHAINBREAKER_GATEWAY_PASSWORD = originalGatewayPassword;
    }
  });

  it("applies --profile before dotenv loading", async () => {
    fileState.hasCliDotEnv = true;
    await runCli(["node", "chainbreaker", "--profile", "rawdog", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(dotenvState.state.profileAtDotenvLoad).toBe("rawdog");
    expect(process.env.CHAINBREAKER_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with --profile", async () => {
    await expect(
      runCli(["node", "chainbreaker", "--container", "demo", "--profile", "rawdog", "status"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");

    expect(dotenvState.loadDotEnv).not.toHaveBeenCalled();
    expect(process.env.CHAINBREAKER_PROFILE).toBe("rawdog");
  });

  it("rejects --container combined with interleaved --profile", async () => {
    await expect(
      runCli(["node", "chainbreaker", "status", "--container", "demo", "--profile", "rawdog"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("rejects --container combined with interleaved --dev", async () => {
    await expect(
      runCli(["node", "chainbreaker", "status", "--container", "demo", "--dev"]),
    ).rejects.toThrow("--container cannot be combined with --profile/--dev");
  });

  it("does not let dotenv change container target resolution", async () => {
    fileState.hasCliDotEnv = true;
    dotenvState.loadDotEnv.mockImplementationOnce(() => {
      process.env.CHAINBREAKER_CONTAINER = "demo";
      dotenvState.state.profileAtDotenvLoad = process.env.CHAINBREAKER_PROFILE;
      dotenvState.state.containerAtDotenvLoad = process.env.CHAINBREAKER_CONTAINER;
    });

    await runCli(["node", "chainbreaker", "status"]);

    expect(dotenvState.loadDotEnv).toHaveBeenCalledOnce();
    expect(process.env.CHAINBREAKER_CONTAINER).toBe("demo");
    expect(dotenvState.state.containerAtDotenvLoad).toBe("demo");
    expect(maybeRunCliInContainerMock).toHaveBeenCalledWith(["node", "chainbreaker", "status"]);
    expect(maybeRunCliInContainerMock).toHaveReturnedWith({
      handled: false,
      argv: ["node", "chainbreaker", "status"],
    });
  });

  it("allows container mode when CHAINBREAKER_PROFILE is already set in env", async () => {
    process.env.CHAINBREAKER_PROFILE = "work";

    await expect(
      runCli(["node", "chainbreaker", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it.each([
    ["CHAINBREAKER_GATEWAY_PORT", "19001"],
    ["CHAINBREAKER_GATEWAY_URL", "ws://127.0.0.1:18789"],
    ["CHAINBREAKER_GATEWAY_TOKEN", "demo-token"],
    ["CHAINBREAKER_GATEWAY_PASSWORD", "demo-password"],
  ])("allows container mode when %s is set in env", async (key, value) => {
    process.env[key] = value;

    await expect(
      runCli(["node", "chainbreaker", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only CHAINBREAKER_STATE_DIR is set in env", async () => {
    process.env.CHAINBREAKER_STATE_DIR = "/tmp/chainbreaker-host-state";

    await expect(
      runCli(["node", "chainbreaker", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });

  it("allows container mode when only CHAINBREAKER_CONFIG_PATH is set in env", async () => {
    process.env.CHAINBREAKER_CONFIG_PATH = "/tmp/chainbreaker-host-state/chainbreaker.json";

    await expect(
      runCli(["node", "chainbreaker", "--container", "demo", "status"]),
    ).resolves.toBeUndefined();
  });
});
