// chainbreaker/src/agents/commanderAgent.ts
import { BaseAgent } from "./baseAgent.js";
export class CommanderAgent extends BaseAgent {
    constructor(toolManager) {
        // Accept ToolManager in constructor
        super("CommanderAgent", toolManager); // Pass to super
        // No need to store execTool as a private property anymore
    }
    async run(task) {
        console.log(`${this.name} received task: "${task}"`);
        // Example: Use ExecTool to run a command via the ToolManager
        console.log(`CommanderAgent is executing: 'ls -la'`);
        const result = (await this.toolManager.executeTool("exec", {
            command: "ls -la",
        }));
        if (result.exitCode === 0) {
            console.log("Command executed successfully:");
            console.log(result.stdout);
        }
        else {
            console.error("Command failed:");
            console.error(result.stderr);
            console.error(`Error: ${result.error}`);
        }
        console.log(`${this.name} finished task.`);
    }
}
