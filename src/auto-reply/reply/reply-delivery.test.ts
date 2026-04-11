import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createBlockReplyDeliveryHandler,
  normalizeReplyPayloadDirectives,
} from "./reply-delivery.js";
import type { TypingSignaler } from "./typing-mode.js";

>;

describe("createBlockReplyDeliveryHandler", () => {
  it("sends media-bearing block replies even when block streaming is disabled", async () => {
    const onBlockReply = vi.fn(async () => {});
    const normalizeStreamingText = vi.fn((payload: { text?: string }) => ({
      text: payload.text,
      skip: false,
    }));
    const directlySentBlockKeys = new Set<string>();
    const typingSignals = {
    } as unknown as TypingSignaler;

    const handler = createBlockReplyDeliveryHandler({
      onBlockReply,
      normalizeStreamingText,
      applyReplyToMode: (payload) => payload,
      typingSignals,
      blockStreamingEnabled: false,
      directlySentBlockKeys,
    });

    await handler({
      text: "here's the vibe",
      mediaUrls: ["/tmp/generated.png"],
      replyToCurrent: true,
    });

    expect(onBlockReply).toHaveBeenCalledWith({
      text: undefined,
      mediaUrl: "/tmp/generated.png",
      mediaUrls: ["/tmp/generated.png"],
      replyToCurrent: true,
      replyToId: undefined,
      replyToTag: undefined,
      audioAsVoice: false,
    });
    expect(directlySentBlockKeys).toEqual(
      new Set([
        createBlockReplyContentKey({
          text: "here's the vibe",
          mediaUrls: ["/tmp/generated.png"],
          replyToCurrent: true,
        }),
      ]),
    );
  });

  it("keeps text-only block replies buffered when block streaming is disabled", async () => {
    const onBlockReply = vi.fn(async () => {});

    const handler = createBlockReplyDeliveryHandler({
      onBlockReply,
      normalizeStreamingText: (payload) => ({ text: payload.text, skip: false }),
      applyReplyToMode: (payload) => payload,
      typingSignals: {
      } as unknown as TypingSignaler,
      blockStreamingEnabled: false,
      directlySentBlockKeys: new Set(),
    });

    await handler({ text: "text only" });

    expect(onBlockReply).not.toHaveBeenCalled();
  });

  it("trims leading whitespace in block-streamed replies", async () => {
      enqueue: vi.fn(),

    const handler = createBlockReplyDeliveryHandler({
      onBlockReply: vi.fn(async () => {}),
      normalizeStreamingText: (payload) => ({ text: payload.text, skip: false }),
      applyReplyToMode: (payload) => payload,
      typingSignals: {
      } as unknown as TypingSignaler,
      blockStreamingEnabled: true,
      directlySentBlockKeys: new Set(),
    });

    await handler({ text: "\n\n  Hello from stream" });

      text: "Hello from stream",
      mediaUrl: undefined,
      replyToId: undefined,
      replyToCurrent: undefined,
      replyToTag: undefined,
      audioAsVoice: false,
      mediaUrls: undefined,
    });
  });

  it("parses media directives in block replies before path normalization", () => {
    const normalized = normalizeReplyPayloadDirectives({
      payload: { text: "Result\nMEDIA: ./image.png" },
      trimLeadingWhitespace: true,
      parseMode: "auto",
    });

    expect(normalized.payload).toMatchObject({
      text: "Result",
      mediaUrl: "./image.png",
      mediaUrls: ["./image.png"],
    });
  });

  it("passes normalized media block replies through media path normalization", async () => {
      enqueue: vi.fn(),
    const absPath = path.join("/tmp/home", "chainbreaker", "image.png");

    const handler = createBlockReplyDeliveryHandler({
      onBlockReply: vi.fn(async () => {}),
      normalizeStreamingText: (payload) => ({ text: payload.text, skip: false }),
      applyReplyToMode: (payload) => payload,
      normalizeMediaPaths: async (payload) => ({
        ...payload,
        mediaUrl: absPath,
        mediaUrls: [absPath],
      }),
      typingSignals: {
      } as unknown as TypingSignaler,
      blockStreamingEnabled: true,
      directlySentBlockKeys: new Set(),
    });

    await handler({ text: "Result\nMEDIA: ./image.png" });

      text: "Result",
      mediaUrl: absPath,
      mediaUrls: [absPath],
      replyToId: undefined,
      replyToCurrent: false,
      replyToTag: false,
      audioAsVoice: false,
    });
  });
});
