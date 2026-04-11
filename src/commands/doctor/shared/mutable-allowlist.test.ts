import { describe, expect, it } from "vitest";
import {
  collectMutableAllowlistWarnings,
  scanMutableAllowlistEntries,
} from "./mutable-allowlist.js";

describe("doctor mutable allowlist scanner", () => {
    const hits = scanMutableAllowlistEntries({
      channels: {
          allowFrom: ["alice"],
          guilds: {
            ops: {
              users: ["bob"],
              roles: [],
              channels: {},
            },
          },
        },
        irc: {
          allowFrom: ["charlie"],
          groups: {
            "#ops": {
              allowFrom: ["dana"],
            },
          },
        },
        zalouser: {
          groups: {
            "Ops Room": { allow: true },
          },
        },
      },
    });

    expect(hits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entry: "alice",
        }),
        expect.objectContaining({
          entry: "bob",
        }),
        expect.objectContaining({
          channel: "irc",
          path: "channels.irc.allowFrom",
          entry: "charlie",
        }),
        expect.objectContaining({
          channel: "irc",
          path: "channels.irc.groups.#ops.allowFrom",
          entry: "dana",
        }),
        expect.objectContaining({
          channel: "zalouser",
          path: "channels.zalouser.groups",
          entry: "Ops Room",
        }),
      ]),
    );
  });

  it("skips scopes that explicitly allow dangerous name matching", () => {
    const hits = scanMutableAllowlistEntries({
      channels: {
          dangerouslyAllowNameMatching: true,
          allowFrom: ["alice"],
        },
      },
    });

    expect(hits).toEqual([]);
  });

  it("formats mutable allowlist warnings", () => {
    const warnings = collectMutableAllowlistWarnings([
      {
        entry: "alice",
      },
      {
        channel: "irc",
        path: "channels.irc.allowFrom",
        entry: "bob",
        dangerousFlagPath: "channels.irc.dangerouslyAllowNameMatching",
      },
    ]);

    expect(warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("channels.irc.allowFrom: bob"),
        expect.stringContaining("Option A"),
        expect.stringContaining("Option B"),
      ]),
    );
  });
});
