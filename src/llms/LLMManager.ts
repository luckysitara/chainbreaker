// chainbreaker/src/llms/LLMManager.ts
import { ILLMProvider } from "./ILLMProvider.js";

export class LLMManager {
  private providers: Map<string, ILLMProvider> = new Map();

  registerProvider(provider: ILLMProvider): void {
    if (this.providers.has(provider.name)) {
      console.warn(`LLM Provider with name "${provider.name}" already registered. Overwriting.`);
    }
    this.providers.set(provider.name, provider);
    console.log(`LLM Provider "${provider.name}" registered.`);
  }

  getProvider(name: string): ILLMProvider | undefined {
    return this.providers.get(name);
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
