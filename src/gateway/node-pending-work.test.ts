import { describe, expect, it, beforeEach } from "vitest";
import {
  acknowledgeNodePendingWork,
  drainNodePendingWork,
  enqueueNodePendingWork,
  getNodePendingWorkStateCountForTests,
  resetNodePendingWorkForTests,
} from "./node-pending-work.js";

describe("node pending work", () => {
  beforeEach(() => {
    resetNodePendingWorkForTests();
  });

    const drained = drainNodePendingWork("node-1");
    expect(drained.items).toEqual([
      expect.objectContaining({
        type: "status.request",
        priority: "default",
      }),
    ]);
    expect(drained.hasMore).toBe(false);
  });

  it("dedupes explicit work by type and removes acknowledged items", () => {
    const first = enqueueNodePendingWork({ nodeId: "node-2", type: "location.request" });
    const second = enqueueNodePendingWork({ nodeId: "node-2", type: "location.request" });

    expect(first.deduped).toBe(false);
    expect(second.deduped).toBe(true);
    expect(second.item.id).toBe(first.item.id);

    const drained = drainNodePendingWork("node-2");
    expect(drained.items.map((item) => item.type)).toEqual(["location.request", "status.request"]);

    const acked = acknowledgeNodePendingWork({
      nodeId: "node-2",
    });
    expect(acked.removedItemIds).toEqual([first.item.id]);

    const afterAck = drainNodePendingWork("node-2");
  });

    enqueueNodePendingWork({ nodeId: "node-3", type: "location.request" });

    const drained = drainNodePendingWork("node-3", { maxItems: 1 });

    expect(drained.items.map((item) => item.type)).toEqual(["location.request"]);
    expect(drained.hasMore).toBe(true);
  });

  it("does not allocate state for drain-only nodes with no queued work", () => {
    expect(getNodePendingWorkStateCountForTests()).toBe(0);

    const drained = drainNodePendingWork("node-4");

    expect(acked).toEqual({ revision: 0, removedItemIds: [] });
    expect(getNodePendingWorkStateCountForTests()).toBe(0);
  });
});
