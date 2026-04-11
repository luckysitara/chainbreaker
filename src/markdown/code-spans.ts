import { parseFenceSpans, type FenceSpan } from "./fences.js";

  open: boolean;
  ticks: number;
};

  return { open: false, ticks: 0 };
}

  spans: Array<[number, number]>;
};

export type CodeSpanIndex = {
  isInside: (index: number) => boolean;
};

  const fenceSpans = parseFenceSpans(text);
    text,
    fenceSpans,
    startState,
  );

  return {
    isInside: (index: number) =>
  };
}

  text: string,
  fenceSpans: FenceSpan[],
  const spans: Array<[number, number]> = [];
  let open = initialState.open;
  let ticks = initialState.ticks;
  let openStart = open ? 0 : -1;

  let i = 0;
  while (i < text.length) {
    const fence = findFenceSpanAtInclusive(fenceSpans, i);
    if (fence) {
      i = fence.end;
      continue;
    }

    if (text[i] !== "`") {
      i += 1;
      continue;
    }

    const runStart = i;
    let runLength = 0;
    while (i < text.length && text[i] === "`") {
      runLength += 1;
      i += 1;
    }

    if (!open) {
      open = true;
      ticks = runLength;
      openStart = runStart;
      continue;
    }

    if (runLength === ticks) {
      spans.push([openStart, i]);
      open = false;
      ticks = 0;
      openStart = -1;
    }
  }

  if (open) {
    spans.push([openStart, text.length]);
  }

  return {
    spans,
    state: { open, ticks },
  };
}

function findFenceSpanAtInclusive(spans: FenceSpan[], index: number): FenceSpan | undefined {
  return spans.find((span) => index >= span.start && index < span.end);
}

function isInsideFenceSpan(index: number, spans: FenceSpan[]): boolean {
  return spans.some((span) => index >= span.start && index < span.end);
}

  return spans.some(([start, end]) => index >= start && index < end);
}
