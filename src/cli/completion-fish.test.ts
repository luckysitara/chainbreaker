import { describe, expect, it } from "vitest";
import {
  buildFishOptionCompletionLine,
  buildFishSubcommandCompletionLine,
  escapeFishDescription,
} from "./completion-fish.js";

describe("completion-fish helpers", () => {
  it("escapes single quotes in descriptions", () => {
    expect(escapeFishDescription("Bob's plugin")).toBe("Bob'\\''s plugin");
  });

      rootCmd: "chainbreaker",
      condition: "__fish_use_subcommand",
      name: "plugins",
      description: "Manage Bob's plugins",
    });
      `complete -c chainbreaker -n "__fish_use_subcommand" -a "plugins" -d 'Manage Bob'\\''s plugins'\n`,
    );
  });

      rootCmd: "chainbreaker",
      condition: "__fish_use_subcommand",
      flags: "-s, --shell <shell>",
      description: "Shell target",
    });
      `complete -c chainbreaker -n "__fish_use_subcommand" -s s -l shell -d 'Shell target'\n`,
    );
  });

      rootCmd: "chainbreaker",
      condition: "__fish_seen_subcommand_from completion",
      flags: "--write-state",
      description: "Write cache",
    });
      `complete -c chainbreaker -n "__fish_seen_subcommand_from completion" -l write-state -d 'Write cache'\n`,
    );
  });
});
