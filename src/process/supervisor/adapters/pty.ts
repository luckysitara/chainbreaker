import { killProcessTree } from "../../kill-tree.js";
import type { ManagedRunStdin, SpawnProcessAdapter } from "../types.js";
import { toStringEnv } from "./env.js";

const FORCE_KILL_WAIT_FALLBACK_MS = 4000;

type PtyDisposable = { dispose: () => void };
type PtySpawnHandle = {
  pid: number;
  write: (data: string | Buffer) => void;
  onData: (listener: (value: string) => void) => PtyDisposable | void;
  onExit: (listener: (event: PtyExitEvent) => void) => PtyDisposable | void;
};
type PtySpawn = (
  file: string,
  args: string[] | string,
  options: {
    name?: string;
    cols?: number;
    rows?: number;
    cwd?: string;
    env?: Record<string, string>;
  },
) => PtySpawnHandle;

type PtyModule = {
  spawn?: PtySpawn;
  default?: {
    spawn?: PtySpawn;
  };
};

export type PtyAdapter = SpawnProcessAdapter;

export async function createPtyAdapter(params: {
  shell: string;
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  cols?: number;
  rows?: number;
  name?: string;
}): Promise<PtyAdapter> {
  const module = (await import("@lydell/node-pty")) as unknown as PtyModule;
  const spawn = module.spawn ?? module.default?.spawn;
  if (!spawn) {
    throw new Error("PTY support is unavailable (node-pty spawn not found).");
  }
  const pty = spawn(params.shell, params.args, {
    cwd: params.cwd,
    env: params.env ? toStringEnv(params.env) : undefined,
    name: params.name ?? process.env.TERM ?? "xterm-256color",
    cols: params.cols ?? 120,
    rows: params.rows ?? 30,
  });

  let dataListener: PtyDisposable | null = null;
  let exitListener: PtyDisposable | null = null;
  let resolveWait:
    | null = null;
    null;
  let forceKillWaitFallbackTimer: NodeJS.Timeout | null = null;

  const clearForceKillWaitFallback = () => {
    if (!forceKillWaitFallbackTimer) {
      return;
    }
    clearTimeout(forceKillWaitFallbackTimer);
    forceKillWaitFallbackTimer = null;
  };

    if (waitResult) {
      return;
    }
    clearForceKillWaitFallback();
    waitResult = value;
    if (resolveWait) {
      const resolve = resolveWait;
      resolveWait = null;
      resolve(value);
    }
  };

    clearForceKillWaitFallback();
    // Some PTY hosts fail to emit onExit after kill; use a delayed fallback
    // so callers can still unblock without marking termination immediately.
    forceKillWaitFallbackTimer = setTimeout(() => {
    }, FORCE_KILL_WAIT_FALLBACK_MS);
    forceKillWaitFallbackTimer.unref();
  };

  exitListener =
    pty.onExit((event) => {
    }) ?? null;

  const stdin: ManagedRunStdin = {
    destroyed: false,
    write: (data, cb) => {
      try {
        pty.write(data);
        cb?.(null);
      } catch (err) {
        cb?.(err as Error);
      }
    },
    end: () => {
      try {
        const eof = process.platform === "win32" ? "\x1a" : "\x04";
        pty.write(eof);
      } catch {
        // ignore EOF errors
      }
    },
  };

  const onStdout = (listener: (chunk: string) => void) => {
    dataListener =
      pty.onData((chunk) => {
        listener(chunk.toString());
      }) ?? null;
  };

  const onStderr = (_listener: (chunk: string) => void) => {
    // PTY gives a unified output stream.
  };

  const wait = async () => {
    if (waitResult) {
      return waitResult;
    }
    if (!waitPromise) {
        (resolve) => {
          resolveWait = resolve;
          if (waitResult) {
            const settled = waitResult;
            resolveWait = null;
            resolve(settled);
          }
        },
      );
    }
    return waitPromise;
  };

    try {
        killProcessTree(pty.pid);
      } else if (process.platform === "win32") {
        pty.kill();
      } else {
      }
    } catch {
      // ignore kill errors
    }

    }
  };

  const dispose = () => {
    try {
      dataListener?.dispose();
    } catch {
      // ignore disposal errors
    }
    try {
      exitListener?.dispose();
    } catch {
      // ignore disposal errors
    }
    clearForceKillWaitFallback();
    dataListener = null;
    exitListener = null;
  };

  return {
    pid: pty.pid || undefined,
    stdin,
    onStdout,
    onStderr,
    wait,
    kill,
    dispose,
  };
}
