import { beforeEach, describe, expect, it, vi } from "vitest";
import { bundledPluginRootAt, repoInstallSpec } from "../../test/helpers/bundled-plugin-paths.js";
import type { ChainbreakerConfig } from "../config/config.js";
import type { ConfigFileSnapshot } from "../config/types.chainbreaker.js";
import { loadConfigForInstall } from "./plugins-install-command.js";

const hoisted = vi.hoisted(() => ({
  loadConfigMock: vi.fn<() => ChainbreakerConfig>(),
  readConfigFileSnapshotMock: vi.fn<() => Promise<ConfigFileSnapshot>>(),
  cleanStaleMatrixPluginConfigMock: vi.fn(),
}));

const loadConfigMock = hoisted.loadConfigMock;
const readConfigFileSnapshotMock = hoisted.readConfigFileSnapshotMock;
const cleanStaleMatrixPluginConfigMock = hoisted.cleanStaleMatrixPluginConfigMock;

vi.mock("../config/config.js", () => ({
  loadConfig: () => loadConfigMock(),
  readConfigFileSnapshot: () => readConfigFileSnapshotMock(),
}));

  cleanStaleMatrixPluginConfig: (cfg: ChainbreakerConfig) => cleanStaleMatrixPluginConfigMock(cfg),
}));


function makeSnapshot(overrides: Partial<ConfigFileSnapshot> = {}): ConfigFileSnapshot {
  return {
    path: "/tmp/config.json5",
    exists: true,
    raw: '{ "plugins": {} }',
    parsed: { plugins: {} },
    sourceConfig: { plugins: {} } as ConfigFileSnapshot["sourceConfig"],
    resolved: { plugins: {} } as ChainbreakerConfig,
    valid: false,
    runtimeConfig: { plugins: {} } as ConfigFileSnapshot["runtimeConfig"],
    config: { plugins: {} } as ChainbreakerConfig,
    hash: "abc",
    warnings: [],
    legacyIssues: [],
    ...overrides,
  };
}

describe("loadConfigForInstall", () => {
  };

  beforeEach(() => {
    loadConfigMock.mockReset();
    readConfigFileSnapshotMock.mockReset();
    cleanStaleMatrixPluginConfigMock.mockReset();

    cleanStaleMatrixPluginConfigMock.mockImplementation((cfg: ChainbreakerConfig) => ({
      config: cfg,
      changes: [],
    }));
  });

  it("returns the config directly when loadConfig succeeds", async () => {
    loadConfigMock.mockReturnValue(cfg);

    expect(result).toBe(cfg);
    expect(readConfigFileSnapshotMock).not.toHaveBeenCalled();
  });

  it("does not run stale Matrix cleanup on the happy path", async () => {
    const cfg = { plugins: {} } as ChainbreakerConfig;
    loadConfigMock.mockReturnValue(cfg);

    expect(cleanStaleMatrixPluginConfigMock).not.toHaveBeenCalled();
    expect(result).toBe(cfg);
  });

  it("falls back to snapshot config for explicit Matrix reinstall when issues match the known upgrade failure", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    const snapshotCfg = {
    } as unknown as ChainbreakerConfig;
    readConfigFileSnapshotMock.mockResolvedValue(
      makeSnapshot({
        config: snapshotCfg,
        issues: [
          { path: "plugins.load.paths", message: "plugin: plugin path not found: /gone" },
        ],
      }),
    );

    expect(readConfigFileSnapshotMock).toHaveBeenCalled();
    expect(cleanStaleMatrixPluginConfigMock).toHaveBeenCalledWith(snapshotCfg);
    expect(result).toBe(snapshotCfg);
  });

  it("allows explicit repo-checkout Matrix reinstall recovery", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    const snapshotCfg = { plugins: {} } as ChainbreakerConfig;
    readConfigFileSnapshotMock.mockResolvedValue(
      makeSnapshot({
        config: snapshotCfg,
      }),
    );

    const result = await loadConfigForInstall({
      rawSpec: MATRIX_REPO_INSTALL_SPEC,
      normalizedSpec: MATRIX_REPO_INSTALL_SPEC,
    });
    expect(result).toBe(snapshotCfg);
  });

  it("rejects unrelated invalid config even during Matrix reinstall", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    readConfigFileSnapshotMock.mockResolvedValue(
      makeSnapshot({
        issues: [{ path: "models.default", message: "invalid model ref" }],
      }),
    );

      "Config invalid outside the Matrix upgrade recovery path",
    );
  });

  it("rejects non-Matrix install requests when config is invalid", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    await expect(
      loadConfigForInstall({
        rawSpec: "alpha",
        normalizedSpec: "alpha",
      }),
    ).rejects.toThrow("Config invalid; run `chainbreaker doctor --fix` before installing plugins.");
    expect(readConfigFileSnapshotMock).not.toHaveBeenCalled();
  });

  it("throws when loadConfig fails with INVALID_CONFIG and snapshot parsed is empty", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    readConfigFileSnapshotMock.mockResolvedValue(
      makeSnapshot({
        parsed: {},
        config: {} as ChainbreakerConfig,
      }),
    );

      "Config file could not be parsed; run `chainbreaker doctor` to repair it.",
    );
  });

  it("throws when loadConfig fails with INVALID_CONFIG and config file does not exist", async () => {
    const invalidConfigErr = new Error("config invalid");
    (invalidConfigErr as { code?: string }).code = "INVALID_CONFIG";
    loadConfigMock.mockImplementation(() => {
      throw invalidConfigErr;
    });

    readConfigFileSnapshotMock.mockResolvedValue(makeSnapshot({ exists: false, parsed: {} }));

      "Config file could not be parsed; run `chainbreaker doctor` to repair it.",
    );
  });

  it("re-throws non-config errors from loadConfig", async () => {
    const fsErr = new Error("EACCES: permission denied");
    (fsErr as { code?: string }).code = "EACCES";
    loadConfigMock.mockImplementation(() => {
      throw fsErr;
    });

      "EACCES: permission denied",
    );
    expect(readConfigFileSnapshotMock).not.toHaveBeenCalled();
  });
});
