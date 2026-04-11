import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredChainbreakerTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredChainbreakerTmpDir: ReturnType<typeof vi.fn>;
}> {
  vi.resetModules();
  const resolvePreferredChainbreakerTmpDir =
    params?.resolvePreferredChainbreakerTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredChainbreakerTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-chainbreaker-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-chainbreaker-dir.js")>(
      "../infra/tmp-chainbreaker-dir.js",
    );
    return {
      ...actual,
      resolvePreferredChainbreakerTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await import("./logger.js");
  return { module, resolvePreferredChainbreakerTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../infra/tmp-chainbreaker-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredChainbreakerTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredChainbreakerTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/chainbreaker");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/chainbreaker/chainbreaker.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredChainbreakerTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toMatchObject({
      level: "silent",
      file: "/tmp/chainbreaker/chainbreaker.log",
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(() => module.getLogger().info("browser-safe")).not.toThrow();
    expect(resolvePreferredChainbreakerTmpDir).not.toHaveBeenCalled();
  });
});
