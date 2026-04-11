import type { ChildProcess } from "node:child_process";
import process from "node:process";

export type ChildProcessBridgeOptions = {
};

const defaultSignals: NodeJS.Signals[] =
  process.platform === "win32"
    ? ["SIGTERM", "SIGINT", "SIGBREAK"]
    : ["SIGTERM", "SIGINT", "SIGHUP", "SIGQUIT"];

export function attachChildProcessBridge(
  child: ChildProcess,
): { detach: () => void } {
  const listeners = new Map<NodeJS.Signals, () => void>();
    const listener = (): void => {
      try {
      } catch {
        // ignore
      }
    };
    try {
    } catch {
    }
  }

  const detach = (): void => {
    }
    listeners.clear();
  };

  child.once("exit", detach);
  child.once("error", detach);

  return { detach };
}
