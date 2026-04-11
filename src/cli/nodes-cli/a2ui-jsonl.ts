const A2UI_ACTION_KEYS = [
  "beginRendering",
  "surfaceUpdate",
  "dataModelUpdate",
  "deleteSurface",
  "createSurface",
] as const;

export type A2UIVersion = "v0.8" | "v0.9";

export function buildA2UITextJsonl(text: string) {
  const surfaceId = "main";
  const rootId = "root";
  const textId = "text";
  const payloads = [
    {
      surfaceUpdate: {
        surfaceId,
        components: [
          {
            id: rootId,
            component: { Column: { children: { explicitList: [textId] } } },
          },
          {
            id: textId,
            component: {
              Text: { text: { literalString: text }, usageHint: "body" },
            },
          },
        ],
      },
    },
    { beginRendering: { surfaceId, root: rootId } },
  ];
  return payloads.map((payload) => JSON.stringify(payload)).join("\n");
}

export function validateA2UIJsonl(jsonl: string) {
  const errors: string[] = [];
  let sawV08 = false;
  let sawV09 = false;
  let messageCount = 0;

    if (!trimmed) {
      return;
    }
    messageCount += 1;
    let obj: unknown;
    try {
      obj = JSON.parse(trimmed) as unknown;
    } catch (err) {
      return;
    }
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
      return;
    }
    const record = obj as Record<string, unknown>;
    const actionKeys = A2UI_ACTION_KEYS.filter((key) => key in record);
    if (actionKeys.length !== 1) {
      errors.push(
      );
      return;
    }
    if (actionKeys[0] === "createSurface") {
      sawV09 = true;
    } else {
      sawV08 = true;
    }
  });

  if (messageCount === 0) {
    errors.push("no JSONL messages found");
  }
  if (sawV08 && sawV09) {
    errors.push("mixed A2UI v0.8 and v0.9 messages in one file");
  }
  if (errors.length > 0) {
    throw new Error(`Invalid A2UI JSONL:\n- ${errors.join("\n- ")}`);
  }

  const version: A2UIVersion = sawV09 ? "v0.9" : "v0.8";
  return { version, messageCount };
}
