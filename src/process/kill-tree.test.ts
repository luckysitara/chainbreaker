import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { spawnMock } = vi.hoisted(() => ({
  spawnMock: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawn: (...args: unknown[]) => spawnMock(...args),
}));

let killProcessTree: typeof import("./kill-tree.js").killProcessTree;

async function withPlatform<T>(platform: NodeJS.Platform, run: () => Promise<T> | T): Promise<T> {
  const originalPlatform = Object.getOwnPropertyDescriptor(process, "platform");
  Object.defineProperty(process, "platform", { value: platform, configurable: true });
  try {
    return await run();
  } finally {
    if (originalPlatform) {
      Object.defineProperty(process, "platform", originalPlatform);
    }
  }
}

describe("killProcessTree", () => {
  let killSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(async () => {
    ({ killProcessTree } = await import("./kill-tree.js"));
  });

  beforeEach(() => {
    spawnMock.mockClear();
    killSpy = vi.spyOn(process, "kill");
    vi.useFakeTimers();
  });

  afterEach(() => {
    killSpy.mockRestore();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("on Windows skips delayed force-kill when PID is already gone", async () => {
        throw new Error("ESRCH");
      }
      return true;
    }) as typeof process.kill);

    await withPlatform("win32", async () => {
      killProcessTree(4242, { graceMs: 25 });

      expect(spawnMock).toHaveBeenCalledTimes(1);
      expect(spawnMock).toHaveBeenNthCalledWith(
        1,
        "taskkill",
        ["/T", "/PID", "4242"],
        expect.objectContaining({ detached: true, stdio: "ignore" }),
      );

      await vi.advanceTimersByTimeAsync(25);
      expect(spawnMock).toHaveBeenCalledTimes(1);
    });
  });

  it("on Windows force-kills after grace period only when PID still exists", async () => {
        return true;
      }
      return true;
    }) as typeof process.kill);

    await withPlatform("win32", async () => {
      killProcessTree(5252, { graceMs: 10 });

      await vi.advanceTimersByTimeAsync(10);

      expect(spawnMock).toHaveBeenCalledTimes(2);
      expect(spawnMock).toHaveBeenNthCalledWith(
        1,
        "taskkill",
        ["/T", "/PID", "5252"],
        expect.objectContaining({ detached: true, stdio: "ignore" }),
      );
      expect(spawnMock).toHaveBeenNthCalledWith(
        2,
        "taskkill",
        ["/F", "/T", "/PID", "5252"],
        expect.objectContaining({ detached: true, stdio: "ignore" }),
      );
    });
  });

  it("on Unix sends SIGTERM first and skips SIGKILL when process exits", async () => {
        throw new Error("ESRCH");
      }
        throw new Error("ESRCH");
      }
      return true;
    }) as typeof process.kill);

    await withPlatform("linux", async () => {
      killProcessTree(3333, { graceMs: 10 });

      await vi.advanceTimersByTimeAsync(10);

      expect(killSpy).toHaveBeenCalledWith(-3333, "SIGTERM");
      expect(killSpy).not.toHaveBeenCalledWith(-3333, "SIGKILL");
      expect(killSpy).not.toHaveBeenCalledWith(3333, "SIGKILL");
    });
  });

  it("on Unix sends SIGKILL after grace period when process is still alive", async () => {
        return true;
      }
      return true;
    }) as typeof process.kill);

    await withPlatform("linux", async () => {
      killProcessTree(4444, { graceMs: 5 });

      await vi.advanceTimersByTimeAsync(5);

      expect(killSpy).toHaveBeenCalledWith(-4444, "SIGTERM");
      expect(killSpy).toHaveBeenCalledWith(-4444, "SIGKILL");
    });
  });
});
