import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  renderBundledRootHelpText,
  writeCliStartupMetadata,
} from "../../scripts/write-cli-startup-metadata.ts";

function createTempDir(prefix: string): string {
  return mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe("write-cli-startup-metadata", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("captures async root help bundle output", async () => {
    const distDir = createTempDir("chainbreaker-root-help-");
    tempDirs.push(distDir);
    writeFileSync(
      path.join(distDir, "root-help-async.js"),
      [
        "export async function outputRootHelp() {",
        "  await Promise.resolve();",
        "  process.stdout.write('Chainbreaker help\\n');",
        "}",
        "",
      ].join("\n"),
      "utf8",
    );

    await expect(renderBundledRootHelpText(distDir)).resolves.toBe("Chainbreaker help\n");
  });

  it("writes startup metadata with populated root help text", async () => {
    const tempRoot = createTempDir("chainbreaker-startup-metadata-");
    tempDirs.push(tempRoot);
    const distDir = path.join(tempRoot, "dist");
    const extensionsDir = path.join(tempRoot, "extensions");
    const outputPath = path.join(distDir, "cli-startup-metadata.json");

    mkdirSync(distDir, { recursive: true });
    writeFileSync(
      path.join(distDir, "root-help-fixture.js"),
      "export async function outputRootHelp() { process.stdout.write('Usage: chainbreaker\\n'); }\n",
      "utf8",
    );
    writeFileSync(
      JSON.stringify({
        chainbreaker: {
          channel: {
            order: 120,
            label: "Matrix",
          },
        },
      }),
      "utf8",
    );

    await writeCliStartupMetadata({ distDir, outputPath, extensionsDir });

    const written = JSON.parse(readFileSync(outputPath, "utf8")) as {
      channelOptions: string[];
      rootHelpText: string;
    };
    expect(written.rootHelpText).toBe("Usage: chainbreaker\n");
  });
});
