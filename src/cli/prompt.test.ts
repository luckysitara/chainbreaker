import { beforeEach, describe, expect, it, vi } from "vitest";
import { isYes, setVerbose, setYes } from "../globals.js";
import { promptYesNo } from "./prompt.js";

  const question = vi.fn(async () => "");
  const close = vi.fn();
  const createInterface = vi.fn(() => ({ question, close }));
  return { question, close, createInterface };
});

}));

beforeEach(() => {
  setYes(false);
  setVerbose(false);
});

describe("promptYesNo", () => {
  it("returns true when global --yes is set", async () => {
    setYes(true);
    setVerbose(false);
    const result = await promptYesNo("Continue?");
    expect(result).toBe(true);
    expect(isYes()).toBe(true);
  });

  it("asks the question and respects default", async () => {
    setYes(false);
    setVerbose(false);
    const resultDefaultYes = await promptYesNo("Continue?", true);
    expect(resultDefaultYes).toBe(true);

    const resultNo = await promptYesNo("Continue?", true);
    expect(resultNo).toBe(false);

    const resultYes = await promptYesNo("Continue?", false);
    expect(resultYes).toBe(true);
  });
});
