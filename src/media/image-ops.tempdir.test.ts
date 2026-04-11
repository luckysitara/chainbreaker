import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePreferredChainbreakerTmpDir } from "../infra/tmp-chainbreaker-dir.js";

describe("image-ops temp dir", () => {
  let createdTempDir = "";

  beforeEach(() => {
    process.env.CHAINBREAKER_IMAGE_BACKEND = "sips";
    const originalMkdtemp = fs.mkdtemp.bind(fs);
    vi.spyOn(fs, "mkdtemp").mockImplementation(async (prefix) => {
      createdTempDir = await originalMkdtemp(prefix);
      return createdTempDir;
    });
  });

  afterEach(() => {
    delete process.env.CHAINBREAKER_IMAGE_BACKEND;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("creates sips temp dirs under the secured Chainbreaker tmp root", async () => {
    const { getImageMetadata } = await import("./image-ops.js");
    const secureRoot = resolvePreferredChainbreakerTmpDir();

    await getImageMetadata(Buffer.from("image"));

    expect(fs.mkdtemp).toHaveBeenCalledTimes(1);
    expect(fs.mkdtemp).toHaveBeenCalledWith(path.join(secureRoot, "chainbreaker-img-"));
    expect(createdTempDir.startsWith(path.join(secureRoot, "chainbreaker-img-"))).toBe(true);
    await expect(fs.access(createdTempDir)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
