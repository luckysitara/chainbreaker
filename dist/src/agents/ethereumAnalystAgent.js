// chainbreaker/src/agents/ethereumAnalystAgent.ts
import { SpecialistAgent } from "./specialistAgent.js";
export class EthereumAnalystAgent extends SpecialistAgent {
    constructor(toolManager, communicationManager) {
        super("EthereumAnalystAgent", toolManager, communicationManager, ["analyze_ethereum_code", "read_file", "exec", "rag_query", "slither_audit"]);
    }
    async handleTask(task) {
        console.log(`${this.name} processing Ethereum task ${task.id}: ${task.type}`);
        try {
            let resultData;
            switch (task.type) {
                case "analyze_ethereum_code": {
                    const filePath = task.payload.path;
                    // Simulate reading an Ethereum contract file
                    const { content: fileContent } = (await this.toolManager.executeTool("read_file", { path: filePath }));
                    // Run Slither audit (simulated)
                    const { report: slitherReport, exitCode: slitherExitCode } = (await this.toolManager.executeTool("slither_audit", { filePath: filePath }));
                    // Perform a RAG query
                    const { summary: ragSummary, retrievedDocuments } = (await this.toolManager.executeTool("rag_query", { query: "Ethereum security vulnerabilities", context: fileContent.substring(0, 200) }));
                    resultData = {
                        analysis: `Ethereum code analysis of ${filePath} completed.`,
                        slitherReport: slitherReport,
                        slitherExitCode: slitherExitCode,
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
