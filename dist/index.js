// chainbreaker/src/index.ts
import { CommanderAgent } from "./agents/commanderAgent.js";
import { ToolManager } from "./tools/ToolManager.js";
import { ExecTool } from "./tools/exec.js";
console.log("Chainbreaker Agent Framework starting...");
async function main() {
    console.log("Initializing Chainbreaker components...");
    const toolManager = new ToolManager();
    const execTool = new ExecTool();
    toolManager.registerTool(execTool);
    const commanderAgent = new CommanderAgent(toolManager); // Pass toolManager to CommanderAgent
    await commanderAgent.run("Perform initial system check and list files.");
    console.log("Chainbreaker initialization complete.");
}
main().catch(console.error);
