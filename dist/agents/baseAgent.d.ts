import { ToolManager } from "../tools/ToolManager.js";
export interface Agent {
    name: string;
    run(task: string): Promise<void>;
}
export declare abstract class BaseAgent implements Agent {
    name: string;
    protected toolManager: ToolManager;
    constructor(name: string, toolManager: ToolManager);
    abstract run(task: string): Promise<void>;
}
