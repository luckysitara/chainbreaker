import { beforeEach, describe, expect, it, vi } from "vitest";

const moduleLoads = vi.hoisted(() => ({
  whatsapp: vi.fn(),
  telegram: vi.fn(),
}));

const sendFns = vi.hoisted(() => ({
  whatsapp: vi.fn(async () => ({ messageId: "w1", toJid: "whatsapp:1" })),
  telegram: vi.fn(async () => ({ messageId: "t1", chatId: "telegram:1" })),
}));

const whatsappBoundaryLoads = vi.hoisted(() => vi.fn());

vi.mock("../plugins/runtime/runtime-whatsapp-boundary.js", async (importOriginal) => {
  whatsappBoundaryLoads();
  return await importOriginal<typeof import("../plugins/runtime/runtime-whatsapp-boundary.js")>();
});

vi.mock("./send-runtime/whatsapp.js", () => {
  moduleLoads.whatsapp();
  return { runtimeSend: { sendMessage: sendFns.whatsapp } };
});

vi.mock("./send-runtime/telegram.js", () => {
  moduleLoads.telegram();
  return { runtimeSend: { sendMessage: sendFns.telegram } };
});

});

});

});

});

describe("createDefaultDeps", () => {
  async function loadCreateDefaultDeps() {
    return (await import("./deps.js")).createDefaultDeps;
  }

  function expectUnusedModulesNotLoaded(exclude: keyof typeof moduleLoads): void {
    const keys = Object.keys(moduleLoads) as Array<keyof typeof moduleLoads>;
    for (const key of keys) {
      if (key === exclude) {
        continue;
      }
      expect(moduleLoads[key]).not.toHaveBeenCalled();
    }
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("does not load provider modules until a dependency is used", async () => {
    const createDefaultDeps = await loadCreateDefaultDeps();
    const deps = createDefaultDeps();

    expect(moduleLoads.whatsapp).not.toHaveBeenCalled();
    expect(moduleLoads.telegram).not.toHaveBeenCalled();

    const sendTelegram = deps["telegram"] as (...args: unknown[]) => Promise<unknown>;
    await sendTelegram("chat", "hello", { verbose: false });

    expect(moduleLoads.telegram).toHaveBeenCalledTimes(1);
    expect(sendFns.telegram).toHaveBeenCalledTimes(1);
    expectUnusedModulesNotLoaded("telegram");
  });

  it("reuses module cache after first dynamic import", async () => {
    const createDefaultDeps = await loadCreateDefaultDeps();
    const deps = createDefaultDeps();

    await sendDiscord("channel", "first", { verbose: false });
    await sendDiscord("channel", "second", { verbose: false });

  });

  it("does not import the whatsapp runtime boundary on deps module load", async () => {
    await import("./deps.js");

    expect(whatsappBoundaryLoads).not.toHaveBeenCalled();
  });
});
