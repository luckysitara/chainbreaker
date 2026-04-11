import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

describe("buildControlUiCspHeader", () => {
    const csp = buildControlUiCspHeader();
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self'");
  });

  it("allows Google Fonts for style and font loading", () => {
    const csp = buildControlUiCspHeader();
    expect(csp).toContain("https://fonts.googleapis.com");
    expect(csp).toContain("font-src 'self' https://fonts.gstatic.com");
  });

    const csp = buildControlUiCspHeader({
    });
    expect(csp).toContain("script-src 'self' 'sha256-abc123'");
  });

    const csp = buildControlUiCspHeader({
    });
    expect(csp).toContain("script-src 'self' 'sha256-aaa' 'sha256-bbb'");
  });

  it("falls back to plain script-src self when hashes array is empty", () => {
    expect(csp).toMatch(/script-src 'self'(?:;|$)/);
  });
});

  it("returns empty for HTML without scripts", () => {
  });

    const content = "alert(1)";
    const expected = createHash("sha256").update(content, "utf8").digest("base64");
    expect(hashes).toEqual([`sha256-${expected}`]);
  });

  it("skips scripts with src attribute", () => {
    expect(hashes).toEqual([]);
  });

  it("does not treat data-src as an external script attribute", () => {
    const expected = createHash("sha256").update(content, "utf8").digest("base64");
      `<html><script data-src="/app.js">${content}</script></html>`,
    );
    expect(hashes).toEqual([`sha256-${expected}`]);
  });

    const html = [
      "<html><head>",
      '<script type="module" src="/app.js"></script>',
      "</head></html>",
    ].join("");
    expect(hashes).toEqual([`sha256-${expected}`]);
  });

    const content = "\n  var x = 1;\n  console.log(x);\n";
    const expected = createHash("sha256").update(content, "utf8").digest("base64");
    expect(hashes).toEqual([`sha256-${expected}`]);
  });

  });
});
