import { describe, expect, it } from "vitest";
import { listBundledPluginPackArtifacts } from "../scripts/lib/bundled-plugin-build-entries.mjs";
import { listPluginSdkDistArtifacts } from "../scripts/lib/plugin-sdk-entries.mjs";
import {
  collectAppcastSparkleVersionErrors,
  collectBundledExtensionManifestErrors,
  collectBundledExtensionRootDependencyMirrorErrors,
  collectForbiddenPackPaths,
  collectMissingPackPaths,
  collectPackUnpackedSizeErrors,
} from "../scripts/release-check.ts";
import { bundledDistPluginFile, bundledPluginFile } from "./helpers/bundled-plugin-paths.js";

function makeItem(shortVersion: string, sparkleVersion: string): string {
  return `<item><title>${shortVersion}</title><sparkle:shortVersionString>${shortVersion}</sparkle:shortVersionString><sparkle:version>${sparkleVersion}</sparkle:version></item>`;
}

function makePackResult(filename: string, unpackedSize: number) {
  return { filename, unpackedSize };
}

const requiredPluginSdkPackPaths = [...listPluginSdkDistArtifacts(), "dist/plugin-sdk/compat.js"];
const requiredBundledPluginPackPaths = listBundledPluginPackArtifacts();

describe("collectAppcastSparkleVersionErrors", () => {
  it("accepts legacy 9-digit calver builds before lane-floor cutover", () => {
    const xml = `<rss><channel>${makeItem("2026.2.26", "202602260")}</channel></rss>`;

    expect(collectAppcastSparkleVersionErrors(xml)).toEqual([]);
  });

  it("requires lane-floor builds on and after lane-floor cutover", () => {
    const xml = `<rss><channel>${makeItem("2026.3.1", "202603010")}</channel></rss>`;

    expect(collectAppcastSparkleVersionErrors(xml)).toEqual([
      "appcast item '2026.3.1' has sparkle:version 202603010 below lane floor 2026030190.",
    ]);
  });

  it("accepts canonical stable lane builds on and after lane-floor cutover", () => {
    const xml = `<rss><channel>${makeItem("2026.3.1", "2026030190")}</channel></rss>`;

    expect(collectAppcastSparkleVersionErrors(xml)).toEqual([]);
  });
});

describe("collectBundledExtensionManifestErrors", () => {
  it("flags invalid bundled extension install metadata", () => {
    expect(
      collectBundledExtensionManifestErrors([
        {
          id: "broken",
          packageJson: {
            chainbreaker: {
              install: { npmSpec: "   " },
            },
          },
        },
      ]),
    ).toEqual([
      "bundled extension 'broken' manifest invalid | chainbreaker.install.npmSpec must be a non-empty string",
    ]);
  });

  it("flags invalid bundled extension minHostVersion metadata", () => {
    expect(
      collectBundledExtensionManifestErrors([
        {
          id: "broken",
          packageJson: {
            chainbreaker: {
              install: { npmSpec: "@chainbreaker/broken", minHostVersion: "2026.3.14" },
            },
          },
        },
      ]),
    ).toEqual([
      "bundled extension 'broken' manifest invalid | chainbreaker.install.minHostVersion must use a semver floor in the form \">=x.y.z\"",
    ]);
  });

  it("allows install metadata without npmSpec when only non-publish metadata is present", () => {
    expect(
      collectBundledExtensionManifestErrors([
        {
          id: "irc",
          packageJson: {
            chainbreaker: {
              install: { minHostVersion: ">=2026.3.14" },
            },
          },
        },
      ]),
    ).toEqual([]);
  });

  it("flags non-object install metadata instead of throwing", () => {
    expect(
      collectBundledExtensionManifestErrors([
        {
          id: "broken",
          packageJson: {
            chainbreaker: {
              install: 123,
            },
          },
        },
      ]),
    ).toEqual([
      "bundled extension 'broken' manifest invalid | chainbreaker.install must be an object",
    ]);
  });
});

