import { ITool } from "./ITool.js";
interface ModuleLoaderResult {
    message: string;
    data?: any;
}
export declare class ModuleLoaderTool implements ITool {
    readonly name = "module_loader";
    readonly description = "Loads and executes Metasploit-like modules.";
    private loadedModules;
    execute(params: unknown): Promise<ModuleLoaderResult>;
    private loadModule;
    private executeModule;
}
export {};
