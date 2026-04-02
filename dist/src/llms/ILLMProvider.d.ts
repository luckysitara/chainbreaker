export interface LLMOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stopSequences?: string[];
}
export interface ILLMProvider {
    name: string;
    generateText(prompt: string, options?: LLMOptions): Promise<string>;
    generateChatCompletion(messages: Array<{
        role: string;
        content: string;
    }>, options?: LLMOptions): Promise<string>;
}
