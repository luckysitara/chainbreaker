import { ToolManager } from "../tools/ToolManager.js";
import { CommunicationManager } from "../communication/CommunicationManager.js";
export interface Agent {
    name: string;
    run(task: string): Promise<void>;
}
export declare abstract class BaseAgent implements Agent {
    name: string;
    protected toolManager: ToolManager;
    protected communicationManager: CommunicationManager;
    constructor(name: string, toolManager: ToolManager, communicationManager: CommunicationManager);
    abstract run(task: string): Promise<void>;
}
