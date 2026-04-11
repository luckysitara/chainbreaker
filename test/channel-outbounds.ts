import type { ChannelOutboundAdapter } from "../src/channels/plugins/types.js";
import {
  loadBundledPluginPublicSurfaceSync,
  loadBundledPluginTestApiSync,
} from "../src/test-utils/bundled-plugin-public-surface.js";

}>({
  artifactBasename: "src/outbound-adapter.js",
});
export const { telegramOutbound } = loadBundledPluginPublicSurfaceSync<{
  telegramOutbound: ChannelOutboundAdapter;
}>({
  pluginId: "telegram",
  artifactBasename: "src/outbound-adapter.js",
});
export const { whatsappOutbound } = loadBundledPluginTestApiSync<{
  whatsappOutbound: ChannelOutboundAdapter;
}>("whatsapp");
