import {
  hasConfiguredUnavailableCredentialStatus,
  hasResolvedCredentialValue,
} from "../channels/account-snapshot-fields.js";
import { resolveChannelDefaultAccountId } from "../channels/plugins/helpers.js";
import type { listChannelPlugins } from "../channels/plugins/index.js";
import type { ChannelId } from "../channels/plugins/types.js";
import { inspectReadOnlyChannelAccount } from "../channels/read-only-account-inspect.js";
import { formatCliCommand } from "../cli/command-format.js";
import { resolveNativeCommandsEnabled, resolveNativeSkillsEnabled } from "../config/commands.js";
import type { ChainbreakerConfig } from "../config/config.js";
import { isDangerousNameMatchingEnabled } from "../config/dangerous-name-matching.js";
import { formatErrorMessage } from "../infra/errors.js";
import { createLazyRuntimeSurface } from "../shared/lazy-runtime.js";
import { normalizeStringEntries } from "../shared/string-normalization.js";
import type { SecurityAuditFinding, SecurityAuditSeverity } from "./audit.js";
import { resolveDmAllowState } from "./dm-policy-shared.js";

const loadAuditChannelAllowFromRuntimeModule = createLazyRuntimeSurface(
  () => import("./audit-channel.allow-from.runtime.js"),
  ({ auditChannelAllowFromRuntime }) => auditChannelAllowFromRuntime,
);

const loadAuditChannelTelegramRuntimeModule = createLazyRuntimeSurface(
  () => import("./audit-channel.telegram.runtime.js"),
  ({ auditChannelTelegramRuntime }) => auditChannelTelegramRuntime,
);

export async function auditChannels(params: {
  cfg: ChainbreakerConfig;
  plugins: ReturnType<typeof listChannelPlugins>;
}): Promise<SecurityAuditFinding[]> {
  const findings: SecurityAuditFinding[] = [];
  const { cfg, plugins } = params;

  for (const plugin of plugins) {
    if (!plugin.id) {
      continue;
    }
    const auditParams = {
      cfg,
      channelId: plugin.id,
      label: plugin.meta.label,
    };

    const hasGlobalAudit = plugin.audit !== undefined;
    const hasAuditForAccounts = plugin.accounts?.some((acc) => acc.audit !== undefined);

    if (hasGlobalAudit || hasAuditForAccounts) {
      try {
        const auditFindings = await auditChannel(auditParams);
        findings.push(...auditFindings);
      } catch (err) {
        findings.push({
          severity: "warn",
          label: auditParams.label,
          message: `Audit failed for channel: ${formatErrorMessage(err)}`,
        });
      }
    }
  }

  findings.push(...(await auditNativeCommands(params)));
  findings.push(...(await auditLegacySecretStorage(params)));

  return findings;
}

async function auditChannel(params: {
  cfg: ChainbreakerConfig;
  channelId: ChannelId;
  label: string;
}): Promise<SecurityAuditFinding[]> {
  const findings: SecurityAuditFinding[] = [];
  const channelId = params.channelId;
  const cfg = params.cfg;

  // Basic configuration checks
  findings.push(...auditBasicChannelConfig(params));

  // Provider-specific audit logic
  if (channelId === "telegram") {
    const { auditTelegramChannel } = await loadAuditChannelTelegramRuntimeModule();
    findings.push(...(await auditTelegramChannel({ cfg, label: params.label })));
  }

  // Cross-channel checks (dmPolicy, allowFrom)
  findings.push(...(await auditChannelDmPolicy(params)));

  return findings;
}

function auditBasicChannelConfig(params: {
  cfg: ChainbreakerConfig;
  channelId: ChannelId;
  label: string;
}): SecurityAuditFinding[] {
  const findings: SecurityAuditFinding[] = [];
  const channels = params.cfg.channels as Record<string, any> | undefined;
  const config = channels?.[params.channelId];

  if (!config) {
    return [];
  }

  if (config.enabled === false) {
    return [];
  }

  const accountId = resolveChannelDefaultAccountId(params.cfg, params.channelId);
  const snapshot = inspectReadOnlyChannelAccount(params.cfg, params.channelId, accountId);

  if (hasConfiguredUnavailableCredentialStatus(snapshot)) {
    findings.push({
      severity: "warn",
      label: params.label,
      message: `Channel configured but credentials may be missing or invalid. Check your configuration.`,
    });
  }

  return findings;
}

async function auditChannelDmPolicy(params: {
  cfg: ChainbreakerConfig;
  channelId: ChannelId;
  label: string;
}): Promise<SecurityAuditFinding[]> {
  const findings: SecurityAuditFinding[] = [];
  const { cfg, channelId, label } = params;
  const channels = cfg.channels as Record<string, any> | undefined;
  const config = channels?.[channelId];

  if (!config) {
    return [];
  }

  const dmPolicy = config.dmPolicy || "pairing";
  const allowFromRaw = config.allowFrom;
  const allowFrom = normalizeStringEntries(allowFromRaw);

  const dmState = resolveDmAllowState({ dmPolicy, allowFrom });

  if (dmState === "open") {
    findings.push({
      severity: "critical",
      label,
      message: `Direct messages are completely open (dmPolicy="open"). Anyone on ${label} can talk to your agent.`,
      fix: `Change dmPolicy to "pairing" or "allowlist" in your configuration.`,
    });
  } else if (dmState === "allowlist" && allowFrom.length === 0) {
    findings.push({
      severity: "error",
      label,
      message: `Direct messages restricted to allowlist, but allowlist is empty. No one can talk to your agent.`,
      fix: `Add your ${label} ID to the allowlist.`,
    });
  }

  // Audit for dangerous name matching
  if (isDangerousNameMatchingEnabled(cfg)) {
    findings.push({
      severity: "warn",
      label,
      message: `Dangerous name matching is enabled. This could allow unauthorized access if account names are spoofed.`,
      fix: `Set security.dangerouslyAllowNameMatching=false.`,
    });
  }

  const { auditAllowFrom } = await loadAuditChannelAllowFromRuntimeModule();
  findings.push(...(await auditAllowFrom({ cfg, channelId, label })));

  return findings;
}

async function auditNativeCommands(params: {
  cfg: ChainbreakerConfig;
}): Promise<SecurityAuditFinding[]> {
  const findings: SecurityAuditFinding[] = [];
  const { cfg } = params;

  const channels = (cfg.channels || {}) as Record<string, any>;
  for (const [channelId, config] of Object.entries(channels)) {
    if (!config || config.enabled === false) {
      continue;
    }

    const nativeEnabled = resolveNativeCommandsEnabled({
      config: cfg,
      providerId: channelId as ChannelId,
    });
    const skillsEnabled = resolveNativeSkillsEnabled({
      config: cfg,
      providerId: channelId as ChannelId,
    });

    if (nativeEnabled || skillsEnabled) {
      findings.push({
        severity: "info",
        label: `Commands (${channelId})`,
        message: `Native commands or skills are enabled. Ensure you trust the users who can access this channel.`,
      });
    }
  }

  return findings;
}

async function auditLegacySecretStorage(params: {
  cfg: ChainbreakerConfig;
}): Promise<SecurityAuditFinding[]> {
  const findings: SecurityAuditFinding[] = [];
  // Future check: audit for plaintext secrets in configuration if SecretRefs are available.
  void params;
  return findings;
}
