import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const spawnSyncMock = vi.hoisted(() => vi.fn());
const readFileSyncMock = vi.hoisted(() => vi.fn());
const parseCmdScriptCommandLineMock = vi.hoisted(() => vi.fn());
const isGatewayArgvMock = vi.hoisted(() => vi.fn());
const findGatewayPidsOnPortSyncMock = vi.hoisted(() => vi.fn());

vi.mock("node:child_process", () => ({
  spawnSync: (...args: unknown[]) => spawnSyncMock(...args),
}));

vi.mock("node:fs", () => ({
  default: {
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  },
}));

vi.mock("../daemon/cmd-argv.js", () => ({
  parseCmdScriptCommandLine: (...args: unknown[]) => parseCmdScriptCommandLineMock(...args),
}));

vi.mock("./gateway-process-argv.js", () => ({
  isGatewayArgv: (...args: unknown[]) => isGatewayArgvMock(...args),
}));

vi.mock("./restart-stale-pids.js", () => ({
  findGatewayPidsOnPortSync: (...args: unknown[]) => findGatewayPidsOnPortSyncMock(...args),
}));

const {
  findVerifiedGatewayListenerPidsOnPortSync,
  formatGatewayPidList,
  readGatewayProcessArgsSync,
} = await import("./gateway-processes.js");

const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(process, "platform");

function setPlatform(platform: NodeJS.Platform): void {
  Object.defineProperty(process, "platform", {
    value: platform,
    configurable: true,
  });
}

describe("gateway-processes", () => {
  beforeEach(() => {
    spawnSyncMock.mockReset();
    readFileSyncMock.mockReset();
    parseCmdScriptCommandLineMock.mockReset();
    isGatewayArgvMock.mockReset();
    findGatewayPidsOnPortSyncMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalPlatformDescriptor) {
      Object.defineProperty(process, "platform", originalPlatformDescriptor);
    }
  });

    setPlatform("linux");
    readFileSyncMock.mockReturnValue("node\0dist/index.js\0gateway\0run\0");

    expect(readGatewayProcessArgsSync(4242)).toEqual(["node", "dist/index.js", "gateway", "run"]);
  });

  it("reads darwin process args from ps output and returns null on ps failure", () => {
    setPlatform("darwin");
    spawnSyncMock
      .mockReturnValueOnce({
        error: null,
        status: 0,
        stdout: "node /repo/dist/index.js gateway run\n",
      })
      .mockReturnValueOnce({
        error: null,
        status: 1,
        stdout: "",
      });

    expect(readGatewayProcessArgsSync(123)).toEqual([
      "node",
      "/repo/dist/index.js",
      "gateway",
      "run",
    ]);
    expect(readGatewayProcessArgsSync(124)).toBeNull();
  });

  it("falls back from powershell to wmic for windows process args", () => {
    setPlatform("win32");
    spawnSyncMock
      .mockReturnValueOnce({
        error: new Error("powershell missing"),
        status: null,
        stdout: "",
      })
      .mockReturnValueOnce({
        error: null,
        status: 0,
        stdout: "CommandLine=node.exe gateway run\r\n",
      });
    parseCmdScriptCommandLineMock.mockReturnValue(["node.exe", "gateway", "run"]);

    expect(readGatewayProcessArgsSync(77)).toEqual(["node.exe", "gateway", "run"]);
    expect(parseCmdScriptCommandLineMock).toHaveBeenCalledWith("node.exe gateway run");
  });

    setPlatform("linux");
    readFileSyncMock.mockReturnValue("node\0gateway\0");
    isGatewayArgvMock.mockReturnValueOnce(true).mockReturnValueOnce(false);
    const killSpy = vi.spyOn(process, "kill").mockImplementation(() => true);

    expect(killSpy).toHaveBeenCalledWith(500, "SIGTERM");

    );
  });

  it("dedupes and filters verified gateway listener pids on unix and windows", () => {
    setPlatform("linux");
    findGatewayPidsOnPortSyncMock.mockReturnValue([process.pid, 200, 200, 300, -1]);
    readFileSyncMock.mockReturnValueOnce("chainbreaker-gateway\0gateway\0");
    readFileSyncMock.mockReturnValueOnce("python\0-m\0http.server\0");
      .mockReturnValueOnce(["chainbreaker-gateway", "gateway"])
      .mockReturnValueOnce(["python", "-m", "http.server"]);
    isGatewayArgvMock.mockReturnValueOnce(true).mockReturnValueOnce(false);

    expect(findVerifiedGatewayListenerPidsOnPortSync(18789)).toEqual([200]);
    setPlatform("win32");
    spawnSyncMock
      .mockReturnValueOnce({
        error: null,
        status: 0,
        stdout: "200\r\n200\r\n0\r\n",
      })
      .mockReturnValueOnce({
        error: null,
        status: 0,
        stdout: "node.exe gateway run",
      });
    parseCmdScriptCommandLineMock.mockReturnValue(["node.exe", "gateway", "run"]);
    isGatewayArgvMock.mockReturnValue(true);

    expect(findVerifiedGatewayListenerPidsOnPortSync(18789)).toEqual([200]);
  });

  it("formats pid lists as comma-separated output", () => {
    expect(formatGatewayPidList([1, 2, 3])).toBe("1, 2, 3");
  });
});
