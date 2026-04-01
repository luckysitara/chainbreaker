// chainbreaker/src/index.ts
import { CommanderAgent } from './agents/commanderAgent';
console.log("Chainbreaker Agent Framework starting...");
async function main() {
    console.log("Initializing Chainbreaker components...");
    const commanderAgent = new CommanderAgent();
    await commanderAgent.run("Perform initial system check and list files.");
    console.log("Chainbreaker initialization complete.");
}
main().catch(console.error);
