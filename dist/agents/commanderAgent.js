// chainbreaker/src/agents/commanderAgent.ts
import { BaseAgent } from './baseAgent.js';
import { ExecTool } from '../tools/exec.js';
export class CommanderAgent extends BaseAgent {
    constructor() {
        super('CommanderAgent');
        this.execTool = new ExecTool();
    }
    async run(task) {
        console.log(`${this.name} received task: "${task}"`);
        // Example: Use ExecTool to run a command
        console.log(`CommanderAgent is executing: 'ls -la'`);
        const result = await this.execTool.execute({ command: 'ls -la' });
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
