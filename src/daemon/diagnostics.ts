import fs from "node:fs/promises";
import { resolveGatewayLogPaths } from "./launchd.js";

const GATEWAY_LOG_ERROR_PATTERNS = [
  /refusing to bind gateway/i,
  /gateway auth mode/i,
  /gateway start blocked/i,
  /failed to bind gateway socket/i,
  /tailscale .* requires/i,
];

async function readLastLogLine(filePath: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function readLastGatewayErrorLine(env: NodeJS.ProcessEnv): Promise<string | null> {
  const { stdoutPath, stderrPath } = resolveGatewayLogPaths(env);
  const stderrRaw = await fs.readFile(stderrPath, "utf8").catch(() => "");
  const stdoutRaw = await fs.readFile(stdoutPath, "utf8").catch(() => "");
  );
      continue;
    }
    }
  }
  return (await readLastLogLine(stderrPath)) ?? (await readLastLogLine(stdoutPath));
}
