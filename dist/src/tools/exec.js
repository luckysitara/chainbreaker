// chainbreaker/src/tools/exec.ts
import { exec as cp_exec } from "child_process";
import { promisify } from "util";
const execPromise = promisify(cp_exec);
function isChildProcessError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "stdout" in error &&
        typeof error.stdout === "string" &&
        "stderr" in error &&
        typeof error.stderr === "string" &&
        "code" in error &&
        typeof error.code === "number");
}
export class ExecTool {
    constructor() {
        // Implement ITool
        this.name = "exec"; // Explicitly define name
        this.description = "Execute shell commands with an optional working directory and timeout."; // Explicitly define description
    }
    async execute(params) {
        const { command, cwd, timeout } = params;
        console.log(`Executing command: "${command}" in cwd: "${cwd || process.cwd()}"`);
        try {
            const { stdout, stderr } = await execPromise(command, { cwd, timeout });
            return {
                stdout,
                stderr,
                exitCode: 0,
            };
        }
        catch (error) {
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
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                stdout: "",
                stderr: errorMessage,
                exitCode: 1, // Generic error code
                error: errorMessage,
            };
        }
    }
}
