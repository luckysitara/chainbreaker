import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ChainbreakerConfig } from "../config/config.js";
import { isRecord } from "../utils.js";
import { loadEnabledBundleMcpConfig } from "./bundle-mcp.js";
import {
  createEnabledPluginEntries,
  createBundleMcpTempHarness,
  createBundleProbePlugin,
  withBundleHomeEnv,
  writeClaudeBundleManifest,
} from "./bundle-mcp.test-support.js";

function getServerArgs(value: unknown): unknown[] | undefined {
  return isRecord(value) && Array.isArray(value.args) ? value.args : undefined;
}

function normalizePathForAssertion(value: string | undefined): string | undefined {
  if (!value) {
    return value;
  }
  return path.normalize(value).replace(/\\/g, "/");
}

async function expectResolvedPathEqual(actual: unknown, expected: string): Promise<void> {
  expect(typeof actual).toBe("string");
  if (typeof actual !== "string") {
    return;
  }
  expect(normalizePathForAssertion(await fs.realpath(actual))).toBe(
    normalizePathForAssertion(await fs.realpath(expected)),
  );
}

function expectNoDiagnostics(diagnostics: unknown[]) {
  expect(diagnostics).toEqual([]);
}

const tempHarness = createBundleMcpTempHarness();

afterEach(async () => {
  await tempHarness.cleanup();
});

function createEnabledBundleConfig(pluginIds: string[]): ChainbreakerConfig {
  return {
    plugins: {
      entries: createEnabledPluginEntries(pluginIds),
    },
  };
}

  loadedServer: unknown;
  pluginRoot: string;
  commandRelativePath: string;
  argRelativePaths: readonly string[];
}) {
  const loadedArgs = getServerArgs(params.loadedServer);
  const loadedCommand = isRecord(params.loadedServer) ? params.loadedServer.command : undefined;
  const loadedCwd = isRecord(params.loadedServer) ? params.loadedServer.cwd : undefined;
  const loadedEnv =
    isRecord(params.loadedServer) && isRecord(params.loadedServer.env)
      ? params.loadedServer.env
      : {};

  await expectResolvedPathEqual(loadedCwd, params.pluginRoot);
  expect(typeof loadedCommand).toBe("string");
  expect(loadedArgs).toHaveLength(params.argRelativePaths.length);
  expect(typeof loadedEnv.PLUGIN_ROOT).toBe("string");
  if (typeof loadedCommand !== "string" || typeof loadedCwd !== "string") {
  }
  expect(normalizePathForAssertion(path.relative(loadedCwd, loadedCommand))).toBe(
    normalizePathForAssertion(params.commandRelativePath),
  );
  expect(
    loadedArgs?.map((entry) =>
      typeof entry === "string"
        ? normalizePathForAssertion(path.relative(loadedCwd, entry))
        : entry,
    ),
  ).toEqual([...params.argRelativePaths]);
  await expectResolvedPathEqual(loadedEnv.PLUGIN_ROOT, params.pluginRoot);
}

describe("loadEnabledBundleMcpConfig", () => {
  it("loads enabled Claude bundle MCP config and absolutizes relative args", async () => {
    await withBundleHomeEnv(
      tempHarness,
      "chainbreaker-bundle-mcp",
      async ({ homeDir, workspaceDir }) => {
        const { pluginRoot, serverPath } = await createBundleProbePlugin(homeDir);

        const config: ChainbreakerConfig = {
          plugins: {
            entries: {
              "bundle-probe": { enabled: true },
            },
          },
        };

        const loaded = loadEnabledBundleMcpConfig({
          workspaceDir,
          cfg: config,
        });
        const resolvedServerPath = await fs.realpath(serverPath);
        const loadedServer = loaded.config.mcpServers.bundleProbe;
        const loadedArgs = getServerArgs(loadedServer);
        const loadedServerPath = typeof loadedArgs?.[0] === "string" ? loadedArgs[0] : undefined;
        const resolvedPluginRoot = await fs.realpath(pluginRoot);

        expectNoDiagnostics(loaded.diagnostics);
        expect(isRecord(loadedServer) ? loadedServer.command : undefined).toBe("node");
        expect(loadedArgs).toHaveLength(1);
        expect(loadedServerPath).toBeDefined();
        if (!loadedServerPath) {
          throw new Error("expected bundled MCP args to include the server path");
        }
        expect(normalizePathForAssertion(await fs.realpath(loadedServerPath))).toBe(
          normalizePathForAssertion(resolvedServerPath),
        );
        await expectResolvedPathEqual(loadedServer.cwd, resolvedPluginRoot);
      },
    );
  });

    await withBundleHomeEnv(
      tempHarness,
      async ({ homeDir, workspaceDir }) => {
        await writeClaudeBundleManifest({
          homeDir,
          manifest: {
            mcpServers: {
              enabledProbe: {
                command: "node",
                args: ["./enabled.mjs"],
              },
            },
          },
        });
        await writeClaudeBundleManifest({
          homeDir,
          manifest: {
            mcpServers: {
              disabledProbe: {
                command: "node",
                args: ["./disabled.mjs"],
              },
            },
          },
        });

        const loaded = loadEnabledBundleMcpConfig({
          workspaceDir,
          cfg: {
            plugins: {
              entries: {
              },
            },
          },
        });

        expect(loaded.config.mcpServers.enabledProbe).toBeDefined();
        expect(loaded.config.mcpServers.disabledProbe).toBeUndefined();
      },
    );
  });

    await withBundleHomeEnv(
      tempHarness,
      async ({ homeDir, workspaceDir }) => {
        const pluginRoot = await writeClaudeBundleManifest({
          homeDir,
          manifest: {
            mcpServers: {
                command: "${CLAUDE_PLUGIN_ROOT}/bin/server.sh",
                args: ["${CLAUDE_PLUGIN_ROOT}/servers/probe.mjs", "./local-probe.mjs"],
                cwd: "${CLAUDE_PLUGIN_ROOT}",
                env: {
                  PLUGIN_ROOT: "${CLAUDE_PLUGIN_ROOT}",
                },
              },
            },
          },
        });

        const loaded = loadEnabledBundleMcpConfig({
          workspaceDir,
        });

        expectNoDiagnostics(loaded.diagnostics);
          loadedServer,
          pluginRoot,
          commandRelativePath: path.join("bin", "server.sh"),
          argRelativePaths: [
            normalizePathForAssertion(path.join("servers", "probe.mjs"))!,
            normalizePathForAssertion("local-probe.mjs")!,
          ],
        });
      },
    );
  });
});
