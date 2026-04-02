import { ITool } from "./ITool.js";
interface SlitherResult {
    report: string;
    exitCode: number;
    error?: string;
}
export declare class SlitherTool implements ITool {
    readonly name = "slither_audit";
    readonly description = "Simulates running Slither static analysis on an Ethereum contract.";
    execute(params: unknown): Promise<SlitherResult>;
}
export {};
