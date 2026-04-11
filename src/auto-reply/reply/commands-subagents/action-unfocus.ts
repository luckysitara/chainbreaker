import { getSessionBindingService } from "../../../infra/outbound/session-binding-service.js";
import type { CommandHandlerResult } from "../commands-types.js";
import {
  resolveMatrixConversationId,
  resolveMatrixParentConversationId,
import {
  type SubagentsCommandContext,
  isDiscordSurface,
  isMatrixSurface,
  isTelegramSurface,
  resolveChannelAccountId,
  resolveCommandSurfaceChannel,
  resolveTelegramConversationId,
  stopWithText,
} from "./shared.js";

export async function handleSubagentsUnfocusAction(
  ctx: SubagentsCommandContext,
): Promise<CommandHandlerResult> {
  const { params } = ctx;
  const channel = resolveCommandSurfaceChannel(params);
    return stopWithText("⚠️ /unfocus is only available on Discord, Matrix, and Telegram.");
  }

  const accountId = resolveChannelAccountId(params);
  const bindingService = getSessionBindingService();

  const conversationId = (() => {
    if (isDiscordSurface(params)) {
      const threadId = params.ctx.MessageThreadId != null ? String(params.ctx.MessageThreadId) : "";
      return threadId.trim() || undefined;
    }
    if (isTelegramSurface(params)) {
      return resolveTelegramConversationId(params);
    }
    if (isMatrixSurface(params)) {
      return resolveMatrixConversationId({
        ctx: {
          MessageThreadId: params.ctx.MessageThreadId,
          OriginatingTo: params.ctx.OriginatingTo,
          To: params.ctx.To,
        },
        command: {
          to: params.command.to,
        },
      });
    }
    return undefined;
  })();
  const parentConversationId = (() => {
    if (!isMatrixSurface(params)) {
      return undefined;
    }
    return resolveMatrixParentConversationId({
      ctx: {
        MessageThreadId: params.ctx.MessageThreadId,
        OriginatingTo: params.ctx.OriginatingTo,
        To: params.ctx.To,
      },
      command: {
        to: params.command.to,
      },
    });
  })();

  if (!conversationId) {
      return stopWithText("⚠️ /unfocus must be run inside a Discord thread.");
    }
      return stopWithText("⚠️ /unfocus must be run inside a Matrix thread.");
    }
    return stopWithText(
      "⚠️ /unfocus on Telegram requires a topic context in groups, or a direct-message conversation.",
    );
  }

  const binding = bindingService.resolveByConversation({
    channel,
    accountId,
    conversationId,
    ...(parentConversationId && parentConversationId !== conversationId
      ? { parentConversationId }
      : {}),
  });
  if (!binding) {
    return stopWithText(
        ? "ℹ️ This thread is not currently focused."
          ? "ℹ️ This thread is not currently focused."
          : "ℹ️ This conversation is not currently focused.",
    );
  }

  const senderId = params.command.senderId?.trim() || "";
  const boundBy =
    typeof binding.metadata?.boundBy === "string" ? binding.metadata.boundBy.trim() : "";
  if (boundBy && boundBy !== "system" && senderId && senderId !== boundBy) {
    return stopWithText(
        ? `⚠️ Only ${boundBy} can unfocus this thread.`
          ? `⚠️ Only ${boundBy} can unfocus this thread.`
          : `⚠️ Only ${boundBy} can unfocus this conversation.`,
    );
  }

  await bindingService.unbind({
    bindingId: binding.bindingId,
    reason: "manual",
  });
  return stopWithText(
      ? "✅ Thread unfocused."
      : "✅ Conversation unfocused.",
  );
}
