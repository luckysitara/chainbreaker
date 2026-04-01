import { ITool } from "./ITool.js";
export declare class ToolManager {
    private tools;
    registerTool(tool: ITool): void;
    getTool(name: string): ITool | undefined;
    listTools(): ITool[];
    executeTool(name: string, params: unknown): Promise<unknown>;
}
