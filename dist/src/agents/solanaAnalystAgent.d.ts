import { SpecialistAgent } from "./specialistAgent.js";
import { ToolManager } from "../tools/ToolManager.js";
import { CommunicationManager } from "../communication/CommunicationManager.js";
import { Task } from "../communication/schemas.js";
export declare class SolanaAnalystAgent extends SpecialistAgent {
    constructor(toolManager: ToolManager, communicationManager: CommunicationManager);
    protected handleTask(task: Task): Promise<void>;
}
