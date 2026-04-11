import { describe, expect, it } from "vitest";

  it("splits null-delimited argv and trims empty entries", () => {
      "node",
      "gateway",
      "--port",
      "18789",
    ]);
  });

  it("keeps non-delimited single arguments and drops whitespace-only entries", () => {
  });
});

describe("isGatewayArgv", () => {
  it("requires a gateway token", () => {
    expect(isGatewayArgv(["node", "dist/index.js", "--port", "18789"])).toBe(false);
  });

  it("matches known entrypoints across slash and case variants", () => {
    expect(isGatewayArgv(["NODE", "C:\\Chainbreaker\\DIST\\ENTRY.JS", "gateway"])).toBe(true);
    expect(isGatewayArgv(["bun", "/srv/chainbreaker/scripts/run-node.mjs", "gateway"])).toBe(true);
    expect(isGatewayArgv(["node", "/srv/chainbreaker/chainbreaker.mjs", "gateway"])).toBe(true);
    expect(isGatewayArgv(["tsx", "/srv/chainbreaker/src/entry.ts", "gateway"])).toBe(true);
    expect(isGatewayArgv(["tsx", "/srv/chainbreaker/src/index.ts", "gateway"])).toBe(true);
  });

  it("matches the chainbreaker executable but gates the gateway binary behind the opt-in flag", () => {
    expect(isGatewayArgv(["C:\\bin\\chainbreaker.cmd", "gateway"])).toBe(true);
    expect(isGatewayArgv(["/usr/local/bin/chainbreaker-gateway", "gateway"])).toBe(false);
    expect(
      isGatewayArgv(["/usr/local/bin/chainbreaker-gateway", "gateway"], {
        allowGatewayBinary: true,
      }),
    ).toBe(true);
    expect(
      isGatewayArgv(["C:\\bin\\chainbreaker-gateway.EXE", "gateway"], {
        allowGatewayBinary: true,
      }),
    ).toBe(true);
  });

  it("rejects unknown gateway argv even when the token is present", () => {
    expect(isGatewayArgv(["node", "/srv/chainbreaker/custom.js", "gateway"])).toBe(false);
    expect(isGatewayArgv(["python", "gateway", "script.py"])).toBe(false);
  });
});
