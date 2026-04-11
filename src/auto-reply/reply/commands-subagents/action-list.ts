import { buildSubagentList } from "../../../agents/subagent-control.js";
import type { CommandHandlerResult } from "../commands-types.js";
import { type SubagentsCommandContext, RECENT_WINDOW_MINUTES, stopWithText } from "./shared.js";

export function handleSubagentsListAction(ctx: SubagentsCommandContext): CommandHandlerResult {
  const { params, runs } = ctx;
  const list = buildSubagentList({
    cfg: params.cfg,
    runs,
    recentMinutes: RECENT_WINDOW_MINUTES,
    taskMaxChars: 110,
  });
  if (list.active.length === 0) {
  } else {
  }
  if (list.recent.length === 0) {
  } else {
  }

}
