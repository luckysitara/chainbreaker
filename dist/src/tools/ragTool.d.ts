import { ITool } from "./ITool.js";
interface RagQueryResult {
    retrievedDocuments: Array<{
        id: string;
        content: string;
        score: number;
        source: string;
    }>;
    summary: string;
}
export declare class RagTool implements ITool {
    readonly name = "rag_query";
    readonly description = "Queries a simulated RAG system for vulnerability patterns and context.";
    execute(params: unknown): Promise<RagQueryResult>;
}
export {};
