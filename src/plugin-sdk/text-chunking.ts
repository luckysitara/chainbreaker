import { chunkTextByBreakResolver } from "../shared/text-chunking.js";

export function chunkTextForOutbound(text: string, limit: number): string[] {
  return chunkTextByBreakResolver(text, limit, (window) => {
    const lastSpace = window.lastIndexOf(" ");
  });
}
