import { BaseAgent } from "./baseAgent.js";
import { ToolManager } from "../tools/ToolManager.js";
import { CommunicationManager } from "../communication/CommunicationManager.js";
import { Task } from "../communication/schemas.js";
export declare class SpecialistAgent extends BaseAgent {
    agentId: string;
    capabilities: string[];
    constructor(name: string, toolManager: ToolManager, communicationManager: CommunicationManager, capabilities: string[]);
    init(): Promise<void>;
    protected handleTask(task: Task): Promise<void>;
    run(task: string): Promise<void>;
}
