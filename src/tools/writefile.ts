// chainbreaker/src/tools/writefile.ts
import { ITool } from "./ITool"; // Removed .js
import fs from "node:fs/promises";
import path from "node:path";

interface WriteFileParams {
  path: string;
  content: string;
}

interface WriteFileResult {
  message: string;
}

export class WriteFileTool implements ITool {
  public readonly name = "write_file";
  public readonly description = "Writes content to a specified file.";

  async execute(params: unknown): Promise<WriteFileResult> {
    const { path: filePath, content } = params as WriteFileParams;

    if (!filePath) {
      throw new Error("File path is required for write_file tool.");
    }
    if (content === undefined) {
      throw new Error("Content is required for write_file tool.");
    }

    try {
      await fs.writeFile(filePath, content, { encoding: "utf8" });
      return { message: `Successfully wrote to file ${filePath}` };
    } catch (error: any) {
      throw new Error(`Failed to write to file ${filePath}: ${error.message}`);
    }
  }
}
