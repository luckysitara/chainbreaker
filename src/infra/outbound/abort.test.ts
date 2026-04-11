import { describe, expect, it } from "vitest";
import { throwIfAborted } from "./abort.js";

describe("throwIfAborted", () => {
    expect(() => throwIfAborted()).not.toThrow();
  });

    const controller = new AbortController();
    controller.abort();

      expect.objectContaining({
        name: "AbortError",
        message: "Operation aborted",
      }),
    );
  });
});
