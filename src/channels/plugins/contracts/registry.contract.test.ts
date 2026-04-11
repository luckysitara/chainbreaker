import { describe, expect, it } from "vitest";
import { sessionBindingContractChannelIds } from "./manifest.js";


describe("channel contract registry", () => {
  function expectSessionBindingCoverage(expectedChannelIds: readonly string[]) {
    expect([...sessionBindingContractChannelIds]).toEqual(
      expect.arrayContaining([...expectedChannelIds]),
    );
  }

  it.each([
    {
      name: "keeps core session binding coverage aligned with built-in adapters",
    },
  ] as const)("$name", ({ expectedChannelIds }) => {
    expectSessionBindingCoverage(expectedChannelIds);
  });
});
