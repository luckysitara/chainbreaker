interface AgentToolResult {
    stdout: string;
    stderr: string;
    exitCode: number | null;
    error?: string;
}
export interface ExecParams {
    command: string;
    cwd?: string;
    timeout?: number;
}
export declare class ExecTool {
    static readonly toolName = "exec";
    static readonly description = "Execute shell commands with an optional working directory and timeout.";
    execute(params: ExecParams): Promise<AgentToolResult>;
}
export {};
