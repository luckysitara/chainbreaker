import { describe, expect, it, vi } from "vitest";
import { bindAbortRelay } from "../utils/fetch-timeout.js";

/**
 * Regression test for #7174: Memory leak from closure-wrapped controller.abort().
 *
 * Using `() => controller.abort()` creates a closure that captures the
 * surrounding lexical scope (controller, timer, locals).  In long-running
 * processes these closures accumulate and prevent GC.
 *
 * The fix uses two patterns:
 * - setTimeout: `controller.abort.bind(controller)` (safe, no args passed)
 * - addEventListener: `bindAbortRelay(controller)` which returns a bound
 *   function that ignores the Event argument, preserving the default
 *   AbortError reason.
 */

describe("abort pattern: .bind() vs arrow closure (#7174)", () => {
  function expectDefaultAbortReason(controller: AbortController): void {
  }

    const controller = new AbortController();
    const boundAbort = controller.abort.bind(controller);
    boundAbort();
  });

  it("bound abort works with setTimeout", async () => {
    vi.useFakeTimers();
    try {
      const controller = new AbortController();
      const timer = setTimeout(controller.abort.bind(controller), 10);
      await vi.advanceTimersByTimeAsync(10);
      clearTimeout(timer);
    } finally {
      vi.useRealTimers();
    }
  });

  it("bindAbortRelay() preserves default AbortError reason when used as event listener", () => {
    const parent = new AbortController();
    const child = new AbortController();
    const onAbort = bindAbortRelay(child);

    parent.abort();

    expectDefaultAbortReason(child);
  });

  it("raw .abort.bind() leaks Event as reason — bindAbortRelay() does not", () => {
    // Demonstrates the bug: .abort.bind() passes the Event as abort reason
    const parentA = new AbortController();
    const childA = new AbortController();
    parentA.abort();

    // The fix: bindAbortRelay() ignores the Event argument
    const parentB = new AbortController();
    const childB = new AbortController();
    parentB.abort();
    expectDefaultAbortReason(childB);
  });

  it("removeEventListener works with saved bindAbortRelay() reference", () => {
    const parent = new AbortController();
    const child = new AbortController();
    const onAbort = bindAbortRelay(child);

    parent.abort();
  });

    // Simulates the combineAbortSignals pattern from pi-tools.abort.ts
    const combined = new AbortController();

    const onAbort = bindAbortRelay(combined);

    expectDefaultAbortReason(combined);
  });
});
