import { getAcpSessionManager } from "../../../acp/control-plane/manager.js";
import { formatAcpRuntimeErrorText } from "../../../acp/runtime/error-text.js";
import { toAcpRuntimeError } from "../../../acp/runtime/errors.js";
import { getAcpRuntimeBackend, requireAcpRuntimeBackend } from "../../../acp/runtime/registry.js";
import { resolveSessionStorePathForAcp } from "../../../acp/runtime/session-meta.js";
import { loadSessionStore } from "../../../config/sessions.js";
import type { SessionEntry } from "../../../config/sessions/types.js";
import { getSessionBindingService } from "../../../infra/outbound/session-binding-service.js";
import type { CommandHandlerResult, HandleCommandsParams } from "../commands-types.js";
import { resolveAcpCommandBindingContext } from "./context.js";
import {
  ACP_DOCTOR_USAGE,
  ACP_INSTALL_USAGE,
  ACP_SESSIONS_USAGE,
  formatAcpCapabilitiesText,
  resolveAcpInstallCommandHint,
  resolveConfiguredAcpBackendId,
  stopWithText,
} from "./shared.js";
import { resolveBoundAcpThreadSessionKey } from "./targets.js";

export async function handleAcpDoctorAction(
  params: HandleCommandsParams,
  restTokens: string[],
): Promise<CommandHandlerResult> {
  if (restTokens.length > 0) {
    return stopWithText(`⚠️ ${ACP_DOCTOR_USAGE}`);
  }

  const backendId = resolveConfiguredAcpBackendId(params.cfg);
  const installHint = resolveAcpInstallCommandHint(params.cfg);
  const registeredBackend = getAcpRuntimeBackend(backendId);
  const managerSnapshot = getAcpSessionManager().getObservabilitySnapshot(params.cfg);
    `turnLatencyMs: avg=${managerSnapshot.turns.averageLatencyMs}, max=${managerSnapshot.turns.maxLatencyMs}`,
  );
    `turnCounts: completed=${managerSnapshot.turns.completed}, failed=${managerSnapshot.turns.failed}`,
  );
  const errorStatsText =
    Object.entries(managerSnapshot.errorsByCode)
      .map(([code, count]) => `${code}=${count}`)
      .join(", ") || "(none)";
  if (registeredBackend) {
  } else {
  }

  if (registeredBackend?.runtime.doctor) {
    try {
      const report = await registeredBackend.runtime.doctor();
      if (report.code) {
      }
      if (report.installCommand) {
      }
      for (const detail of report.details ?? []) {
      }
    } catch (error) {
        `runtimeDoctor: error (${
          toAcpRuntimeError({
            error,
            fallbackCode: "ACP_TURN_FAILED",
            fallbackMessage: "Runtime doctor failed.",
          }).message
        })`,
      );
    }
  }

  try {
    const backend = requireAcpRuntimeBackend(backendId);
    const capabilities = backend.runtime.getCapabilities
      ? await backend.runtime.getCapabilities({})
      : { controls: [] as string[], configOptionKeys: [] as string[] };
    if ((capabilities.configOptionKeys?.length ?? 0) > 0) {
    }
  } catch (error) {
    const acpError = toAcpRuntimeError({
      error,
      fallbackCode: "ACP_TURN_FAILED",
      fallbackMessage: "ACP backend doctor failed.",
    });
    if (backendId.toLowerCase() === "acpx") {
    }
  }
}

export function handleAcpInstallAction(
  params: HandleCommandsParams,
  restTokens: string[],
): CommandHandlerResult {
  if (restTokens.length > 0) {
    return stopWithText(`⚠️ ${ACP_INSTALL_USAGE}`);
  }
  const backendId = resolveConfiguredAcpBackendId(params.cfg);
  const installHint = resolveAcpInstallCommandHint(params.cfg);
    "ACP install:",
    "-----",
    `configuredBackend: ${backendId}`,
    `run: ${installHint}`,
    `then: chainbreaker config set plugins.entries.${backendId}.enabled true`,
    "then: /acp doctor",
  ];
}

function formatAcpSessionLine(params: {
  key: string;
  entry: SessionEntry;
  currentSessionKey?: string;
  threadId?: string;
}): string {
  const acp = params.entry.acp;
  if (!acp) {
    return "";
  }
  const marker = params.currentSessionKey === params.key ? "*" : " ";
  const label = params.entry.label?.trim() || acp.agent;
  const threadText = params.threadId ? `, thread:${params.threadId}` : "";
  return `${marker} ${label} (${acp.mode}, ${acp.state}, backend:${acp.backend}${threadText}) -> ${params.key}`;
}

export function handleAcpSessionsAction(
  params: HandleCommandsParams,
  restTokens: string[],
): CommandHandlerResult {
  if (restTokens.length > 0) {
    return stopWithText(ACP_SESSIONS_USAGE);
  }

  const currentSessionKey = resolveBoundAcpThreadSessionKey(params) || params.sessionKey;
  if (!currentSessionKey) {
    return stopWithText("⚠️ Missing session key.");
  }

  const { storePath } = resolveSessionStorePathForAcp({
    cfg: params.cfg,
    sessionKey: currentSessionKey,
  });

  let store: Record<string, SessionEntry>;
  try {
    store = loadSessionStore(storePath);
  } catch {
    store = {};
  }

  const bindingContext = resolveAcpCommandBindingContext(params);
  const normalizedChannel = bindingContext.channel;
  const normalizedAccountId = bindingContext.accountId || undefined;
  const bindingService = getSessionBindingService();

  const rows = Object.entries(store)
    .filter(([, entry]) => Boolean(entry?.acp))
    .toSorted(([, a], [, b]) => (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0))
    .slice(0, 20)
    .map(([key, entry]) => {
      const bindingThreadId = bindingService
        .listBySession(key)
        .find(
          (binding) =>
            (!normalizedChannel || binding.conversation.channel === normalizedChannel) &&
            (!normalizedAccountId || binding.conversation.accountId === normalizedAccountId),
        )?.conversation.conversationId;
      return formatAcpSessionLine({
        key,
        entry,
        currentSessionKey,
        threadId: bindingThreadId,
      });
    })
    .filter(Boolean);

  if (rows.length === 0) {
    return stopWithText("ACP sessions:\n-----\n(none)");
  }

  return stopWithText(["ACP sessions:", "-----", ...rows].join("\n"));
}
