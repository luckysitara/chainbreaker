import type { ChannelPlugin } from "../../channels/plugins/types.plugin.js";
import type { ChainbreakerConfig } from "../../config/config.js";
import { setActivePluginRegistry } from "../../plugins/runtime.js";
import { createPluginRuntime, type PluginRuntime } from "../../plugins/runtime/index.js";
import { loadBundledPluginTestApiSync } from "../../test-utils/bundled-plugin-public-surface.js";
import { createTestRegistry } from "../../test-utils/channel-plugins.js";

  setSlackRuntime: (runtime: PluginRuntime) => void;
const { telegramPlugin, setTelegramRuntime } = loadBundledPluginTestApiSync<{
  telegramPlugin: ChannelPlugin;
  setTelegramRuntime: (runtime: PluginRuntime) => void;
}>("telegram");

  channels: {
      botToken: "xoxb-test",
      appToken: "xapp-test",
    },
  },
} as ChainbreakerConfig;

export const telegramConfig = {
  channels: {
    telegram: {
      botToken: "telegram-test",
    },
  },
} as ChainbreakerConfig;

export function installMessageActionRunnerTestRegistry() {
  const runtime = createPluginRuntime();
  setSlackRuntime(runtime);
  setTelegramRuntime(runtime);
  setActivePluginRegistry(
    createTestRegistry([
      {
        source: "test",
      },
      {
        pluginId: "telegram",
        source: "test",
        plugin: telegramPlugin,
      },
    ]),
  );
}

export function resetMessageActionRunnerTestRegistry() {
  setActivePluginRegistry(createTestRegistry([]));
}
