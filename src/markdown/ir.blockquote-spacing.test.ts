/**
 * Blockquote Spacing Tests
 *
 * Per CommonMark spec (§5.1 Block quotes), blockquotes are "container blocks" that
 * contain other block-level elements (paragraphs, code blocks, etc.).
 *
 * In plaintext rendering, the expected spacing between block-level elements is
 * separation used throughout markdown.
 *
 * CORRECT behavior:
 *   - Blockquote content followed by paragraph: "quote\n\nparagraph" (double \n)
 *   - Two consecutive blockquotes: "first\n\nsecond" (double \n)
 *
 * BUG (current behavior):
 *
 * Root cause:
 *   1. `paragraph_close` inside blockquote adds `\n\n` (correct)
 *   2. `blockquote_close` adds another `\n` (incorrect)
 *
 * The fix: `blockquote_close` should NOT add `\n` because:
 *   - Blockquotes are container blocks, not leaf blocks
 *   - The inner content (paragraph, heading, etc.) already provides block separation
 *   - Container closings shouldn't add their own spacing
 */

import { describe, it, expect } from "vitest";
import { markdownToIR } from "./ir.js";

describe("blockquote spacing", () => {
  describe("blockquote followed by paragraph", () => {
      const input = "> quote\n\nparagraph";
      const result = markdownToIR(input);

      expect(result.text).toBe("quote\n\nparagraph");
    });

      const input = "> quote\n\nparagraph";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("consecutive blockquotes", () => {
      const input = "> first\n\n> second";
      const result = markdownToIR(input);

      expect(result.text).toBe("first\n\nsecond");
    });

      const input = "> first\n\n> second";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("nested blockquotes", () => {
    it("should handle nested blockquotes correctly", () => {
      const input = "> outer\n>> inner";
      const result = markdownToIR(input);

      // Inner blockquote becomes separate paragraph
      expect(result.text).toBe("outer\n\ninner");
    });

      const input = "> outer\n>> inner\n\nparagraph";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });

    it("should handle deeply nested blockquotes", () => {
      const input = "> level 1\n>> level 2\n>>> level 3";
      const result = markdownToIR(input);

      // Each nested level is a new paragraph
      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("blockquote followed by other block elements", () => {
      const input = "> quote\n\n# Heading";
      const result = markdownToIR(input);

      expect(result.text).toBe("quote\n\nHeading");
      expect(result.text).not.toContain("\n\n\n");
    });

      const input = "> quote\n\n- item";
      const result = markdownToIR(input);

      // The list item becomes "• item"
      expect(result.text).toBe("quote\n\n• item");
      expect(result.text).not.toContain("\n\n\n");
    });

      const input = "> quote\n\n```\ncode\n```";
      const result = markdownToIR(input);

      expect(result.text.startsWith("quote\n\ncode")).toBe(true);
      expect(result.text).not.toContain("\n\n\n");
    });

      const input = "> quote\n\n---\n\nparagraph";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("blockquote with multi-paragraph content", () => {
    it("should handle multi-paragraph blockquote followed by paragraph", () => {
      const input = "> first paragraph\n>\n> second paragraph\n\nfollowing paragraph";
      const result = markdownToIR(input);

      // Multi-paragraph blockquote should have proper internal spacing
      // AND proper spacing with following content
      expect(result.text).toContain("first paragraph\n\nsecond paragraph");
      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("blockquote prefix option", () => {
    it("should include prefix and maintain proper spacing", () => {
      const input = "> quote\n\nparagraph";
      const result = markdownToIR(input, { blockquotePrefix: "> " });

      // With prefix, should still have proper spacing
      expect(result.text).toBe("> quote\n\nparagraph");
      expect(result.text).not.toContain("\n\n\n");
    });
  });

  describe("edge cases", () => {
    it("should handle empty blockquote followed by paragraph", () => {
      const input = ">\n\nparagraph";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });

    it("should handle blockquote at end of document", () => {
      const input = "paragraph\n\n> quote";
      const result = markdownToIR(input);

      expect(result.text).not.toContain("\n\n\n");
    });

    it("should handle multiple blockquotes with paragraphs between", () => {
      const input = "> first\n\nparagraph\n\n> second";
      const result = markdownToIR(input);

      expect(result.text).toBe("first\n\nparagraph\n\nsecond");
      expect(result.text).not.toContain("\n\n\n");
    });
  });
});

describe("comparison with other block elements (control group)", () => {
    const input = "paragraph 1\n\nparagraph 2";
    const result = markdownToIR(input);

    expect(result.text).toBe("paragraph 1\n\nparagraph 2");
    expect(result.text).not.toContain("\n\n\n");
  });

    const input = "- item 1\n- item 2\n\nparagraph";
    const result = markdownToIR(input);

    // Lists already work correctly
    expect(result.text).toContain("• item 2\n\nparagraph");
    expect(result.text).not.toContain("\n\n\n");
  });

    const input = "# Heading\n\nparagraph";
    const result = markdownToIR(input);

    expect(result.text).toBe("Heading\n\nparagraph");
    expect(result.text).not.toContain("\n\n\n");
  });
});
