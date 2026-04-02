// chainbreaker/src/index.ts
// import { CommanderAgent } from "./agents/commanderAgent.js"; // Removed as it's replaced by AutonomousCommanderAgent
import { AutonomousCommanderAgent } from "./agents/AutonomousCommanderAgent"; // Removed .js
import { SpecialistAgent } from "./agents/specialistAgent"; // Removed .js
import { SolanaAnalystAgent } from "./agents/solanaAnalystAgent"; // Removed .js
import { EthereumAnalystAgent } from "./agents/ethereumAnalystAgent"; // Removed .js
import { ToolManager } from "./tools/ToolManager"; // Removed .js
import { ExecTool } from "./tools/exec"; // Removed .js
import { ReadFileTool } from "./tools/readfile"; // Removed .js
import { WriteFileTool } from "./tools/writefile"; // Removed .js
import { ModuleLoaderTool } from "./tools/moduleLoader"; // Removed .js
import { RagTool } from "./tools/ragTool"; // Removed .js
import { SkillLoaderTool } from "./tools/skillLoader"; // Removed .js
import { SoteriaTool } from "./tools/soteriaTool"; // Removed .js
import { SlitherTool } from "./tools/slitherTool"; // Removed .js
import { CommunicationManager } from "./communication/CommunicationManager"; // Removed .js
import { LLMManager } from "./llms/LLMManager"; // Removed .js
import { OpenAILLM } from "./llms/OpenAILLM"; // Removed .js
import { GeminiLLM } from "./llms/GeminiLLM"; // Removed .js
import { LocalOllamaLLM } from "./llms/LocalOllamaLLM"; // Removed .js
import fs from "node:fs/promises";
import path from "node:path";

console.log("Chainbreaker Agent Framework starting...");

async function main() {
  console.log("Initializing Chainbreaker components...");

  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), "output");
  await fs.mkdir(outputDir, { recursive: true });
  console.log(`Ensured output directory exists at: ${outputDir}`);

  const toolManager = new ToolManager();
  const execTool = new ExecTool();
  const readFileTool = new ReadFileTool();
  const writeFileTool = new WriteFileTool();
  const moduleLoaderTool = new ModuleLoaderTool();
  const ragTool = new RagTool();
  const skillLoaderTool = new SkillLoaderTool();
  const soteriaTool = new SoteriaTool();
  const slitherTool = new SlitherTool();

  toolManager.registerTool(execTool);
  toolManager.registerTool(readFileTool);
  toolManager.registerTool(writeFileTool);
  toolManager.registerTool(moduleLoaderTool);
  toolManager.registerTool(ragTool);
  toolManager.registerTool(skillLoaderTool);
  toolManager.registerTool(soteriaTool);
  toolManager.registerTool(slitherTool);

  const commsManager = new CommunicationManager();
  const llmManager = new LLMManager(); // Initialize LLMManager

  // Register LLM Providers
  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (openaiApiKey) {
    llmManager.registerProvider(new OpenAILLM(openaiApiKey));
  } else {
    console.warn("OPENAI_API_KEY not found. OpenAI LLM not registered.");
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    llmManager.registerProvider(new GeminiLLM(geminiApiKey));
  } else {
    console.warn("GEMINI_API_KEY not found. Gemini LLM not registered.");
  }

  llmManager.registerProvider(new LocalOllamaLLM()); // Ollama doesn't strictly need API key for local setup

  // Create and initialize Autonomous Commander
  const autonomousCommander = new AutonomousCommanderAgent(
    toolManager,
    commsManager,
    llmManager,
    process.env.DEFAULT_LLM_PROVIDER || "gemini", // Use env var to select default LLM
  );
  await autonomousCommander.init();

  // Create and initialize a Generic Specialist
  const codeAnalyst = new SpecialistAgent(
    "CodeAnalyst",
    toolManager,
    commsManager,
    ["analyze_code", "read_file", "write_file", "module_loader", "skill_loader"],
  );
  await codeAnalyst.init();

  // Create and initialize Solana Analyst
  const solanaAnalyst = new SolanaAnalystAgent(toolManager, commsManager);
  solanaAnalyst.capabilities.push("rag_query", "skill_loader", "soteria_audit");
  await solanaAnalyst.init();

  // Create and initialize Ethereum Analyst
  const ethereumAnalyst = new EthereumAnalystAgent(toolManager, commsManager);
  ethereumAnalyst.capabilities.push("rag_query", "skill_loader", "slither_audit");
  await ethereumAnalyst.init();

  // Give a small delay for discovery to happen before running commander
  setTimeout(async () => {
    // Run the autonomous commander with an initial user goal
    const userGoal =
      "Perform a security audit of the project, including a simulated Solana contract analysis, Ethereum contract analysis, and look for reentrancy vulnerabilities.";
    await autonomousCommander.run(userGoal);
  }, 1000);

  // Keep the process alive for agents to continue receiving messages
  // process.stdin.resume(); // Removed as autonomous agent finishes its run
  console.log("Chainbreaker initialization complete. Agents are active.");
}

main().catch(console.error);