describe("collectBundledExtensionRootDependencyMirrorErrors", () => {
  it("flags a non-array mirror allowlist", () => {
    expect(
      collectBundledExtensionRootDependencyMirrorErrors(
        [
          {
            packageJson: {
              chainbreaker: {
                releaseChecks: {
                  rootDependencyMirrorAllowlist: true,
                },
              },
            },
          },
        ],
        new Map(),
      ),
    ).toEqual([
    ]);
  });

  it("flags mirror entries missing from extension runtime dependencies", () => {
    expect(
      collectBundledExtensionRootDependencyMirrorErrors(
        [
          {
            packageJson: {
              dependencies: {
              },
              chainbreaker: {
                releaseChecks: {
                },
              },
            },
          },
        ],
      ),
    ).toEqual([
    ]);
  });

  it("flags mirror entries missing from root runtime dependencies", () => {
    expect(
      collectBundledExtensionRootDependencyMirrorErrors(
        [
          {
            packageJson: {
              dependencies: {
              },
              chainbreaker: {
                releaseChecks: {
                },
              },
            },
          },
        ],
        new Map(),
      ),
    ).toEqual([
    ]);
  });

  it("flags mirror entries whose root version drifts from the extension", () => {
    expect(
      collectBundledExtensionRootDependencyMirrorErrors(
        [
          {
            packageJson: {
              dependencies: {
              },
              chainbreaker: {
                releaseChecks: {
                },
              },
            },
          },
        ],
      ),
    ).toEqual([
    ]);
  });

  it("accepts mirror entries declared by both the extension and root package", () => {
    expect(
      collectBundledExtensionRootDependencyMirrorErrors(
        [
          {
            packageJson: {
              dependencies: {
              },
              chainbreaker: {
                releaseChecks: {
                },
              },
            },
          },
        ],
      ),
    ).toEqual([]);
  });
});

describe("collectForbiddenPackPaths", () => {
  it("allows bundled plugin runtime deps under dist/extensions but still blocks other node_modules", () => {
    expect(
      collectForbiddenPackPaths([
        "dist/index.js",
        bundledPluginFile("tlon", "node_modules/.bin/tlon"),
        "node_modules/.bin/chainbreaker",
      ]),
    ).toEqual([
      bundledPluginFile("tlon", "node_modules/.bin/tlon"),
      "node_modules/.bin/chainbreaker",
    ]);
  });
});

describe("collectMissingPackPaths", () => {
  it("requires the shipped channel catalog, control ui, and optional bundled metadata", () => {
    const missing = collectMissingPackPaths([
      "dist/index.js",
      "dist/entry.js",
      "dist/plugin-sdk/compat.js",
      "dist/plugin-sdk/index.js",
      "dist/plugin-sdk/index.d.ts",
      "dist/plugin-sdk/root-alias.cjs",
      "dist/build-info.json",
    ]);

    expect(missing).toEqual(
      expect.arrayContaining([
        "dist/channel-catalog.json",
        "dist/control-ui/index.html",
        "scripts/npm-runner.mjs",
        "scripts/postinstall-bundled-plugins.mjs",
        bundledDistPluginFile("whatsapp", "light-runtime-api.js"),
        bundledDistPluginFile("whatsapp", "runtime-api.js"),
        bundledDistPluginFile("whatsapp", "chainbreaker.plugin.json"),
        bundledDistPluginFile("whatsapp", "package.json"),
      ]),
    );
  });

  it("accepts the shipped upgrade surface when optional bundled metadata is present", () => {
    expect(
      collectMissingPackPaths([
        "dist/index.js",
        "dist/entry.js",
        "dist/control-ui/index.html",
        ...requiredBundledPluginPackPaths,
        ...requiredPluginSdkPackPaths,
        "scripts/npm-runner.mjs",
        "scripts/postinstall-bundled-plugins.mjs",
        "dist/plugin-sdk/root-alias.cjs",
        "dist/build-info.json",
        "dist/channel-catalog.json",
      ]),
    ).toEqual([]);
  });

  it("requires bundled plugin runtime sidecars that dynamic plugin boundaries resolve at runtime", () => {
    expect(requiredBundledPluginPackPaths).toEqual(
      expect.arrayContaining([
        bundledDistPluginFile("whatsapp", "light-runtime-api.js"),
        bundledDistPluginFile("whatsapp", "runtime-api.js"),
      ]),
    );
  });
});

describe("collectPackUnpackedSizeErrors", () => {
  it("accepts pack results within the unpacked size budget", () => {
    expect(
      collectPackUnpackedSizeErrors([makePackResult("chainbreaker-2026.3.14.tgz", 120_354_302)]),
    ).toEqual([]);
  });

  it("flags oversized pack results that risk low-memory startup failures", () => {
    expect(
      collectPackUnpackedSizeErrors([makePackResult("chainbreaker-2026.3.12.tgz", 224_002_564)]),
    ).toEqual([
      "chainbreaker-2026.3.12.tgz unpackedSize 224002564 bytes (213.6 MiB) exceeds budget 200278016 bytes (191.0 MiB). Investigate duplicate channel shims, copied extension trees, or other accidental pack bloat before release.",
    ]);
  });

  it("fails closed when npm pack output omits unpackedSize for every result", () => {
    expect(
      collectPackUnpackedSizeErrors([
        { filename: "chainbreaker-2026.3.14.tgz" },
        { filename: "chainbreaker-extra.tgz", unpackedSize: Number.NaN },
      ]),
    ).toEqual([
      "npm pack --dry-run produced no unpackedSize data; pack size budget was not verified.",
    ]);
  });
});
