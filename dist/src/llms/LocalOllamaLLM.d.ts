import { ILLMProvider, LLMOptions } from "./ILLMProvider.js";
export declare class LocalOllamaLLM implements ILLMProvider {
    readonly name = "ollama";
    private baseUrl;
    private model;
    constructor(baseUrl?: string, model?: string);
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateChatCompletion(messages: Array<{
        role: string;
        content: string;
    }>, options?: LLMOptions): Promise<string>;
}
