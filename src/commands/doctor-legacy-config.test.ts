import { describe, expect, it } from "vitest";
import { normalizeCompatibilityConfigValues } from "./doctor-legacy-config.js";

describe("normalizeCompatibilityConfigValues preview streaming aliases", () => {
  it("normalizes telegram boolean streaming aliases to enum", () => {
    const res = normalizeCompatibilityConfigValues({
      channels: {
        telegram: {
          streaming: false,
        },
      },
    });

    expect(res.config.channels?.telegram?.streaming).toBe("off");
    expect(res.config.channels?.telegram?.streamMode).toBeUndefined();
    expect(res.changes).toEqual(["Normalized channels.telegram.streaming boolean → enum (off)."]);
  });

    const res = normalizeCompatibilityConfigValues({
      channels: {
          streaming: true,
        },
      },
    });

    expect(res.changes).toEqual([
    ]);
  });

    const res = normalizeCompatibilityConfigValues({
      channels: {
          streaming: false,
        },
      },
    });

  });

    const res = normalizeCompatibilityConfigValues({
      channels: {
          streamMode: "off",
        },
      },
    });

    expect(res.changes).toEqual([
    ]);
  });

    const res = normalizeCompatibilityConfigValues({
      channels: {
          streaming: false,
        },
      },
    });

    expect(res.changes).toEqual([
    ]);
  });
});
