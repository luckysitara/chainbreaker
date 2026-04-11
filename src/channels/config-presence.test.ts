import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ChainbreakerConfig } from "../config/config.js";
import {
  hasMeaningfulChannelConfig,
  hasPotentialConfiguredChannels,
  listPotentialConfiguredChannelIds,
} from "./config-presence.js";

const tempDirs: string[] = [];

function makeTempStateDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "chainbreaker-channel-config-presence-"));
  tempDirs.push(dir);
  return dir;
}

function expectPotentialConfiguredChannelCase(params: {
  cfg: ChainbreakerConfig;
  env: NodeJS.ProcessEnv;
  expectedIds: string[];
  expectedConfigured: boolean;
}) {
  expect(listPotentialConfiguredChannelIds(params.cfg, params.env)).toEqual(params.expectedIds);
  expect(hasPotentialConfiguredChannels(params.cfg, params.env)).toBe(params.expectedConfigured);
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("config presence", () => {
  it("treats enabled-only channel sections as not meaningfully configured", () => {
    expect(hasMeaningfulChannelConfig({ enabled: false })).toBe(false);
    expect(hasMeaningfulChannelConfig({ enabled: true })).toBe(false);
    expect(hasMeaningfulChannelConfig({})).toBe(false);
  });

    const stateDir = makeTempStateDir();
    const env = { CHAINBREAKER_STATE_DIR: stateDir } as NodeJS.ProcessEnv;

    expectPotentialConfiguredChannelCase({
      cfg,
      env,
      expectedIds: [],
      expectedConfigured: false,
    });
  });
});
