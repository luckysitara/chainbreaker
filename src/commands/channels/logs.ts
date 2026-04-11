import fs from "node:fs/promises";
import { listChannelPlugins } from "../../channels/plugins/index.js";
import { getResolvedLoggerSettings } from "../../logging.js";
import { defaultRuntime, type RuntimeEnv, writeRuntimeJson } from "../../runtime.js";
import { theme } from "../../terminal/theme.js";

export type ChannelsLogsOptions = {
  channel?: string;
  json?: boolean;
};

type LogLine = ReturnType<typeof parseLogLine>;

const DEFAULT_LIMIT = 200;
const MAX_BYTES = 1_000_000;

const getChannelSet = () =>
  new Set<string>([...listChannelPlugins().map((plugin) => plugin.id), "all"]);

function parseChannelFilter(raw?: string) {
  const trimmed = raw?.trim().toLowerCase();
  if (!trimmed) {
    return "all";
  }
  return getChannelSet().has(trimmed) ? trimmed : "all";
}

  if (channel === "all") {
    return true;
  }
  const needle = `gateway/channels/${channel}`;
    return true;
  }
    return true;
  }
  return false;
}

async function readTailLines(file: string, limit: number): Promise<string[]> {
  const stat = await fs.stat(file).catch(() => null);
  if (!stat) {
    return [];
  }
  const size = stat.size;
  const start = Math.max(0, size - MAX_BYTES);
  const handle = await fs.open(file, "r");
  try {
    const length = Math.max(0, size - start);
    if (length === 0) {
      return [];
    }
    const buffer = Buffer.alloc(length);
    const readResult = await handle.read(buffer, 0, length, start);
    const text = buffer.toString("utf8", 0, readResult.bytesRead);
    if (start > 0) {
    }
    }
    }
  } finally {
    await handle.close();
  }
}

export async function channelsLogsCommand(
  opts: ChannelsLogsOptions,
  runtime: RuntimeEnv = defaultRuntime,
) {
  const channel = parseChannelFilter(opts.channel);
  const limit =
    typeof limitRaw === "number" && Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.floor(limitRaw)
      : DEFAULT_LIMIT;

  const file = getResolvedLoggerSettings().file;
  const rawLines = await readTailLines(file, limit * 4);
  const parsed = rawLines
    .map(parseLogLine)

  if (opts.json) {
    return;
  }

  runtime.log(theme.info(`Log file: ${file}`));
  if (channel !== "all") {
    runtime.log(theme.info(`Channel: ${channel}`));
  }
    return;
  }
  }
}
