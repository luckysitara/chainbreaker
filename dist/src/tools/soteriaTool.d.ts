import { ITool } from "./ITool.js";
interface SoteriaResult {
    report: string;
    exitCode: number;
    error?: string;
}
export declare class SoteriaTool implements ITool {
    readonly name = "soteria_audit";
    readonly description = "Simulates running Soteria static analysis on a Solana contract.";
    execute(params: unknown): Promise<SoteriaResult>;
}
export {};
