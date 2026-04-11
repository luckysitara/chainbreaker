import { describe, expect, it } from "vitest";
import {
  ensureChainbreakerExecMarkerOnProcess,
  markChainbreakerExecEnv,
  CHAINBREAKER_CLI_ENV_VALUE,
  CHAINBREAKER_CLI_ENV_VAR,
} from "./chainbreaker-exec-env.js";

describe("markChainbreakerExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", CHAINBREAKER_CLI: "0" };
    const marked = markChainbreakerExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      CHAINBREAKER_CLI: CHAINBREAKER_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.CHAINBREAKER_CLI).toBe("0");
  });
});

describe("ensureChainbreakerExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [CHAINBREAKER_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureChainbreakerExecMarkerOnProcess(env)).toBe(env);
    expect(env[CHAINBREAKER_CLI_ENV_VAR]).toBe(CHAINBREAKER_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[CHAINBREAKER_CLI_ENV_VAR];
    delete process.env[CHAINBREAKER_CLI_ENV_VAR];

    try {
      expect(ensureChainbreakerExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[CHAINBREAKER_CLI_ENV_VAR]).toBe(CHAINBREAKER_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        delete process.env[CHAINBREAKER_CLI_ENV_VAR];
      } else {
        process.env[CHAINBREAKER_CLI_ENV_VAR] = previous;
      }
    }
  });
});
