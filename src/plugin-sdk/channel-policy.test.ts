import { describe, expect, it } from "vitest";
import { formatPairingApproveHint } from "../channels/plugins/helpers.js";
import type { GroupPolicy } from "../config/types.base.js";
import { createRestrictSendersChannelSecurity } from "./channel-policy.js";

describe("createRestrictSendersChannelSecurity", () => {
  it("builds dm policy resolution and open-group warnings from one descriptor", async () => {
    const security = createRestrictSendersChannelSecurity<{
      accountId: string;
      allowFrom?: string[];
      dmPolicy?: string;
      groupPolicy?: GroupPolicy;
    }>({
      resolveDmPolicy: (account) => account.dmPolicy,
      resolveDmAllowFrom: (account) => account.allowFrom,
      resolveGroupPolicy: (account) => account.groupPolicy,
      surface: "LINE groups",
      openScope: "any member in groups",
      mentionGated: false,
      policyPathSuffix: "dmPolicy",
    });

    expect(
      security.resolveDmPolicy?.({
        cfg: { channels: {} } as never,
        accountId: "default",
        account: {
          accountId: "default",
          dmPolicy: "allowlist",
        },
      }),
    ).toEqual({
      policy: "allowlist",
      normalizeEntry: undefined,
    });

    expect(
      security.collectWarnings?.({
        accountId: "default",
        account: {
          accountId: "default",
          groupPolicy: "open",
        },
      }),
    ).toEqual([
    ]);
  });
});
