import { ILLMProvider, LLMOptions } from "./ILLMProvider.js";
export declare class OpenAILLM implements ILLMProvider {
    readonly name = "openai";
    private client;
    private model;
    constructor(apiKey: string, model?: string);
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateChatCompletion(messages: Array<{
        role: string;
        content: string;
    }>, options?: LLMOptions): Promise<string>;
}
