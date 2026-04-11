import type { PluginRuntime } from "chainbreaker/plugin-sdk/core";
import { createPluginRuntimeStore } from "chainbreaker/plugin-sdk/runtime-store";

const { setRuntime: setWhatsAppRuntime, getRuntime: getWhatsAppRuntime } =
  createPluginRuntimeStore<PluginRuntime>("WhatsApp runtime not initialized");
export { getWhatsAppRuntime, setWhatsAppRuntime };
