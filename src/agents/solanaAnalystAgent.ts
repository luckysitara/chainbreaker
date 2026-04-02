// chainbreaker/src/agents/solanaAnalystAgent.ts
import { SpecialistAgent } from "./specialistAgent"; // Removed .js
import { ToolManager } from "../tools/ToolManager"; // Removed .js
import { CommunicationManager } from "../communication/CommunicationManager"; // Removed .js
import { Task } from "../communication/schemas"; // Removed .js

export class SolanaAnalystAgent extends SpecialistAgent {
  constructor(
    toolManager: ToolManager,
    communicationManager: CommunicationManager,
  ) {
    super(
      "SolanaAnalystAgent",
      toolManager,
      communicationManager,
      ["analyze_solana_code", "read_file", "exec", "rag_query", "soteria_audit"], // Specific Solana capabilities
    );
  }

  protected async handleTask(task: Task): Promise<void> {
    console.log(`${this.name} processing Solana task ${task.id}: ${task.type}`);

    try {
      let resultData: any;
      switch (task.type) {
        case "analyze_solana_code": {
          const filePath = task.payload.path;
          // Simulate reading a Solana contract file
          const { content: fileContent } = (await this.toolManager.executeTool(
            "read_file",
            { path: filePath },
          )) as { content: string };

          // Run Soteria audit (simulated)
          const { report: soteriaReport, exitCode: soteriaExitCode } = (await this.toolManager.executeTool(
            "soteria_audit",
            { filePath: filePath },
          )) as any;

          // Perform a RAG query
          const { summary: ragSummary, retrievedDocuments } = (await this.toolManager.executeTool(
            "rag_query",
            { query: "Solana security vulnerabilities", context: fileContent.substring(0, 200) },
          )) as any;

          resultData = {
            analysis: `Solana code analysis of ${filePath} completed.`,
            soteriaReport: soteriaReport,
            soteriaExitCode: soteriaExitCode,
            ragSummary: ragSummary,
            ragDocuments: retrievedDocuments,
            filePreview: fileContent.substring(0, 100) + "...",
          };
          break;
        }
        default:
          await super.handleTask(task);
          return;
      }

      await this.communicationManager.publishResult({
        taskId: task.id,
        status: "success",
        data: resultData,
      });
    } catch (err: any) {
      await this.communicationManager.publishResult({
        taskId: task.id,
        status: "error",
        data: null,
        error: err.message || "Unknown error",
      });
    }
  }
}
