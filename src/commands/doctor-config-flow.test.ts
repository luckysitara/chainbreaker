import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { withTempHome } from "../../test/helpers/temp-home.js";
import * as noteModule from "../terminal/note.js";
import { loadAndMaybeMigrateDoctorConfig } from "./doctor-config-flow.js";
import { runDoctorConfigWithInput } from "./doctor-config-flow.test-utils.js";

function expectGoogleChatDmAllowFromRepaired(cfg: unknown) {
  const typed = cfg as {
    channels: {
      googlechat: {
        dm: { allowFrom: string[] };
        allowFrom?: string[];
      };
    };
  };
  expect(typed.channels.googlechat.dm.allowFrom).toEqual(["*"]);
  expect(typed.channels.googlechat.allowFrom).toBeUndefined();
}

async function collectDoctorWarnings(config: Record<string, unknown>): Promise<string[]> {
  const noteSpy = vi.spyOn(noteModule, "note").mockImplementation(() => {});
  try {
    await runDoctorConfigWithInput({
      config,
      run: loadAndMaybeMigrateDoctorConfig,
    });
    return noteSpy.mock.calls
      .filter((call) => call[1] === "Doctor warnings")
      .map((call) => String(call[0]));
  } finally {
    noteSpy.mockRestore();
  }
}

type DoctorFlowDeps = {
  noteModule: typeof import("../terminal/note.js");
  loadAndMaybeMigrateDoctorConfig: typeof import("./doctor-config-flow.js").loadAndMaybeMigrateDoctorConfig;
};

let cachedDoctorFlowDeps: Promise<DoctorFlowDeps> | undefined;

async function loadFreshDoctorFlowDeps(): Promise<DoctorFlowDeps> {
  if (!cachedDoctorFlowDeps) {
    vi.resetModules();
    cachedDoctorFlowDeps = (async () => {
      const freshNoteModule = await import("../terminal/note.js");
      const doctorFlowModule = await import("./doctor-config-flow.js");
      return {
        noteModule: freshNoteModule,
        loadAndMaybeMigrateDoctorConfig: doctorFlowModule.loadAndMaybeMigrateDoctorConfig,
      };
    })();
  }
  return await cachedDoctorFlowDeps;
}

type DiscordGuildRule = {
  users: string[];
  roles: string[];
  channels: Record<string, { users: string[]; roles: string[] }>;
};

type DiscordAccountRule = {
  allowFrom?: string[];
  dm?: { allowFrom: string[]; groupChannels: string[] };
  execApprovals?: { approvers: string[] };
  guilds?: Record<string, DiscordGuildRule>;
};

type RepairedDiscordPolicy = {
  allowFrom?: string[];
  dm: { allowFrom: string[]; groupChannels: string[] };
  execApprovals: { approvers: string[] };
  guilds: Record<string, DiscordGuildRule>;
  accounts: Record<string, DiscordAccountRule>;
};

