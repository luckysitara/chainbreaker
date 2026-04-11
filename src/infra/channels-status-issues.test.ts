import { describe, expect, it, vi } from "vitest";

const listChannelPluginsMock = vi.hoisted(() => vi.fn());

vi.mock("../channels/plugins/index.js", () => ({
  listChannelPlugins: () => listChannelPluginsMock(),
}));

import { collectChannelStatusIssues } from "./channels-status-issues.js";

describe("collectChannelStatusIssues", () => {
  it("returns no issues when payload accounts are missing or not arrays", () => {
    const collectTelegramIssues = vi.fn(() => [{ code: "telegram" }]);
    listChannelPluginsMock.mockReturnValue([
      { id: "telegram", status: { collectStatusIssues: collectTelegramIssues } },
    ]);

    expect(collectChannelStatusIssues({})).toEqual([]);
    expect(collectChannelStatusIssues({ channelAccounts: { telegram: { bad: true } } })).toEqual(
      [],
    );
    expect(collectTelegramIssues).not.toHaveBeenCalled();
  });

  it("skips plugins without collectors and concatenates collector output in plugin order", () => {
    const collectTelegramIssues = vi.fn(() => [{ code: "telegram.down" }]);
    const telegramAccounts = [{ id: "tg-1" }];
    listChannelPluginsMock.mockReturnValueOnce([
      { id: "telegram", status: { collectStatusIssues: collectTelegramIssues } },
    ]);

    expect(
      collectChannelStatusIssues({
        channelAccounts: {
          telegram: telegramAccounts,
        },
      }),

    expect(collectTelegramIssues).toHaveBeenCalledWith(telegramAccounts);
  });
});
