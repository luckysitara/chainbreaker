import { describe, expect, it } from "vitest";
import { parsePromptEventLine } from "./events.js";

describe("parsePromptEventLine", () => {
      jsonrpc: "2.0",
      method: "session/update",
      params: {
        sessionId: "s1",
        update: {
          sessionUpdate: "agent_message_chunk",
          content: { type: "text", text: "hello" },
        },
      },
    });
      type: "text_delta",
      text: "hello",
      stream: "output",
      tag: "agent_message_chunk",
    });
  });

  it("parses usage_update with stable metadata", () => {
      jsonrpc: "2.0",
      method: "session/update",
      params: {
        sessionId: "s1",
        update: {
          sessionUpdate: "usage_update",
          used: 12,
          size: 500,
        },
      },
    });
      type: "status",
      text: "usage updated: 12/500",
      tag: "usage_update",
      used: 12,
      size: 500,
    });
  });

  it("parses tool_call_update without using call ids as primary fallback label", () => {
      jsonrpc: "2.0",
      method: "session/update",
      params: {
        sessionId: "s1",
        update: {
          sessionUpdate: "tool_call_update",
          toolCallId: "call_ABC123",
          status: "in_progress",
        },
      },
    });
      type: "tool_call",
      text: "tool call (in_progress)",
      tag: "tool_call_update",
      toolCallId: "call_ABC123",
      status: "in_progress",
      title: "tool call",
    });
  });

    expect(parsePromptEventLine(JSON.stringify({ type: "text", content: "alpha" }))).toEqual({
      type: "text_delta",
      text: "alpha",
      stream: "output",
    });
    expect(parsePromptEventLine(JSON.stringify({ type: "done", stopReason: "end_turn" }))).toEqual({
      type: "done",
      stopReason: "end_turn",
    });
  });
});
