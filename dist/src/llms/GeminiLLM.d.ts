import { ILLMProvider, LLMOptions } from "./ILLMProvider.js";
export declare class GeminiLLM implements ILLMProvider {
    readonly name = "gemini";
    private genAI;
    private model;
    constructor(apiKey: string, model?: string);
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateChatCompletion(messages: Array<{
        role: string;
        content: string;
    }>, options?: LLMOptions): Promise<string>;
}
