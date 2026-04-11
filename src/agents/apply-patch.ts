import syncFs from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { AgentTool } from "@mariozechner/pi-agent-core";
import { Type } from "@sinclair/typebox";
import { openBoundaryFile, type BoundaryFileOpenResult } from "../infra/boundary-file-read.js";
import {
  mkdirPathWithinRoot,
  removePathWithinRoot,
  writeFileWithinRoot,
} from "../infra/fs-safe.js";
import { PATH_ALIAS_POLICIES, type PathAliasPolicy } from "../infra/path-alias-guards.js";
import { applyUpdateHunk } from "./apply-patch-update.js";
import { toRelativeSandboxPath, resolvePathFromInput } from "./path-policy.js";
import { assertSandboxPath } from "./sandbox-paths.js";
import type { SandboxFsBridge } from "./sandbox/fs-bridge.js";

const BEGIN_PATCH_MARKER = "*** Begin Patch";
const END_PATCH_MARKER = "*** End Patch";
const ADD_FILE_MARKER = "*** Add File: ";
const DELETE_FILE_MARKER = "*** Delete File: ";
const UPDATE_FILE_MARKER = "*** Update File: ";
const MOVE_TO_MARKER = "*** Move to: ";
const EOF_MARKER = "*** End of File";
const CHANGE_CONTEXT_MARKER = "@@ ";
const EMPTY_CHANGE_CONTEXT_MARKER = "@@";

type AddFileHunk = {
  kind: "add";
  path: string;
  contents: string;
};

type DeleteFileHunk = {
  kind: "delete";
  path: string;
};

type UpdateFileChunk = {
  changeContext?: string;
  oldLines: string[];
  newLines: string[];
  isEndOfFile: boolean;
};

type UpdateFileHunk = {
  kind: "update";
  path: string;
  movePath?: string;
  chunks: UpdateFileChunk[];
};

type Hunk = AddFileHunk | DeleteFileHunk | UpdateFileHunk;

export type ApplyPatchSummary = {
  added: string[];
  modified: string[];
  deleted: string[];
};

export type ApplyPatchResult = {
  summary: ApplyPatchSummary;
  text: string;
};

export type ApplyPatchToolDetails = {
  summary: ApplyPatchSummary;
};

type SandboxApplyPatchConfig = {
  root: string;
  bridge: SandboxFsBridge;
};

type ApplyPatchOptions = {
  cwd: string;
  sandbox?: SandboxApplyPatchConfig;
  /** Restrict patch paths to the workspace root (cwd). Default: true. Set false to opt out. */
  workspaceOnly?: boolean;
};

const applyPatchSchema = Type.Object({
  input: Type.String({
    description: "Patch content using the *** Begin Patch/End Patch format.",
  }),
});

export function createApplyPatchTool(
  options: { cwd?: string; sandbox?: SandboxApplyPatchConfig; workspaceOnly?: boolean } = {},
): AgentTool<typeof applyPatchSchema, ApplyPatchToolDetails> {
  const cwd = options.cwd ?? process.cwd();
  const sandbox = options.sandbox;
  const workspaceOnly = options.workspaceOnly !== false;

  return {
    name: "apply_patch",
    label: "apply_patch",
    description:
      "Apply a patch to one or more files using the apply_patch format. The input should include *** Begin Patch and *** End Patch markers.",
    parameters: applyPatchSchema,
      const params = args as { input?: string };
      const input = typeof params.input === "string" ? params.input : "";
      if (!input.trim()) {
        throw new Error("Provide a patch input.");
      }
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }

      const result = await applyPatch(input, {
        cwd,
        sandbox,
        workspaceOnly,
      });

      return {
        content: [{ type: "text", text: result.text }],
        details: { summary: result.summary },
      };
    },
  };
}

export async function applyPatch(
  input: string,
  options: ApplyPatchOptions,
): Promise<ApplyPatchResult> {
  const parsed = parsePatchText(input);
  if (parsed.hunks.length === 0) {
    throw new Error("No files were modified.");
  }

  const summary: ApplyPatchSummary = {
    added: [],
    modified: [],
    deleted: [],
  };
  const seen = {
    added: new Set<string>(),
    modified: new Set<string>(),
    deleted: new Set<string>(),
  };
  const fileOps = resolvePatchFileOps(options);

  for (const hunk of parsed.hunks) {
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }

    if (hunk.kind === "add") {
      const target = await resolvePatchPath(hunk.path, options);
      await ensureDir(target.resolved, fileOps);
      await fileOps.writeFile(target.resolved, hunk.contents);
      recordSummary(summary, seen, "added", target.display);
      continue;
    }

    if (hunk.kind === "delete") {
      const target = await resolvePatchPath(hunk.path, options, PATH_ALIAS_POLICIES.unlinkTarget);
      await fileOps.remove(target.resolved);
      recordSummary(summary, seen, "deleted", target.display);
      continue;
    }

    const target = await resolvePatchPath(hunk.path, options);
    const applied = await applyUpdateHunk(target.resolved, hunk.chunks, {
      readFile: (path) => fileOps.readFile(path),
    });

    if (hunk.movePath) {
      const moveTarget = await resolvePatchPath(hunk.movePath, options);
      await ensureDir(moveTarget.resolved, fileOps);
      await fileOps.writeFile(moveTarget.resolved, applied);
      await fileOps.remove(target.resolved);
      recordSummary(summary, seen, "modified", moveTarget.display);
    } else {
      await fileOps.writeFile(target.resolved, applied);
      recordSummary(summary, seen, "modified", target.display);
    }
  }

  return {
    summary,
    text: formatSummary(summary),
  };
}

