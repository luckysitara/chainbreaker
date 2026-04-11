import { describe, expect, it } from "vitest";
import { migrateLegacyConfig } from "./legacy-migrate.js";
import { validateConfigObjectRaw } from "./validation.js";

describe("thread binding config keys", () => {
  it("rejects legacy session.threadBindings.ttlHours", () => {
    const result = validateConfigObjectRaw({
      session: {
        threadBindings: {
          ttlHours: 24,
        },
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: "session.threadBindings",
        message: expect.stringContaining("ttlHours"),
      }),
    );
  });

    const result = validateConfigObjectRaw({
      channels: {
          threadBindings: {
            ttlHours: 24,
          },
        },
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("ttlHours"),
      }),
    );
  });

    const result = validateConfigObjectRaw({
      channels: {
          accounts: {
            alpha: {
              threadBindings: {
                ttlHours: 24,
              },
            },
          },
        },
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        message: expect.stringContaining("ttlHours"),
      }),
    );
  });

  it("migrates session.threadBindings.ttlHours to idleHours", () => {
    const result = migrateLegacyConfig({
      session: {
        threadBindings: {
          ttlHours: 24,
        },
      },
    });

    expect(result.config?.session?.threadBindings?.idleHours).toBe(24);
    const normalized = result.config?.session?.threadBindings as
      | Record<string, unknown>
      | undefined;
    expect(normalized?.ttlHours).toBeUndefined();
    expect(result.changes).toContain(
      "Moved session.threadBindings.ttlHours → session.threadBindings.idleHours.",
    );
  });

  it("migrates Discord threadBindings.ttlHours for root and account entries", () => {
    const result = migrateLegacyConfig({
      channels: {
          threadBindings: {
            ttlHours: 12,
          },
          accounts: {
            alpha: {
              threadBindings: {
                ttlHours: 6,
              },
            },
            beta: {
              threadBindings: {
                idleHours: 4,
                ttlHours: 9,
              },
            },
          },
        },
      },
    });

    expect(
    ).toBeUndefined();

    expect(
    ).toBeUndefined();

    expect(
    ).toBeUndefined();

    expect(result.changes).toContain(
    );
    expect(result.changes).toContain(
    );
    expect(result.changes).toContain(
    );
  });
});
