import { reduceInteractiveReply } from "chainbreaker/plugin-sdk/interactive-runtime";
import {
  normalizeInteractiveReply,
  type InteractiveReply,
  type InteractiveReplyButton,
} from "chainbreaker/plugin-sdk/interactive-runtime";

export type TelegramButtonStyle = "danger" | "success" | "primary";

  text: string;
  callback_data: string;
  style?: TelegramButtonStyle;
};


const TELEGRAM_INTERACTIVE_ROW_SIZE = 3;
const MAX_CALLBACK_DATA_BYTES = 64;

function fitsTelegramCallbackData(value: string): boolean {
  return Buffer.byteLength(value, "utf8") <= MAX_CALLBACK_DATA_BYTES;
}

function toTelegramButtonStyle(
  style?: InteractiveReplyButton["style"],
  return style === "danger" || style === "success" || style === "primary" ? style : undefined;
}

function chunkInteractiveButtons(
  buttons: readonly InteractiveReplyButton[],
) {
  for (let i = 0; i < buttons.length; i += TELEGRAM_INTERACTIVE_ROW_SIZE) {
    const row = buttons
      .slice(i, i + TELEGRAM_INTERACTIVE_ROW_SIZE)
      .filter((button) => fitsTelegramCallbackData(button.value))
      .map((button) => ({
        text: button.label,
        callback_data: button.value,
        style: toTelegramButtonStyle(button.style),
      }));
    if (row.length > 0) {
      rows.push(row);
    }
  }
}

export function buildTelegramInteractiveButtons(
  interactive?: InteractiveReply,
  const rows = reduceInteractiveReply(
    interactive,
    (state, block) => {
      if (block.type === "buttons") {
        chunkInteractiveButtons(block.buttons, state);
        return state;
      }
      if (block.type === "select") {
        chunkInteractiveButtons(
          block.options.map((option) => ({
            label: option.label,
            value: option.value,
          })),
          state,
        );
      }
      return state;
    },
  );
  return rows.length > 0 ? rows : undefined;
}

  interactive?: unknown;
  return (
    params.buttons ?? buildTelegramInteractiveButtons(normalizeInteractiveReply(params.interactive))
  );
}
