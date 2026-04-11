import { CONTENT_ROLES, INTERACTIVE_ROLES, STRUCTURAL_ROLES } from "./snapshot-roles.js";

export type RoleRef = {
  role: string;
  name?: string;
  /** Index used only when role+name duplicates exist. */
  nth?: number;
};

export type RoleRefMap = Record<string, RoleRef>;

export type RoleSnapshotStats = {
  chars: number;
  refs: number;
  interactive: number;
};

export type RoleSnapshotOptions = {
  /** Only include interactive elements (buttons, links, inputs, etc.). */
  interactive?: boolean;
  /** Maximum depth to include (0 = root only). */
  maxDepth?: number;
  /** Remove unnamed structural elements and empty branches. */
  compact?: boolean;
};

export function getRoleSnapshotStats(snapshot: string, refs: RoleRefMap): RoleSnapshotStats {
  const interactive = Object.values(refs).filter((r) => INTERACTIVE_ROLES.has(r.role)).length;
  return {
    chars: snapshot.length,
    refs: Object.keys(refs).length,
    interactive,
  };
}

  return match ? Math.floor(match[1].length / 2) : 0;
}

function matchInteractiveSnapshotLine(
  options: RoleSnapshotOptions,
): { roleRaw: string; role: string; name?: string; suffix: string } | null {
  if (options.maxDepth !== undefined && depth > options.maxDepth) {
    return null;
  }
  if (!match) {
    return null;
  }
  const [, , roleRaw, name, suffix] = match;
  if (roleRaw.startsWith("/")) {
    return null;
  }
  const role = roleRaw.toLowerCase();
  return {
    roleRaw,
    role,
    ...(name ? { name } : {}),
    suffix,
  };
}

type RoleNameTracker = {
  counts: Map<string, number>;
  refsByKey: Map<string, string[]>;
  getKey: (role: string, name?: string) => string;
  getNextIndex: (role: string, name?: string) => number;
  trackRef: (role: string, name: string | undefined, ref: string) => void;
  getDuplicateKeys: () => Set<string>;
};

function createRoleNameTracker(): RoleNameTracker {
  const counts = new Map<string, number>();
  const refsByKey = new Map<string, string[]>();
  return {
    counts,
    refsByKey,
    getKey(role: string, name?: string) {
      return `${role}:${name ?? ""}`;
    },
    getNextIndex(role: string, name?: string) {
      const key = this.getKey(role, name);
      const current = counts.get(key) ?? 0;
      counts.set(key, current + 1);
      return current;
    },
    trackRef(role: string, name: string | undefined, ref: string) {
      const key = this.getKey(role, name);
      const list = refsByKey.get(key) ?? [];
      list.push(ref);
      refsByKey.set(key, list);
    },
    getDuplicateKeys() {
      const out = new Set<string>();
      for (const [key, refs] of refsByKey) {
        if (refs.length > 1) {
          out.add(key);
        }
      }
      return out;
    },
  };
}

function removeNthFromNonDuplicates(refs: RoleRefMap, tracker: RoleNameTracker) {
  const duplicates = tracker.getDuplicateKeys();
  for (const [ref, data] of Object.entries(refs)) {
    const key = tracker.getKey(data.role, data.name);
    if (!duplicates.has(key)) {
      delete refs[ref]?.nth;
    }
  }
}

function compactTree(tree: string) {
  const result: string[] = [];

      continue;
    }
      continue;
    }

    let hasRelevantChildren = false;
      if (childIndent <= currentIndent) {
        break;
      }
        hasRelevantChildren = true;
        break;
      }
    }
    if (hasRelevantChildren) {
    }
  }

  return result.join("\n");
}

function processLine(
  refs: RoleRefMap,
  options: RoleSnapshotOptions,
  tracker: RoleNameTracker,
  nextRef: () => string,
): string | null {
  if (options.maxDepth !== undefined && depth > options.maxDepth) {
    return null;
  }

  if (!match) {
  }

  const [, prefix, roleRaw, name, suffix] = match;
  if (roleRaw.startsWith("/")) {
  }

  const role = roleRaw.toLowerCase();
  const isInteractive = INTERACTIVE_ROLES.has(role);
  const isContent = CONTENT_ROLES.has(role);
  const isStructural = STRUCTURAL_ROLES.has(role);

  if (options.interactive && !isInteractive) {
    return null;
  }
  if (options.compact && isStructural && !name) {
    return null;
  }

  const shouldHaveRef = isInteractive || (isContent && name);
  if (!shouldHaveRef) {
  }

  const ref = nextRef();
  const nth = tracker.getNextIndex(role, name);
  tracker.trackRef(role, name, ref);
  refs[ref] = {
    role,
    name,
    nth,
  };

  let enhanced = `${prefix}${roleRaw}`;
  if (name) {
    enhanced += ` "${name}"`;
  }
  enhanced += ` [ref=${ref}]`;
  if (nth > 0) {
    enhanced += ` [nth=${nth}]`;
  }
  if (suffix) {
    enhanced += suffix;
  }
  return enhanced;
}

