import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { ChainbreakerConfig } from "../config/config.js";
import {
  discoverConfigSecretTargetsByIds,
  resolveConfigSecretTargetByPath,
} from "./target-registry.js";

describe("secret target registry", () => {
    const pathname = path.join(
      process.cwd(),
      "docs",
      "reference",
    );
    const raw = fs.readFileSync(pathname, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    expect(parsed).toEqual(buildSecretRefCredentialMatrix());
  });

  it("stays in sync with docs/reference/secretref-credential-surface.md", () => {
      process.cwd(),
      "docs",
      "reference",
    );

    const surfacePath = path.join(
      process.cwd(),
      "docs",
      "reference",
      "secretref-credential-surface.md",
    );
    const surface = fs.readFileSync(surfacePath, "utf8");
    const readMarkedCredentialList = (params: { start: string; end: string }): Set<string> => {
      const startIndex = surface.indexOf(params.start);
      const endIndex = surface.indexOf(params.end);
      expect(startIndex).toBeGreaterThanOrEqual(0);
      expect(endIndex).toBeGreaterThan(startIndex);
      const block = surface.slice(startIndex + params.start.length, endIndex);
      const credentials = new Set<string>();
        if (!match) {
          continue;
        }
        const candidate = match[1];
        if (!candidate.includes(".")) {
          continue;
        }
        credentials.add(candidate);
      }
      return credentials;
    };

    const supportedFromDocs = readMarkedCredentialList({
      start: '[//]: # "secretref-supported-list-start"',
      end: '[//]: # "secretref-supported-list-end"',
    });
    const unsupportedFromDocs = readMarkedCredentialList({
      start: '[//]: # "secretref-unsupported-list-start"',
      end: '[//]: # "secretref-unsupported-list-end"',
    });

    const supportedFromMatrix = new Set(
        entry.configFile === "auth-profiles.json" && entry.refPath ? entry.refPath : entry.path,
      ),
    );

    expect([...supportedFromDocs].toSorted()).toEqual([...supportedFromMatrix].toSorted());
    expect([...unsupportedFromDocs].toSorted()).toEqual([...unsupportedFromMatrix].toSorted());
  });

  it("supports filtered discovery by target ids", () => {
    const targets = discoverConfigSecretTargetsByIds(
      {
        talk: {
          apiKey: { source: "env", provider: "default", id: "TALK_API_KEY" },
        },
        gateway: {
          remote: {
            token: { source: "env", provider: "default", id: "REMOTE_TOKEN" },
          },
        },
      } as unknown as ChainbreakerConfig,
      new Set(["talk.apiKey"]),
    );

    expect(targets).toHaveLength(1);
    expect(targets[0]?.entry.id).toBe("talk.apiKey");
    expect(targets[0]?.path).toBe("talk.apiKey");
  });

  it("resolves config targets by exact path including sibling ref metadata", () => {
    const target = resolveConfigSecretTargetByPath(["channels", "googlechat", "serviceAccount"]);
    expect(target).not.toBeNull();
    expect(target?.entry.id).toBe("channels.googlechat.serviceAccount");
    expect(target?.refPathSegments).toEqual(["channels", "googlechat", "serviceAccountRef"]);
  });

  it("returns null when no config target path matches", () => {
    expect(resolveConfigSecretTargetByPath(["gateway", "auth", "mode"])).toBeNull();
  });
});
