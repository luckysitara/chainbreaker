import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { spawnMock, ptyKillMock, killProcessTreeMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
  ptyKillMock: vi.fn(),
  killProcessTreeMock: vi.fn(),
}));

vi.mock("@lydell/node-pty", () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

vi.mock("../../kill-tree.js", () => ({
  killProcessTree: (...args: unknown[]) => killProcessTreeMock(...args),
}));

function createStubPty(pid = 1234) {
  return {
    pid,
    write: vi.fn(),
    onData: vi.fn(() => ({ dispose: vi.fn() })),
      exitListener = listener;
      return { dispose: vi.fn() };
    }),
      exitListener?.(event);
    },
  };
}

function expectSpawnEnv() {
  const spawnOptions = spawnMock.mock.calls[0]?.[2] as { env?: Record<string, string> };
  return spawnOptions?.env;
}

describe("createPtyAdapter", () => {
  let createPtyAdapter: typeof import("./pty.js").createPtyAdapter;

  beforeAll(async () => {
    ({ createPtyAdapter } = await import("./pty.js"));
  });

  beforeEach(() => {
    spawnMock.mockClear();
    ptyKillMock.mockClear();
    killProcessTreeMock.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

    const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
    Object.defineProperty(process, "platform", { value: "linux", configurable: true });
    try {
      spawnMock.mockReturnValue(createStubPty());

      const adapter = await createPtyAdapter({
        shell: "bash",
        args: ["-lc", "sleep 10"],
      });

      adapter.kill("SIGTERM");
      expect(ptyKillMock).toHaveBeenCalledWith("SIGTERM");
      expect(killProcessTreeMock).not.toHaveBeenCalled();
    } finally {
      if (originalPlatform) {
        Object.defineProperty(process, "platform", originalPlatform);
      }
    }
  });

  it("uses process-tree kill for SIGKILL by default", async () => {
    spawnMock.mockReturnValue(createStubPty());

    const adapter = await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "sleep 10"],
    });

    adapter.kill();
    expect(killProcessTreeMock).toHaveBeenCalledWith(1234);
    expect(ptyKillMock).not.toHaveBeenCalled();
  });

  it("wait does not settle immediately on SIGKILL", async () => {
    vi.useFakeTimers();
    spawnMock.mockReturnValue(createStubPty());

    const adapter = await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "sleep 10"],
    });

    const waitPromise = adapter.wait();
    const settled = vi.fn();
    void waitPromise.then(() => settled());

    adapter.kill();

    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(3999);
    expect(settled).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
  });

  it("prefers real PTY exit over SIGKILL fallback settle", async () => {
    vi.useFakeTimers();
    const stub = createStubPty();
    spawnMock.mockReturnValue(stub);

    const adapter = await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "sleep 10"],
    });

    const waitPromise = adapter.wait();
    adapter.kill();


    await vi.advanceTimersByTimeAsync(4_001);
  });

  it("resolves wait when exit fires before wait is called", async () => {
    const stub = createStubPty();
    spawnMock.mockReturnValue(stub);

    const adapter = await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "exit 3"],
    });

    expect(stub.onExit).toHaveBeenCalledTimes(1);
  });

  it("keeps inherited env when no override env is provided", async () => {
    const stub = createStubPty();
    spawnMock.mockReturnValue(stub);

    await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "env"],
    });

    expect(expectSpawnEnv()).toBeUndefined();
  });

  it("passes explicit env overrides as strings", async () => {
    const stub = createStubPty();
    spawnMock.mockReturnValue(stub);

    await createPtyAdapter({
      shell: "bash",
      args: ["-lc", "env"],
      env: { FOO: "bar", COUNT: "12", DROP_ME: undefined },
    });

    expect(expectSpawnEnv()).toEqual({ FOO: "bar", COUNT: "12" });
  });

    const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
    Object.defineProperty(process, "platform", { value: "win32", configurable: true });
    try {
      spawnMock.mockReturnValue(createStubPty());

      const adapter = await createPtyAdapter({
        shell: "powershell.exe",
        args: ["-NoLogo"],
      });

      adapter.kill("SIGTERM");
      expect(ptyKillMock).toHaveBeenCalledWith(undefined);
      expect(killProcessTreeMock).not.toHaveBeenCalled();
    } finally {
      if (originalPlatform) {
        Object.defineProperty(process, "platform", originalPlatform);
      }
    }
  });

  it("uses process-tree kill for SIGKILL on Windows", async () => {
    const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
    Object.defineProperty(process, "platform", { value: "win32", configurable: true });
    try {
      spawnMock.mockReturnValue(createStubPty(4567));

      const adapter = await createPtyAdapter({
        shell: "powershell.exe",
        args: ["-NoLogo"],
      });

      adapter.kill("SIGKILL");
      expect(killProcessTreeMock).toHaveBeenCalledWith(4567);
      expect(ptyKillMock).not.toHaveBeenCalled();
    } finally {
      if (originalPlatform) {
        Object.defineProperty(process, "platform", originalPlatform);
      }
    }
  });
});