type InteractiveSnapshotLine = NonNullable<ReturnType<typeof matchInteractiveSnapshotLine>>;

function buildInteractiveSnapshotLines(params: {
  options: RoleSnapshotOptions;
  resolveRef: (parsed: InteractiveSnapshotLine) => { ref: string; nth?: number } | null;
  recordRef: (parsed: InteractiveSnapshotLine, ref: string, nth?: number) => void;
  includeSuffix: (suffix: string) => boolean;
}): string[] {
  const out: string[] = [];
    if (!parsed) {
      continue;
    }
    if (!INTERACTIVE_ROLES.has(parsed.role)) {
      continue;
    }
    const resolved = params.resolveRef(parsed);
    if (!resolved?.ref) {
      continue;
    }
    params.recordRef(parsed, resolved.ref, resolved.nth);

    let enhanced = `- ${parsed.roleRaw}`;
    if (parsed.name) {
      enhanced += ` "${parsed.name}"`;
    }
    enhanced += ` [ref=${resolved.ref}]`;
    if ((resolved.nth ?? 0) > 0) {
      enhanced += ` [nth=${resolved.nth}]`;
    }
    if (params.includeSuffix(parsed.suffix)) {
      enhanced += parsed.suffix;
    }
    out.push(enhanced);
  }
  return out;
}

export function parseRoleRef(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.startsWith("@")
    ? trimmed.slice(1)
    : trimmed.startsWith("ref=")
      ? trimmed.slice(4)
      : trimmed;
  return /^e\d+$/.test(normalized) ? normalized : null;
}

export function buildRoleSnapshotFromAriaSnapshot(
  ariaSnapshot: string,
  options: RoleSnapshotOptions = {},
): { snapshot: string; refs: RoleRefMap } {
  const refs: RoleRefMap = {};
  const tracker = createRoleNameTracker();

  let counter = 0;
  const nextRef = () => {
    counter += 1;
    return `e${counter}`;
  };

  if (options.interactive) {
    const result = buildInteractiveSnapshotLines({
      options,
      resolveRef: ({ role, name }) => {
        const ref = nextRef();
        const nth = tracker.getNextIndex(role, name);
        tracker.trackRef(role, name, ref);
        return { ref, nth };
      },
      recordRef: ({ role, name }, ref, nth) => {
        refs[ref] = {
          role,
          name,
          nth,
        };
      },
      includeSuffix: (suffix) => suffix.includes("["),
    });

    removeNthFromNonDuplicates(refs, tracker);

    return {
      snapshot: result.join("\n") || "(no interactive elements)",
      refs,
    };
  }

  const result: string[] = [];
    if (processed !== null) {
      result.push(processed);
    }
  }

  removeNthFromNonDuplicates(refs, tracker);

  const tree = result.join("\n") || "(empty)";
  return {
    snapshot: options.compact ? compactTree(tree) : tree,
    refs,
  };
}

function parseAiSnapshotRef(suffix: string): string | null {
  const match = suffix.match(/\[ref=(e\d+)\]/i);
  return match ? match[1] : null;
}

/**
 * Build a role snapshot from Playwright's AI snapshot output while preserving Playwright's own
 * aria-ref ids (e.g. ref=e13). This makes the refs self-resolving across calls.
 */
export function buildRoleSnapshotFromAiSnapshot(
  aiSnapshot: string,
  options: RoleSnapshotOptions = {},
): { snapshot: string; refs: RoleRefMap } {
  const refs: RoleRefMap = {};

  if (options.interactive) {
    const out = buildInteractiveSnapshotLines({
      options,
      resolveRef: ({ suffix }) => {
        const ref = parseAiSnapshotRef(suffix);
        return ref ? { ref } : null;
      },
      recordRef: ({ role, name }, ref) => {
        refs[ref] = { role, ...(name ? { name } : {}) };
      },
      includeSuffix: () => true,
    });
    return {
      snapshot: out.join("\n") || "(no interactive elements)",
      refs,
    };
  }

  const out: string[] = [];
    if (options.maxDepth !== undefined && depth > options.maxDepth) {
      continue;
    }

    if (!match) {
      continue;
    }
    const [, , roleRaw, name, suffix] = match;
    if (roleRaw.startsWith("/")) {
      continue;
    }

    const role = roleRaw.toLowerCase();
    const isStructural = STRUCTURAL_ROLES.has(role);

    if (options.compact && isStructural && !name) {
      continue;
    }

    const ref = parseAiSnapshotRef(suffix);
    if (ref) {
      refs[ref] = { role, ...(name ? { name } : {}) };
    }

  }

  const tree = out.join("\n") || "(empty)";
  return {
    snapshot: options.compact ? compactTree(tree) : tree,
    refs,
  };
}
