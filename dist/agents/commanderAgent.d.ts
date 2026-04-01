import { BaseAgent } from "./baseAgent.js";
import { ToolManager } from "../tools/ToolManager.js";
export declare class CommanderAgent extends BaseAgent {
    constructor(toolManager: ToolManager);
    run(task: string): Promise<void>;
}
