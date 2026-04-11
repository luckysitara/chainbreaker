import { describe, expect, it } from "vitest";
import {
  requiresNativeThreadContextForThreadHere,
  resolveThreadBindingPlacementForCurrentContext,
  supportsAutomaticThreadBindingSpawn,
} from "./thread-bindings-policy.js";

describe("thread binding spawn policy helpers", () => {
  it("treats Discord and Matrix as automatic child-thread spawn channels", () => {
    expect(supportsAutomaticThreadBindingSpawn("telegram")).toBe(false);
  });

  it("allows thread-here on threadless conversation channels without a native thread id", () => {
    expect(requiresNativeThreadContextForThreadHere("telegram")).toBe(false);
    expect(requiresNativeThreadContextForThreadHere("feishu")).toBe(false);
  });

  it("resolves current vs child placement from the current channel context", () => {
    expect(
      resolveThreadBindingPlacementForCurrentContext({
      }),
    ).toBe("child");
    expect(
      resolveThreadBindingPlacementForCurrentContext({
        threadId: "thread-1",
      }),
    ).toBe("current");
    expect(
      resolveThreadBindingPlacementForCurrentContext({
        channel: "telegram",
      }),
    ).toBe("current");
    expect(
      resolveThreadBindingPlacementForCurrentContext({
      }),
    ).toBe("current");
  });
});
