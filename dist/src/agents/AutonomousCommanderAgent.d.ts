import { BaseAgent } from "./baseAgent.js";
import { ToolManager } from "../tools/ToolManager.js";
import { CommunicationManager } from "../communication/CommunicationManager.js";
import { LLMManager } from "../llms/LLMManager.js";
export declare class AutonomousCommanderAgent extends BaseAgent {
    private llmManager;
    private llmProvider;
    private activeAgents;
    private conversationHistory;
    private currentGoal;
    constructor(toolManager: ToolManager, communicationManager: CommunicationManager, llmManager: LLMManager, llmProviderName?: string);
    init(): Promise<void>;
    private handleAgentResult;
    private decideNextAction;
    run(goal: string): Promise<void>;
    private generateSummaryReport;
}
