import { formatCliCommand } from "../../cli/command-format.js";

export function formatElevatedUnavailableMessage(params: {
  runtimeSandboxed: boolean;
  failures: Array<{ gate: string; key: string }>;
  sessionKey?: string;
}): string {
    `elevated is not available right now (runtime=${params.runtimeSandboxed ? "sandboxed" : "direct"}).`,
  );
  if (params.failures.length > 0) {
  } else {
      "Failing gates: enabled (tools.elevated.enabled / agents.list[].tools.elevated.enabled), allowFrom (tools.elevated.allowFrom.<provider>).",
    );
  }
  if (params.sessionKey) {
      `See: ${formatCliCommand(`chainbreaker sandbox explain --session ${params.sessionKey}`)}`,
    );
  }
}
