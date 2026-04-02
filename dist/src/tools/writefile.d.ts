import { ITool } from "./ITool.js";
interface WriteFileResult {
    message: string;
}
export declare class WriteFileTool implements ITool {
    readonly name = "write_file";
    readonly description = "Writes content to a specified file.";
    execute(params: unknown): Promise<WriteFileResult>;
}
export {};
