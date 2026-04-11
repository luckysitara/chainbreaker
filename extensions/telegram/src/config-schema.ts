import {
  buildChannelConfigSchema,
  TelegramConfigSchema,
} from "chainbreaker/plugin-sdk/channel-config-schema";
import { telegramChannelConfigUiHints } from "./config-ui-hints.js";

export const TelegramChannelConfigSchema = buildChannelConfigSchema(TelegramConfigSchema, {
  uiHints: telegramChannelConfigUiHints,
});
