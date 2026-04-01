import { BaseAgent } from './baseAgent';
export declare class CommanderAgent extends BaseAgent {
    private execTool;
    constructor();
    run(task: string): Promise<void>;
}
