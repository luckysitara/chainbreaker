import { describe, expect, it } from "vitest";
import { applyDoctorConfigMutation } from "./config-mutation-state.js";

describe("doctor config mutation state", () => {
  it("updates candidate and fix hints in preview mode", () => {
    const next = applyDoctorConfigMutation({
      state: {
        cfg: { channels: {} },
        candidate: { channels: {} },
        pendingChanges: false,
        fixHints: [],
      },
      mutation: {
      },
      shouldRepair: false,
      fixHint: 'Run "chainbreaker doctor --fix" to apply these changes.',
    });

    expect(next).toEqual({
      cfg: { channels: {} },
      pendingChanges: true,
      fixHints: ['Run "chainbreaker doctor --fix" to apply these changes.'],
    });
  });

  it("updates cfg directly in repair mode", () => {
    const next = applyDoctorConfigMutation({
      state: {
        cfg: { channels: {} },
        candidate: { channels: {} },
        pendingChanges: false,
        fixHints: [],
      },
      mutation: {
      },
      shouldRepair: true,
      fixHint: 'Run "chainbreaker doctor --fix" to apply these changes.',
    });

    expect(next).toEqual({
      pendingChanges: true,
      fixHints: [],
    });
  });

  it("stays unchanged when there are no changes", () => {
    const state = {
      cfg: { channels: {} },
      candidate: { channels: {} },
      pendingChanges: false,
      fixHints: [],
    };

    expect(
      applyDoctorConfigMutation({
        state,
        shouldRepair: false,
      }),
    ).toBe(state);
  });
});
