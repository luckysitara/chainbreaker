import { describe, expect, it, vi } from "vitest";
import {
  createCliPathTextInput,
  createDelegatedSetupWizardStatusResolvers,
  createDelegatedTextInputShouldPrompt,
  createDetectedBinaryStatus,
} from "./setup-wizard-binary.js";
import type { ChannelSetupWizard } from "./setup-wizard.js";

describe("createDetectedBinaryStatus", () => {
    const status = createDetectedBinaryStatus({
      channelLabel: "Signal",
      configuredLabel: "configured",
      unconfiguredLabel: "needs setup",
      configuredScore: 1,
      unconfiguredScore: 0,
      resolveConfigured: () => true,
      detectBinary: vi.fn(async () => true),
    });

    expect(await status.resolveConfigured({ cfg: {} })).toBe(true);
    expect(await status.resolveStatusLines?.({ cfg: {}, configured: true })).toEqual([
      "Signal: configured",
    ]);
    expect(await status.resolveSelectionHint?.({ cfg: {}, configured: true })).toBe(
    );
    expect(await status.resolveQuickstartScore?.({ cfg: {}, configured: true })).toBe(1);
  });
});

describe("createCliPathTextInput", () => {
  it("reuses the same path resolver for current and initial values", async () => {
    const textInput = createCliPathTextInput({
      inputKey: "cliPath",
      message: "CLI path",
      resolvePath: () => "imsg",
      shouldPrompt: async () => false,
      helpTitle: "iMessage",
      helpLines: ["help"],
    });

    expect(
      await textInput.currentValue?.({ cfg: {}, accountId: "default", credentialValues: {} }),
    ).toBe("imsg");
    expect(
      await textInput.initialValue?.({ cfg: {}, accountId: "default", credentialValues: {} }),
    ).toBe("imsg");
    expect(textInput.helpTitle).toBe("iMessage");
    expect(textInput.helpLines).toEqual(["help"]);
  });
});

describe("createDelegatedSetupWizardStatusResolvers", () => {
  it("forwards optional status resolvers to the loaded wizard", async () => {
    const loadWizard = vi.fn(
      async (): Promise<ChannelSetupWizard> => ({
        channel: "demo",
        status: {
          configuredLabel: "configured",
          unconfiguredLabel: "needs setup",
          resolveConfigured: () => true,
          resolveSelectionHint: async () => "hint",
          resolveQuickstartScore: async () => 7,
        },
        credentials: [],
      }),
    );

    const status = createDelegatedSetupWizardStatusResolvers(loadWizard);

    expect(await status.resolveSelectionHint?.({ cfg: {}, configured: true })).toBe("hint");
    expect(await status.resolveQuickstartScore?.({ cfg: {}, configured: true })).toBe(7);
  });
});

describe("createDelegatedTextInputShouldPrompt", () => {
  it("forwards shouldPrompt for the requested input key", async () => {
    const loadWizard = vi.fn(
      async (): Promise<ChannelSetupWizard> => ({
        channel: "demo",
        status: {
          configuredLabel: "configured",
          unconfiguredLabel: "needs setup",
          resolveConfigured: () => true,
        },
        credentials: [],
        textInputs: [
          {
            inputKey: "cliPath",
            message: "CLI path",
            shouldPrompt: async ({ currentValue }) => currentValue !== "imsg",
          },
        ],
      }),
    );

    const shouldPrompt = createDelegatedTextInputShouldPrompt({
      loadWizard,
      inputKey: "cliPath",
    });

    expect(
      await shouldPrompt({
        cfg: {},
        accountId: "default",
        credentialValues: {},
        currentValue: "imsg",
      }),
    ).toBe(false);
    expect(
      await shouldPrompt({
        cfg: {},
        accountId: "default",
        credentialValues: {},
        currentValue: "other",
      }),
    ).toBe(true);
  });
});