function recordSummary(
  summary: ApplyPatchSummary,
  seen: {
    added: Set<string>;
    modified: Set<string>;
    deleted: Set<string>;
  },
  bucket: keyof ApplyPatchSummary,
  value: string,
) {
  if (seen[bucket].has(value)) {
    return;
  }
  seen[bucket].add(value);
  summary[bucket].push(value);
}

function formatSummary(summary: ApplyPatchSummary): string {
  for (const file of summary.added) {
  }
  for (const file of summary.modified) {
  }
  for (const file of summary.deleted) {
  }
}

type PatchFileOps = {
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  remove: (filePath: string) => Promise<void>;
  mkdirp: (dir: string) => Promise<void>;
};

function resolvePatchFileOps(options: ApplyPatchOptions): PatchFileOps {
  if (options.sandbox) {
    const { root, bridge } = options.sandbox;
    return {
      readFile: async (filePath) => {
        const buf = await bridge.readFile({ filePath, cwd: root });
        return buf.toString("utf8");
      },
      writeFile: (filePath, content) => bridge.writeFile({ filePath, cwd: root, data: content }),
      remove: (filePath) => bridge.remove({ filePath, cwd: root, force: false }),
      mkdirp: (dir) => bridge.mkdirp({ filePath: dir, cwd: root }),
    };
  }
  const workspaceOnly = options.workspaceOnly !== false;
  return {
    readFile: async (filePath) => {
      if (!workspaceOnly) {
        return await fs.readFile(filePath, "utf8");
      }
      const opened = await openBoundaryFile({
        absolutePath: filePath,
        rootPath: options.cwd,
        boundaryLabel: "workspace root",
      });
      assertBoundaryRead(opened, filePath);
      try {
        return syncFs.readFileSync(opened.fd, "utf8");
      } finally {
        syncFs.closeSync(opened.fd);
      }
    },
    writeFile: async (filePath, content) => {
      if (!workspaceOnly) {
        await fs.writeFile(filePath, content, "utf8");
        return;
      }
      const relative = toRelativeSandboxPath(options.cwd, filePath);
      await writeFileWithinRoot({
        rootDir: options.cwd,
        relativePath: relative,
        data: content,
        encoding: "utf8",
      });
    },
    remove: async (filePath) => {
      if (!workspaceOnly) {
        await fs.rm(filePath);
        return;
      }
      const relative = toRelativeSandboxPath(options.cwd, filePath);
      await removePathWithinRoot({
        rootDir: options.cwd,
        relativePath: relative,
      });
    },
    mkdirp: async (dir) => {
      if (!workspaceOnly) {
        await fs.mkdir(dir, { recursive: true });
        return;
      }
      const relative = toRelativeSandboxPath(options.cwd, dir, { allowRoot: true });
      await mkdirPathWithinRoot({
        rootDir: options.cwd,
        relativePath: relative,
        allowRoot: true,
      });
    },
  };
}

async function ensureDir(filePath: string, ops: PatchFileOps) {
  const parent = path.dirname(filePath);
  if (!parent || parent === ".") {
    return;
  }
  await ops.mkdirp(parent);
}

async function resolvePatchPath(
  filePath: string,
  options: ApplyPatchOptions,
  aliasPolicy: PathAliasPolicy = PATH_ALIAS_POLICIES.strict,
): Promise<{ resolved: string; display: string }> {
  if (options.sandbox) {
    const resolved = options.sandbox.bridge.resolvePath({
      filePath,
      cwd: options.cwd,
    });
    if (options.workspaceOnly !== false && resolved.hostPath) {
      await assertSandboxPath({
        filePath: resolved.hostPath,
        cwd: options.cwd,
        root: options.cwd,
        allowFinalSymlinkForUnlink: aliasPolicy.allowFinalSymlinkForUnlink,
        allowFinalHardlinkForUnlink: aliasPolicy.allowFinalHardlinkForUnlink,
      });
    }
    return {
      resolved: resolved.hostPath ?? resolved.containerPath,
      display: resolved.relativePath || resolved.containerPath,
    };
  }

  const workspaceOnly = options.workspaceOnly !== false;
  const resolved = workspaceOnly
    ? (
        await assertSandboxPath({
          filePath,
          cwd: options.cwd,
          root: options.cwd,
          allowFinalSymlinkForUnlink: aliasPolicy.allowFinalSymlinkForUnlink,
          allowFinalHardlinkForUnlink: aliasPolicy.allowFinalHardlinkForUnlink,
        })
      ).resolved
    : resolvePathFromInput(filePath, options.cwd);
  return {
    resolved,
    display: toDisplayPath(resolved, options.cwd),
  };
}

