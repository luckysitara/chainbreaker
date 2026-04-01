// chainbreaker/src/tools/exec.ts
import { exec as cp_exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(cp_exec);

interface AgentToolResult {
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

export class ExecTool {
  static readonly toolName = "exec";
  static readonly description = "Execute shell commands with an optional working directory and timeout.";

  async execute(params: ExecParams): Promise<AgentToolResult> {
    const { command, cwd, timeout } = params;

    console.log(`Executing command: "${command}" in cwd: "${cwd || process.cwd()}"`);

    try {
      const { stdout, stderr } = await execPromise(command, { cwd, timeout });
      return {
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: any) {
      // child_process.exec can throw an error with stdout/stderr/code properties
      if (error.stdout !== undefined && error.stderr !== undefined && error.code !== undefined) {
        return {
          stdout: error.stdout,
          stderr: error.stderr,
          exitCode: error.code,
          error: error.message,
        };
      }
      return {
        stdout: '',
        stderr: error.message || 'Unknown error',
        exitCode: 1, // Generic error code
        error: error.message,
      };
    }
  }
}
