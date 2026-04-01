import { BaseAgent } from './baseAgent.js';
export declare class CommanderAgent extends BaseAgent {
    private execTool;
    constructor();
    run(task: string): Promise<void>;
}
