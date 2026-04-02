// chainbreaker/src/agents/solanaAnalystAgent.ts
import { SpecialistAgent } from "./specialistAgent.js";
export class SolanaAnalystAgent extends SpecialistAgent {
    constructor(toolManager, communicationManager) {
        super("SolanaAnalystAgent", toolManager, communicationManager, ["analyze_solana_code", "read_file", "exec", "rag_query", "soteria_audit"]);
    }
    async handleTask(task) {
        console.log(`${this.name} processing Solana task ${task.id}: ${task.type}`);
        try {
            let resultData;
            switch (task.type) {
                case "analyze_solana_code": {
                    const filePath = task.payload.path;
                    // Simulate reading a Solana contract file
                    const { content: fileContent } = (await this.toolManager.executeTool("read_file", { path: filePath }));
                    // Run Soteria audit (simulated)
                    const { report: soteriaReport, exitCode: soteriaExitCode } = (await this.toolManager.executeTool("soteria_audit", { filePath: filePath }));
                    // Perform a RAG query
                    const { summary: ragSummary, retrievedDocuments } = (await this.toolManager.executeTool("rag_query", { query: "Solana security vulnerabilities", context: fileContent.substring(0, 200) }));
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
        }
        catch (err) {
            await this.communicationManager.publishResult({
                taskId: task.id,
                status: "error",
                data: null,
                error: err.message || "Unknown error",
            });
        }
    }
}
