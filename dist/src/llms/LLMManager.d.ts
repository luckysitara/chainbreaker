import { ILLMProvider } from "./ILLMProvider.js";
export declare class LLMManager {
    private providers;
    registerProvider(provider: ILLMProvider): void;
    getProvider(name: string): ILLMProvider | undefined;
    listProviders(): string[];
}
