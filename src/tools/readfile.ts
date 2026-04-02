// chainbreaker/src/tools/readfile.ts
import { ITool } from "./ITool"; // Removed .js
import fs from "node:fs/promises";
import path from "node:path";

interface ReadFileParams {
  path: string;
}

interface ReadFileResult {
  content: string;
}

export class ReadFileTool implements ITool {
  public readonly name = "read_file";
  public readonly description = "Reads the content of a specified file.";

  async execute(params: unknown): Promise<ReadFileResult> {
    const { path: filePath } = params as ReadFileParams;

    if (!filePath) {
      throw new Error("File path is required for read_file tool.");
    }

    try {
      const content = await fs.readFile(filePath, { encoding: "utf8" });
      return { content };
    } catch (error: any) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }
}
