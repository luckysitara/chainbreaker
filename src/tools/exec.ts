// chainbreaker/src/tools/exec.ts
import { ITool } from "./ITool"; // Removed .js
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

interface ExecParams {
  command: string;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

export class ExecTool implements ITool {
  public readonly name = "exec";
  public readonly description = "Executes a shell command.";

  async execute(params: unknown): Promise<ExecResult> {
    const { command } = params as ExecParams;

    if (!command) {
      throw new Error("Command is required for exec tool.");
    }

    try {
      const { stdout, stderr } = await execAsync(command);
      return { stdout, stderr, exitCode: 0 };
    } catch (error: any) {
      return {
        stdout: error.stdout || "",
        stderr: error.stderr || "",
        exitCode: error.code || 1,
        error: error.message,
      };
    }
  }
}
