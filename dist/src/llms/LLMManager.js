export class LLMManager {
    constructor() {
        this.providers = new Map();
    }
    registerProvider(provider) {
        if (this.providers.has(provider.name)) {
            console.warn(`LLM Provider with name "${provider.name}" already registered. Overwriting.`);
        }
        this.providers.set(provider.name, provider);
        console.log(`LLM Provider "${provider.name}" registered.`);
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    listProviders() {
        return Array.from(this.providers.keys());
    }
}
