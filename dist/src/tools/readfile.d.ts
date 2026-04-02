import { ITool } from "./ITool.js";
interface ReadFileResult {
    content: string;
}
export declare class ReadFileTool implements ITool {
    readonly name = "read_file";
    readonly description = "Reads the content of a specified file.";
    execute(params: unknown): Promise<ReadFileResult>;
}
export {};
