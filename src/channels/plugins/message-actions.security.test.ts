import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { jsonResult } from "../../agents/tools/common.js";
import type { ChainbreakerConfig } from "../../config/config.js";
import { setActivePluginRegistry } from "../../plugins/runtime.js";
import {
  createChannelTestPluginBase,
  createTestRegistry,
} from "../../test-utils/channel-plugins.js";
import { dispatchChannelMessageAction } from "./message-action-dispatch.js";
import type { ChannelPlugin } from "./types.js";

const handleAction = vi.fn(async () => jsonResult({ ok: true }));

const emptyRegistry = createTestRegistry([]);

  ...createChannelTestPluginBase({
    label: "Discord",
    capabilities: { chatTypes: ["direct", "group"] },
    config: {
      listAccountIds: () => ["default"],
    },
  }),
  actions: {
    describeMessageTool: () => ({ actions: ["kick"] }),
    supportsAction: ({ action }) => action === "kick",
    requiresTrustedRequesterSender: ({ action, toolContext }) =>
      Boolean(action === "kick" && toolContext),
    handleAction,
  },
};

describe("dispatchChannelMessageAction trusted sender guard", () => {
  beforeEach(() => {
    handleAction.mockClear();
    setActivePluginRegistry(
    );
  });

  afterEach(() => {
    setActivePluginRegistry(emptyRegistry);
  });

    await expect(
      dispatchChannelMessageAction({
        action: "kick",
        cfg: {} as ChainbreakerConfig,
        params: { guildId: "g1", userId: "u1" },
      }),
    expect(handleAction).not.toHaveBeenCalled();
  });

    await dispatchChannelMessageAction({
      action: "kick",
      cfg: {} as ChainbreakerConfig,
      params: { guildId: "g1", userId: "u1" },
      requesterSenderId: "trusted-user",
    });

    expect(handleAction).toHaveBeenCalledOnce();
  });

  it("does not require trusted sender without tool context", async () => {
    await dispatchChannelMessageAction({
      action: "kick",
      cfg: {} as ChainbreakerConfig,
      params: { guildId: "g1", userId: "u1" },
    });

    expect(handleAction).toHaveBeenCalledOnce();
  });
});
