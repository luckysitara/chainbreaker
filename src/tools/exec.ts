// chainbreaker/src/tools/exec.ts
import { exec as cp_exec } from "child_process";
import { promisify } from "util";
import { ITool } from "./ITool.js"; // Import the ITool interface

const execPromise = promisify(cp_exec);

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  error?: string;
}

export interface ExecParams {
  command: string;
  cwd?: string;
  timeout?: number; // in milliseconds
}

interface ChildProcessError extends Error {
  stdout: string;
  stderr: string;
  code: number;
}

function isChildProcessError(error: unknown): error is ChildProcessError {
  return (
    typeof error === "object" &&
    error !== null &&
    "stdout" in error &&
    typeof (error as ChildProcessError).stdout === "string" &&
    "stderr" in error &&
    typeof (error as ChildProcessError).stderr === "string" &&
    "code" in error &&
    typeof (error as ChildProcessError).code === "number"
  );
}

export class ExecTool implements ITool {
  // Implement ITool
  name: string = "exec"; // Explicitly define name
  description: string =
    "Execute shell commands with an optional working directory and timeout."; // Explicitly define description

  async execute(params: ExecParams): Promise<ExecResult> {
    const { command, cwd, timeout } = params;

    console.log(
      `Executing command: "${command}" in cwd: "${cwd || process.cwd()}"`,
    );

    try {
      const { stdout, stderr } = await execPromise(command, { cwd, timeout });
      return {
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: unknown) {
      // Use unknown
      if (isChildProcessError(error)) {
        // Use type guard
        return {
          stdout: error.stdout,
          stderr: error.stderr,
          exitCode: error.code,
          error: error.message,
        };
      }
      // Handle other types of errors
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        stdout: "",
        stderr: errorMessage,
        exitCode: 1, // Generic error code
        error: errorMessage,
      };
    }
  }
}
