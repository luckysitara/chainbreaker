import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "chainbreaker",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "chainbreaker", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "chainbreaker",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "chainbreaker",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "chainbreaker", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "chainbreaker", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "chainbreaker", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "chainbreaker", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs([
      "node",
      "chainbreaker",
      "status",
      "--profile",
      "work",
      "--deep",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "chainbreaker", "status", "--deep"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "chainbreaker", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "chainbreaker", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "chainbreaker", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "chainbreaker", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "chainbreaker", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "chainbreaker", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".chainbreaker-dev");
    expect(env.CHAINBREAKER_PROFILE).toBe("dev");
    expect(env.CHAINBREAKER_STATE_DIR).toBe(expectedStateDir);
    expect(env.CHAINBREAKER_CONFIG_PATH).toBe(path.join(expectedStateDir, "chainbreaker.json"));
    expect(env.CHAINBREAKER_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      CHAINBREAKER_STATE_DIR: "/custom",
      CHAINBREAKER_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.CHAINBREAKER_STATE_DIR).toBe("/custom");
    expect(env.CHAINBREAKER_GATEWAY_PORT).toBe("19099");
    expect(env.CHAINBREAKER_CONFIG_PATH).toBe(path.join("/custom", "chainbreaker.json"));
  });

  it("uses CHAINBREAKER_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      CHAINBREAKER_HOME: "/srv/chainbreaker-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/chainbreaker-home");
    expect(env.CHAINBREAKER_STATE_DIR).toBe(path.join(resolvedHome, ".chainbreaker-work"));
    expect(env.CHAINBREAKER_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".chainbreaker-work", "chainbreaker.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "chainbreaker doctor --fix",
      env: {},
      expected: "chainbreaker doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "chainbreaker doctor --fix",
      env: { CHAINBREAKER_PROFILE: "default" },
      expected: "chainbreaker doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "chainbreaker doctor --fix",
      env: { CHAINBREAKER_PROFILE: "Default" },
      expected: "chainbreaker doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "chainbreaker doctor --fix",
      env: { CHAINBREAKER_PROFILE: "bad profile" },
      expected: "chainbreaker doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "chainbreaker --profile work doctor --fix",
      env: { CHAINBREAKER_PROFILE: "work" },
      expected: "chainbreaker --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "chainbreaker --dev doctor",
      env: { CHAINBREAKER_PROFILE: "dev" },
      expected: "chainbreaker --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("chainbreaker doctor --fix", { CHAINBREAKER_PROFILE: "work" })).toBe(
      "chainbreaker --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(
      formatCliCommand("chainbreaker doctor --fix", { CHAINBREAKER_PROFILE: "  jbchainbreaker  " }),
    ).toBe("chainbreaker --profile jbchainbreaker doctor --fix");
  });

  it("handles command with no args after chainbreaker", () => {
    expect(formatCliCommand("chainbreaker", { CHAINBREAKER_PROFILE: "test" })).toBe(
      "chainbreaker --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm chainbreaker doctor", { CHAINBREAKER_PROFILE: "work" })).toBe(
      "pnpm chainbreaker --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("chainbreaker gateway status --deep", {
        CHAINBREAKER_CONTAINER_HINT: "demo",
      }),
    ).toBe("chainbreaker --container demo gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("chainbreaker doctor", {
        CHAINBREAKER_CONTAINER_HINT: "demo",
        CHAINBREAKER_PROFILE: "work",
      }),
    ).toBe("chainbreaker --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("chainbreaker update", { CHAINBREAKER_CONTAINER_HINT: "demo" })).toBe(
      "chainbreaker update",
    );
    expect(
      formatCliCommand("pnpm chainbreaker update --channel beta", {
        CHAINBREAKER_CONTAINER_HINT: "demo",
      }),
    ).toBe("pnpm chainbreaker update --channel beta");
  });
});
