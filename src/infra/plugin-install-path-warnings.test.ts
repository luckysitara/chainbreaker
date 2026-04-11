import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repoInstallSpec } from "../../test/helpers/bundled-plugin-paths.js";
import { withTempHome } from "../../test/helpers/temp-home.js";
import {
  detectPluginInstallPathIssue,
  formatPluginInstallPathIssue,
} from "./plugin-install-path-warnings.js";

async function detectMatrixCustomPathIssue(sourcePath: string | ((pluginPath: string) => string)) {
  return withTempHome(async (home) => {
    await fs.mkdir(pluginPath, { recursive: true });
    const resolvedSourcePath =
      typeof sourcePath === "function" ? sourcePath(pluginPath) : sourcePath;
    const issue = await detectPluginInstallPathIssue({
      install: {
        source: "path",
        sourcePath: resolvedSourcePath,
        installPath: pluginPath,
      },
    });

    return { issue, pluginPath };
  });
}


describe("plugin install path warnings", () => {
  it("ignores non-path installs and blank path candidates", async () => {
    expect(
      await detectPluginInstallPathIssue({
        install: null,
      }),
    ).toBeNull();
    expect(
      await detectPluginInstallPathIssue({
        install: {
          source: "npm",
          sourcePath: " ",
          installPath: " ",
        },
      }),
    ).toBeNull();
  });

  it("detects stale custom plugin install paths", async () => {
    const issue = await detectPluginInstallPathIssue({
      install: {
        source: "path",
      },
    });

    expect(issue).toEqual({
      kind: "missing-path",
    });
    expect(
      formatPluginInstallPathIssue({
        issue: issue!,
        pluginLabel: "Matrix",
        repoInstallCommand: MATRIX_REPO_INSTALL_COMMAND,
      }),
    ).toEqual([
      `If you are running from a repo checkout, you can also use "${MATRIX_REPO_INSTALL_COMMAND}".`,
    ]);
  });

  it("uses the second candidate path when the first one is stale", async () => {
    const { issue, pluginPath } = await detectMatrixCustomPathIssue(
    );
    expect(issue).toEqual({
      kind: "custom-path",
      path: pluginPath,
    });
  });

  it("detects active custom plugin install paths", async () => {
    const { issue, pluginPath } = await detectMatrixCustomPathIssue(
      (resolvedPluginPath) => resolvedPluginPath,
    );
    expect(issue).toEqual({
      kind: "custom-path",
      path: pluginPath,
    });
  });

  it("applies custom command formatting in warning messages", () => {
    expect(
      formatPluginInstallPathIssue({
        issue: {
          kind: "custom-path",
        },
        pluginLabel: "Matrix",
        repoInstallCommand: MATRIX_REPO_INSTALL_COMMAND,
        formatCommand: (command) => `<${command}>`,
      }),
    ).toEqual([
      "Main updates will not automatically replace that plugin with the repo's default Matrix package.",
      `If you are intentionally running from a repo checkout, reinstall that checkout explicitly with "<${MATRIX_REPO_INSTALL_COMMAND}>" after updates.`,
    ]);
  });

  it("omits repo checkout guidance when no bundled source hint exists", () => {
    expect(
      formatPluginInstallPathIssue({
        issue: {
          kind: "missing-path",
        },
        pluginLabel: "Matrix",
        repoInstallCommand: null,
      }),
    ).toEqual([
    ]);
  });
});