describe("doctor config flow", () => {
  it("preserves invalid config for doctor repairs", async () => {
    const result = await runDoctorConfigWithInput({
      config: {
        gateway: { auth: { mode: "token", token: 123 } },
        agents: { list: [{ id: "pi" }] },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    expect((result.cfg as Record<string, unknown>).gateway).toEqual({
      auth: { mode: "token", token: 123 },
    });
  });

  it("does not warn on mutable account allowlists when dangerous name matching is inherited", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
          dangerouslyAllowNameMatching: true,
          accounts: {
            work: {
              allowFrom: ["alice"],
            },
          },
        },
      },
    });
  });

  it("does not warn about sender-based group allowlist for googlechat", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        googlechat: {
          groupPolicy: "allowlist",
          accounts: {
            work: {
              groupPolicy: "allowlist",
            },
          },
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(false);
  });

  it("shows first-time Telegram guidance without the old groupAllowFrom warning", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        telegram: {
          botToken: "123:abc",
          groupPolicy: "allowlist",
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(false);
    expect(
      doctorWarnings.some(
      ),
    ).toBe(true);
  });

  it("shows account-scoped first-time Telegram guidance without the old groupAllowFrom warning", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        telegram: {
          accounts: {
            default: {
              botToken: "123:abc",
              groupPolicy: "allowlist",
            },
          },
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(false);
    expect(
      doctorWarnings.some(
            "channels.telegram.accounts.default: Telegram is in first-time setup mode.",
          ) &&
      ),
    ).toBe(true);
  });

  it("shows plugin-blocked guidance instead of first-time Telegram guidance when telegram is explicitly disabled", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        telegram: {
          botToken: "123:abc",
          groupPolicy: "allowlist",
        },
      },
      plugins: {
        entries: {
          telegram: {
            enabled: false,
          },
        },
      },
    });

    expect(
          'channels.telegram: channel is configured, but plugin "telegram" is disabled by plugins.entries.telegram.enabled=false.',
        ),
      ),
    ).toBe(true);
  });

  it("shows plugin-blocked guidance instead of first-time Telegram guidance when plugins are disabled globally", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        telegram: {
          botToken: "123:abc",
          groupPolicy: "allowlist",
        },
      },
      plugins: {
        enabled: false,
      },
    });

    expect(
          "channels.telegram: channel is configured, but plugins.enabled=false blocks channel plugins globally.",
        ),
      ),
    ).toBe(true);
  });

  it("warns on mutable Zalouser group entries when dangerous name matching is disabled", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        zalouser: {
          groups: {
            "Ops Room": { allow: true },
          },
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(true);
  });

  it("does not warn on mutable Zalouser group entries when dangerous name matching is enabled", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
        zalouser: {
          dangerouslyAllowNameMatching: true,
          groups: {
            "Ops Room": { allow: true },
          },
        },
      },
    });

  });

    const doctorWarnings = await collectDoctorWarnings({
      channels: {
          groupPolicy: "allowlist",
          allowFrom: ["+15551234567"],
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(true);
  });

  it("drops unknown keys on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        bridge: { bind: "auto" },
        gateway: { auth: { mode: "token", token: "ok", extra: true } },
        agents: { list: [{ id: "pi" }] },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as Record<string, unknown>;
    expect(cfg.bridge).toBeUndefined();
    expect((cfg.gateway as Record<string, unknown>)?.auth).toEqual({
      mode: "token",
      token: "ok",
    });
  });

  it("migrates legacy browser extension profiles to existing-session on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        browser: {
          relayBindHost: "0.0.0.0",
          profiles: {
            chromeLive: {
              driver: "extension",
              color: "#00AA00",
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const browser = (result.cfg as { browser?: Record<string, unknown> }).browser ?? {};
    expect(browser.relayBindHost).toBeUndefined();
    expect(
      ((browser.profiles as Record<string, { driver?: string }>)?.chromeLive ?? {}).driver,
    ).toBe("existing-session");
  });

  it("repairs restrictive plugins.allow when browser is referenced via tools.alsoAllow", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        tools: {
          alsoAllow: ["browser"],
        },
        plugins: {
          allow: ["telegram"],
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    expect(result.cfg.plugins?.allow).toEqual(["telegram", "browser"]);
    expect(result.cfg.plugins?.entries?.browser?.enabled).toBe(true);
  });

  it("previews Matrix legacy sync-store migration in read-only mode", async () => {
    const noteSpy = vi.spyOn(noteModule, "note").mockImplementation(() => {});
    try {
      await withTempHome(async (home) => {
        const stateDir = path.join(home, ".chainbreaker");
        await fs.writeFile(
          path.join(stateDir, "chainbreaker.json"),
          JSON.stringify({
            channels: {
                userId: "@bot:example.org",
                accessToken: "tok-123",
              },
            },
          }),
        );
        await fs.writeFile(
          '{"next_batch":"s1"}',
        );
        await loadAndMaybeMigrateDoctorConfig({
          options: { nonInteractive: true },
          confirm: async () => false,
        });
      });

      const warning = noteSpy.mock.calls.find(
        (call) =>
          call[1] === "Doctor warnings" &&
          String(call[0]).includes("Matrix plugin upgraded in place."),
      );
      expect(warning?.[0]).toContain("Legacy sync store:");
      expect(warning?.[0]).toContain(
        'Run "chainbreaker doctor --fix" to migrate this Matrix state now.',
      );
    } finally {
      noteSpy.mockRestore();
    }
  });

  it("previews Matrix encrypted-state migration in read-only mode", async () => {
    const noteSpy = vi.spyOn(noteModule, "note").mockImplementation(() => {});
    try {
      await withTempHome(async (home) => {
        const stateDir = path.join(home, ".chainbreaker");
        const { rootDir: accountRoot } = resolveMatrixAccountStorageRoot({
          stateDir,
          userId: "@bot:example.org",
          accessToken: "tok-123",
        });
        await fs.mkdir(path.join(accountRoot, "crypto"), { recursive: true });
        await fs.writeFile(
          path.join(stateDir, "chainbreaker.json"),
          JSON.stringify({
            channels: {
                userId: "@bot:example.org",
                accessToken: "tok-123",
              },
            },
          }),
        );
        await fs.writeFile(
          path.join(accountRoot, "crypto", "bot-sdk.json"),
          JSON.stringify({ deviceId: "DEVICE123" }),
        );
        await loadAndMaybeMigrateDoctorConfig({
          options: { nonInteractive: true },
          confirm: async () => false,
        });
      });

      const warning = noteSpy.mock.calls.find(
        (call) =>
          call[1] === "Doctor warnings" &&
          String(call[0]).includes("Matrix encrypted-state migration is pending"),
      );
      expect(warning?.[0]).toContain("Legacy crypto store:");
      expect(warning?.[0]).toContain("New recovery key file:");
    } finally {
      noteSpy.mockRestore();
    }
  });

  it("migrates Matrix legacy state on doctor repair", async () => {
    const noteSpy = vi.spyOn(noteModule, "note").mockImplementation(() => {});
    try {
      await withTempHome(async (home) => {
        const stateDir = path.join(home, ".chainbreaker");
        await fs.writeFile(
          path.join(stateDir, "chainbreaker.json"),
          JSON.stringify({
            channels: {
                userId: "@bot:example.org",
                accessToken: "tok-123",
              },
            },
          }),
        );
        await fs.writeFile(
          '{"next_batch":"s1"}',
        );
        await loadAndMaybeMigrateDoctorConfig({
          options: { nonInteractive: true, repair: true },
          confirm: async () => false,
        });

        const migratedRoot = path.join(
          stateDir,
          "accounts",
          "default",
        );
        const migratedChildren = await fs.readdir(migratedRoot);
        expect(migratedChildren.length).toBe(1);
        expect(
          await fs
            .access(path.join(migratedRoot, migratedChildren[0] ?? "", "bot-storage.json"))
            .then(() => true)
            .catch(() => false),
        ).toBe(true);
        expect(
          await fs
            .then(() => true)
            .catch(() => false),
        ).toBe(false);
      });

      expect(
        noteSpy.mock.calls.some(
          (call) =>
            call[1] === "Doctor changes" &&
            String(call[0]).includes("Matrix plugin upgraded in place."),
        ),
      ).toBe(true);
    } finally {
      noteSpy.mockRestore();
    }
  });

  it("creates a Matrix migration snapshot before doctor repair mutates Matrix state", async () => {
    await withTempHome(async (home) => {
      const stateDir = path.join(home, ".chainbreaker");
      await fs.writeFile(
        path.join(stateDir, "chainbreaker.json"),
        JSON.stringify({
          channels: {
              userId: "@bot:example.org",
              accessToken: "tok-123",
            },
          },
        }),
      );

      await loadAndMaybeMigrateDoctorConfig({
        options: { nonInteractive: true, repair: true },
        confirm: async () => false,
      });

      const snapshotDir = path.join(home, "Backups", "chainbreaker-migrations");
      const snapshotEntries = await fs.readdir(snapshotDir);
      expect(snapshotEntries.some((entry) => entry.endsWith(".tar.gz"))).toBe(true);

      const marker = JSON.parse(
      ) as {
        archivePath: string;
      };
      expect(marker.archivePath).toContain(path.join("Backups", "chainbreaker-migrations"));
    });
  });

  it("warns when Matrix is installed from a stale custom path", async () => {
    const doctorWarnings = await collectDoctorWarnings({
      channels: {
          accessToken: "tok-123",
        },
      },
      plugins: {
        installs: {
            source: "path",
          },
        },
      },
    });

    expect(
      doctorWarnings.some(
      ),
    ).toBe(true);
  });

  it("warns when Matrix is installed from an existing custom path", async () => {
    await withTempHome(async (home) => {
      await fs.mkdir(pluginPath, { recursive: true });

      const doctorWarnings = await collectDoctorWarnings({
        channels: {
            accessToken: "tok-123",
          },
        },
        plugins: {
          installs: {
              source: "path",
              sourcePath: pluginPath,
              installPath: pluginPath,
            },
          },
        },
      });

      expect(
      ).toBe(true);
      expect(
      ).toBe(true);
    });
  });

  it("notes legacy browser extension migration changes", async () => {
    const noteSpy = vi.spyOn(noteModule, "note").mockImplementation(() => {});
    try {
      await runDoctorConfigWithInput({
        config: {
          browser: {
            relayBindHost: "127.0.0.1",
            profiles: {
              chromeLive: {
                driver: "extension",
                color: "#00AA00",
              },
            },
          },
        },
        run: loadAndMaybeMigrateDoctorConfig,
      });

      const messages = noteSpy.mock.calls
        .filter((call) => call[1] === "Doctor changes")
        .map((call) => String(call[0]));
      expect(
      ).toBe(true);
    } finally {
      noteSpy.mockRestore();
    }
  });

    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            streaming: true,
            lifecycle: {
              enabled: true,
              reactions: {
                queued: "⏳",
                thinking: "🧠",
                tool: "🔧",
                done: "✅",
                error: "❌",
              },
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as {
      channels: {
          streamMode?: string;
          streaming?: string;
          lifecycle?: unknown;
        };
      };
    };
      enabled: true,
      reactions: {
        queued: "⏳",
        thinking: "🧠",
        tool: "🔧",
        done: "✅",
        error: "❌",
      },
    });
  });

  it("sanitizes config-derived doctor warnings and changes before logging", async () => {
    const { noteModule: freshNoteModule, loadAndMaybeMigrateDoctorConfig: loadDoctorFlowFresh } =
      await loadFreshDoctorFlowDeps();
    const noteSpy = vi.spyOn(freshNoteModule, "note").mockImplementation(() => {});
    try {
      await runDoctorConfigWithInput({
        repair: true,
        config: {
          channels: {
            telegram: {
              accounts: {
                work: {
                  botToken: "tok",
                  allowFrom: ["@\u001b[31mtestuser"],
                },
              },
            },
              accounts: {
                work: {
                  allowFrom: ["alice\u001b[31m\nforged"],
                },
                "ops\u001b[31m\nopen": {
                  dmPolicy: "open",
                },
              },
            },
            whatsapp: {
              accounts: {
                "ops\u001b[31m\nempty": {
                  groupPolicy: "allowlist",
                },
              },
            },
          },
        },
        run: loadDoctorFlowFresh,
      });

      const outputs = noteSpy.mock.calls
        .filter((call) => call[1] === "Doctor warnings" || call[1] === "Doctor changes")
        .map((call) => String(call[0]));
      expect(
        outputs.some(
        ),
      ).toBe(true);
      expect(
        outputs.some(
        ),
      ).toBe(true);
      expect(
        outputs.some(
        ),
      ).toBe(true);
    } finally {
      noteSpy.mockRestore();
    }
  });

  it("warns and continues when Telegram account inspection hits inactive SecretRef surfaces", async () => {
    const { noteModule: freshNoteModule, loadAndMaybeMigrateDoctorConfig: loadDoctorFlowFresh } =
      await loadFreshDoctorFlowDeps();
    const noteSpy = vi.spyOn(freshNoteModule, "note").mockImplementation(() => {});
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    try {
      const result = await runDoctorConfigWithInput({
        repair: true,
        config: {
          secrets: {
            providers: {
              default: { source: "env" },
            },
          },
          channels: {
            telegram: {
              accounts: {
                inactive: {
                  enabled: false,
                  botToken: { source: "env", provider: "default", id: "TELEGRAM_BOT_TOKEN" },
                  allowFrom: ["@testuser"],
                },
              },
            },
          },
        },
        run: loadDoctorFlowFresh,
      });

      const cfg = result.cfg as {
        channels?: {
          telegram?: {
            accounts?: Record<string, { allowFrom?: string[] }>;
          };
        };
      };
      expect(cfg.channels?.telegram?.accounts?.inactive?.allowFrom).toEqual(["@testuser"]);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(
        noteSpy.mock.calls.some((call) =>
          String(call[0]).includes("Telegram account inactive: failed to inspect bot token"),
        ),
      ).toBe(true);
      expect(
        noteSpy.mock.calls.some((call) =>
          String(call[0]).includes(
            "Telegram allowFrom contains @username entries, but no Telegram bot token is configured",
          ),
        ),
      ).toBe(true);
    } finally {
      noteSpy.mockRestore();
      vi.unstubAllGlobals();
    }
  });

    await withTempHome(async (home) => {
      const configDir = path.join(home, ".chainbreaker");
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(
        path.join(configDir, "chainbreaker.json"),
        JSON.stringify(
          {
            channels: {
                allowFrom: [123],
                dm: { allowFrom: [456], groupChannels: [789] },
                execApprovals: { approvers: [321] },
                guilds: {
                  "100": {
                    users: [111],
                    roles: [222],
                    channels: {
                      general: { users: [333], roles: [444] },
                    },
                  },
                },
                accounts: {
                  work: {
                    allowFrom: [555],
                    dm: { allowFrom: [666], groupChannels: [777] },
                    execApprovals: { approvers: [888] },
                    guilds: {
                      "200": {
                        users: [999],
                        roles: [1010],
                        channels: {
                          help: { users: [1111], roles: [1212] },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          null,
          2,
        ),
        "utf-8",
      );

      const result = await loadAndMaybeMigrateDoctorConfig({
        options: { nonInteractive: true, repair: true },
        confirm: async () => false,
      });

      const cfg = result.cfg as unknown as {
        channels: {
            allowFrom?: string[];
            accounts: Record<string, DiscordAccountRule> & {
              default: { allowFrom: string[] };
              work: {
                allowFrom: string[];
                dm: { allowFrom: string[]; groupChannels: string[] };
                execApprovals: { approvers: string[] };
                guilds: Record<string, DiscordGuildRule>;
              };
            };
          };
        };
      };

        "1111",
      ]);
        "1212",
      ]);
    });
  });

  it("does not restore top-level allowFrom when config is intentionally default-account scoped", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            accounts: {
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as {
      channels: {
          allowFrom?: string[];
          accounts: Record<string, { allowFrom?: string[] }>;
        };
      };
    };

  });

  it('adds allowFrom ["*"] when dmPolicy="open" and allowFrom is missing on repair', async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            token: "test-token",
            dmPolicy: "open",
            groupPolicy: "open",
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
    };
  });

  it("adds * to existing allowFrom array when dmPolicy is open on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            botToken: "xoxb-test",
            appToken: "xapp-test",
            dmPolicy: "open",
            allowFrom: ["U123"],
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
    };
  });

  it("repairs nested dm.allowFrom when top-level allowFrom is absent on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            token: "test-token",
            dmPolicy: "open",
            dm: { allowFrom: ["123"] },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
    };
    // When dmPolicy is set at top level but allowFrom only exists nested in dm,
    // the repair adds "*" to dm.allowFrom
    } else {
      // If doctor flattened the config, allowFrom should be at top level
    }
  });

  it("skips repair when allowFrom already includes *", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            token: "test-token",
            dmPolicy: "open",
            allowFrom: ["*"],
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
    };
  });

  it("repairs per-account dmPolicy open without allowFrom on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
            token: "test-token",
            accounts: {
              work: {
                token: "test-token-2",
                dmPolicy: "open",
              },
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
      channels: {
      };
    };
  });

  it('repairs dmPolicy="allowlist" by restoring allowFrom from pairing store on repair', async () => {
    const result = await withTempHome(async (home) => {
      const configDir = path.join(home, ".chainbreaker");
      const credentialsDir = path.join(configDir, "credentials");
      await fs.mkdir(credentialsDir, { recursive: true });
      await fs.writeFile(
        path.join(configDir, "chainbreaker.json"),
        JSON.stringify(
          {
            channels: {
              telegram: {
                botToken: "fake-token",
                dmPolicy: "allowlist",
              },
            },
          },
          null,
          2,
        ),
        "utf-8",
      );
      await fs.writeFile(
        path.join(credentialsDir, "telegram-allowFrom.json"),
        JSON.stringify({ version: 1, allowFrom: ["12345"] }, null, 2),
        "utf-8",
      );
      return await loadAndMaybeMigrateDoctorConfig({
        options: { nonInteractive: true, repair: true },
        confirm: async () => false,
      });
    });

    const cfg = result.cfg as {
      channels: {
        telegram: {
          dmPolicy: string;
          allowFrom: string[];
        };
      };
    };
    expect(cfg.channels.telegram.dmPolicy).toBe("allowlist");
    expect(cfg.channels.telegram.allowFrom).toEqual(["12345"]);
  });

  it("migrates legacy toolsBySender keys to typed id entries on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
          whatsapp: {
            groups: {
              "123@g.us": {
                toolsBySender: {
                  owner: { allow: ["exec"] },
                  alice: { deny: ["exec"] },
                  "id:owner": { deny: ["exec"] },
                  "username:@ops-bot": { allow: ["fs.read"] },
                  "*": { deny: ["exec"] },
                },
              },
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
      channels: {
        whatsapp: {
          groups: {
            "123@g.us": {
              toolsBySender: Record<string, { allow?: string[]; deny?: string[] }>;
            };
          };
        };
      };
    };
    const toolsBySender = cfg.channels.whatsapp.groups["123@g.us"].toolsBySender;
    expect(toolsBySender.owner).toBeUndefined();
    expect(toolsBySender.alice).toBeUndefined();
    expect(toolsBySender["id:owner"]).toEqual({ deny: ["exec"] });
    expect(toolsBySender["id:alice"]).toEqual({ deny: ["exec"] });
    expect(toolsBySender["username:@ops-bot"]).toEqual({ allow: ["fs.read"] });
    expect(toolsBySender["*"]).toEqual({ deny: ["exec"] });
  });

  it("repairs googlechat dm.policy open by setting dm.allowFrom on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
          googlechat: {
            dm: {
              policy: "open",
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    expectGoogleChatDmAllowFromRepaired(result.cfg);
  });

  it("migrates top-level heartbeat into agents.defaults.heartbeat on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        heartbeat: {
          model: "anthropic/claude-3-5-haiku-20241022",
          every: "30m",
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as {
      heartbeat?: unknown;
      agents?: {
        defaults?: {
          heartbeat?: {
            model?: string;
            every?: string;
          };
        };
      };
    };
    expect(cfg.heartbeat).toBeUndefined();
    expect(cfg.agents?.defaults?.heartbeat).toMatchObject({
      model: "anthropic/claude-3-5-haiku-20241022",
      every: "30m",
    });
  });

  it("migrates top-level heartbeat visibility into channels.defaults.heartbeat on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        heartbeat: {
          showOk: true,
          showAlerts: false,
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as {
      heartbeat?: unknown;
      channels?: {
        defaults?: {
          heartbeat?: {
            showOk?: boolean;
            showAlerts?: boolean;
            useIndicator?: boolean;
          };
        };
      };
    };
    expect(cfg.heartbeat).toBeUndefined();
    expect(cfg.channels?.defaults?.heartbeat).toMatchObject({
      showOk: true,
      showAlerts: false,
    });
  });

  it("repairs googlechat account dm.policy open by setting dm.allowFrom on repair", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
          googlechat: {
            accounts: {
              work: {
                dm: {
                  policy: "open",
                },
              },
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });

    const cfg = result.cfg as unknown as {
      channels: {
        googlechat: {
          accounts: {
            work: {
              dm: {
                policy: string;
                allowFrom: string[];
              };
              allowFrom?: string[];
            };
          };
        };
      };
    };

    expect(cfg.channels.googlechat.accounts.work.dm.allowFrom).toEqual(["*"]);
    expect(cfg.channels.googlechat.accounts.work.allowFrom).toBeUndefined();
  });

  it("recovers from stale googlechat top-level allowFrom by repairing dm.allowFrom", async () => {
    const result = await runDoctorConfigWithInput({
      repair: true,
      config: {
        channels: {
          googlechat: {
            allowFrom: ["*"],
            dm: {
              policy: "open",
            },
          },
        },
      },
      run: loadAndMaybeMigrateDoctorConfig,
    });
    const cfg = result.cfg as {
      channels: {
        googlechat: {
          dm: { allowFrom: string[] };
          allowFrom?: string[];
        };
      };
    };
    expect(cfg.channels.googlechat.dm.allowFrom).toEqual(["*"]);
    expect(cfg.channels.googlechat.allowFrom).toEqual(["*"]);
  });
});