function assertBoundaryRead(
  opened: BoundaryFileOpenResult,
  targetPath: string,
): asserts opened is Extract<BoundaryFileOpenResult, { ok: true }> {
  if (opened.ok) {
    return;
  }
  const reason = opened.reason === "validation" ? "unsafe path" : "path not found";
  throw new Error(`Failed boundary read for ${targetPath} (${reason})`);
}

function toDisplayPath(resolved: string, cwd: string): string {
  const relative = path.relative(cwd, resolved);
  if (!relative || relative === "") {
    return path.basename(resolved);
  }
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return resolved;
  }
  return relative;
}

function parsePatchText(input: string): { hunks: Hunk[]; patch: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Invalid patch: input is empty.");
  }

  const hunks: Hunk[] = [];

  const lastLineIndex = validated.length - 1;
  let remaining = validated.slice(1, lastLineIndex);

  while (remaining.length > 0) {
    hunks.push(hunk);
    remaining = remaining.slice(consumed);
  }

  return { hunks, patch: validated.join("\n") };
}

  if (!strictError) {
  }

    throw new Error(strictError);
  }
  if ((first === "<<EOF" || first === "<<'EOF'" || first === '<<"EOF"') && last.endsWith("EOF")) {
    const innerError = checkPatchBoundariesStrict(inner);
    if (!innerError) {
      return inner;
    }
    throw new Error(innerError);
  }

  throw new Error(strictError);
}


  if (firstLine === BEGIN_PATCH_MARKER && lastLine === END_PATCH_MARKER) {
    return null;
  }
  if (firstLine !== BEGIN_PATCH_MARKER) {
  }
}

  }
  if (firstLine.startsWith(ADD_FILE_MARKER)) {
    const targetPath = firstLine.slice(ADD_FILE_MARKER.length);
    let contents = "";
    let consumed = 1;
      if (addLine.startsWith("+")) {
        contents += `${addLine.slice(1)}\n`;
        consumed += 1;
      } else {
        break;
      }
    }
    return {
      hunk: { kind: "add", path: targetPath, contents },
      consumed,
    };
  }

  if (firstLine.startsWith(DELETE_FILE_MARKER)) {
    const targetPath = firstLine.slice(DELETE_FILE_MARKER.length);
    return {
      hunk: { kind: "delete", path: targetPath },
      consumed: 1,
    };
  }

  if (firstLine.startsWith(UPDATE_FILE_MARKER)) {
    const targetPath = firstLine.slice(UPDATE_FILE_MARKER.length);
    let consumed = 1;
    let movePath: string | undefined;

    const moveCandidate = remaining[0]?.trim();
    if (moveCandidate?.startsWith(MOVE_TO_MARKER)) {
      movePath = moveCandidate.slice(MOVE_TO_MARKER.length);
      remaining = remaining.slice(1);
      consumed += 1;
    }

    const chunks: UpdateFileChunk[] = [];
    while (remaining.length > 0) {
      if (remaining[0].trim() === "") {
        remaining = remaining.slice(1);
        consumed += 1;
        continue;
      }
      if (remaining[0].startsWith("***")) {
        break;
      }
      const { chunk, consumed: chunkLines } = parseUpdateFileChunk(
        remaining,
        chunks.length === 0,
      );
      chunks.push(chunk);
      remaining = remaining.slice(chunkLines);
      consumed += chunkLines;
    }

    if (chunks.length === 0) {
      throw new Error(
      );
    }

    return {
      hunk: {
        kind: "update",
        path: targetPath,
        movePath,
        chunks,
      },
      consumed,
    };
  }

  throw new Error(
  );
}

function parseUpdateFileChunk(
  allowMissingContext: boolean,
): { chunk: UpdateFileChunk; consumed: number } {
    throw new Error(
    );
  }

  let changeContext: string | undefined;
  let startIndex = 0;
    startIndex = 1;
    startIndex = 1;
  } else if (!allowMissingContext) {
    throw new Error(
    );
  }

    throw new Error(
    );
  }

  const chunk: UpdateFileChunk = {
    changeContext,
    oldLines: [],
    newLines: [],
    isEndOfFile: false,
  };

  let parsedLines = 0;
      if (parsedLines === 0) {
        throw new Error(
        );
      }
      chunk.isEndOfFile = true;
      parsedLines += 1;
      break;
    }

    if (!marker) {
      chunk.oldLines.push("");
      chunk.newLines.push("");
      parsedLines += 1;
      continue;
    }

    if (marker === " ") {
      chunk.oldLines.push(content);
      chunk.newLines.push(content);
      parsedLines += 1;
      continue;
    }
    if (marker === "+") {
      parsedLines += 1;
      continue;
    }
    if (marker === "-") {
      parsedLines += 1;
      continue;
    }

    if (parsedLines === 0) {
      throw new Error(
      );
    }
    break;
  }

  return { chunk, consumed: parsedLines + startIndex };
}
