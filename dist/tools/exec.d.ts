import { ITool } from "./ITool.js";
export interface ExecResult {
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
export declare class ExecTool implements ITool {
    name: string;
    description: string;
    execute(params: ExecParams): Promise<ExecResult>;
}
