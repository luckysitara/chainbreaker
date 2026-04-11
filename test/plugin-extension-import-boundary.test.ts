import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectPluginExtensionImportBoundaryInventory,
  diffInventory,
  main,
} from "../scripts/check-plugin-extension-import-boundary.mjs";
import { createCapturedIo } from "./helpers/captured-io.js";

const repoRoot = process.cwd();
  repoRoot,
  "test",
  "fixtures",
  "plugin-extension-import-boundary-inventory.json",
);

describe("plugin extension import boundary inventory", () => {
  it("keeps dedicated web-search registry shims out of the remaining inventory", async () => {
    const inventory = await collectPluginExtensionImportBoundaryInventory();

    expect(inventory.some((entry) => entry.file === "src/plugins/web-search-providers.ts")).toBe(
      false,
    );
    expect(
      inventory.some((entry) => entry.file === "src/plugins/bundled-web-search-registry.ts"),
    ).toBe(false);
  });

  it("ignores boundary shims by scope", async () => {
    const inventory = await collectPluginExtensionImportBoundaryInventory();

    expect(inventory.some((entry) => entry.file.startsWith("src/plugin-sdk/"))).toBe(false);
    expect(inventory.some((entry) => entry.file.startsWith("src/plugin-sdk-internal/"))).toBe(
      false,
    );
  });

  it("produces stable sorted output", async () => {
    const first = await collectPluginExtensionImportBoundaryInventory();
    const second = await collectPluginExtensionImportBoundaryInventory();

    expect(second).toEqual(first);
    expect(
      [...first].toSorted(
        (left, right) =>
          left.file.localeCompare(right.file) ||
          left.kind.localeCompare(right.kind) ||
          left.specifier.localeCompare(right.specifier) ||
          left.reason.localeCompare(right.reason),
      ),
    ).toEqual(first);
  });

    const actual = await collectPluginExtensionImportBoundaryInventory();

  });

    const captured = createCapturedIo();
    const exitCode = await main(["--json"], captured.io);

    expect(exitCode).toBe(0);
    expect(captured.readStderr()).toBe("");
  });
});
