import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          CHAINBREAKER_STATE_DIR: "/tmp/chainbreaker-state",
          CHAINBREAKER_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "chainbreaker-gateway",
        windowsTaskName: "Chainbreaker Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/chainbreaker-state/logs/gateway.log",
      "Launchd stderr (if installed): /tmp/chainbreaker-state/logs/gateway.err.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        systemdServiceName: "chainbreaker-gateway",
        windowsTaskName: "Chainbreaker Gateway",
      }),
    ).toEqual(["Logs: journalctl --user -u chainbreaker-gateway.service -n 200 --no-pager"]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        systemdServiceName: "chainbreaker-gateway",
        windowsTaskName: "Chainbreaker Gateway",
      }),
    ).toEqual(['Logs: schtasks /Query /TN "Chainbreaker Gateway" /V /FO LIST']);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "chainbreaker gateway install",
        startCommand: "chainbreaker gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.chainbreaker.gateway.plist",
        systemdServiceName: "chainbreaker-gateway",
        windowsTaskName: "Chainbreaker Gateway",
      }),
    ).toEqual([
      "chainbreaker gateway install",
      "chainbreaker gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.chainbreaker.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "chainbreaker gateway install",
        startCommand: "chainbreaker gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.chainbreaker.gateway.plist",
        systemdServiceName: "chainbreaker-gateway",
        windowsTaskName: "Chainbreaker Gateway",
      }),
    ).toEqual([
      "chainbreaker gateway install",
      "chainbreaker gateway",
      "systemctl --user start chainbreaker-gateway.service",
    ]);
  });
});
