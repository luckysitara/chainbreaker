// chainbreaker/src/tools/moduleLoader.ts
import { ITool } from "./ITool"; // Removed .js
import { IModule } from "../../modules/IModule"; // Removed .js
import path from "node:path";

interface LoadModuleParams {
  moduleName: string;
}

interface ExecuteModuleParams {
  moduleName: string;
  params: unknown;
}

interface ModuleLoaderResult {
  message: string;
  data?: any;
}

export class ModuleLoaderTool implements ITool {
  public readonly name = "module_loader";
  public readonly description = "Loads and executes Metasploit-like modules.";
  private loadedModules: Map<string, IModule> = new Map();

  async execute(params: unknown): Promise<ModuleLoaderResult> {
    const { moduleName, action, moduleParams } = params as any; // Action could be 'load' or 'execute'

    if (action === "load") {
      return this.loadModule(moduleName);
    } else if (action === "execute") {
      return this.executeModule(moduleName, moduleParams);
    } else {
      throw new Error(
        "Invalid action for module_loader. Must be 'load' or 'execute'.",
      );
    }
  }

  private async loadModule(moduleName: string): Promise<ModuleLoaderResult> {
    if (this.loadedModules.has(moduleName)) {
      return { message: `Module ${moduleName} already loaded.` };
    }

    try {
      // Dynamically import the module
      const modulePath = path.resolve(
        process.cwd(),
        `modules/${moduleName}.js`,
      );
      const module = await import(modulePath);
      const moduleInstance: IModule = new module[moduleName]();
      this.loadedModules.set(moduleName, moduleInstance);
      return { message: `Module ${moduleName} loaded successfully.` };
    } catch (error: any) {
      throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
    }
  }

  private async executeModule(
    moduleName: string,
    params: unknown,
  ): Promise<ModuleLoaderResult> {
    const module = this.loadedModules.get(moduleName);
    if (!module) {
      throw new Error(`Module ${moduleName} not loaded. Please load it first.`);
    }
    const result = await module.execute(params);
    return {
      message: `Module ${moduleName} executed successfully.`,
      data: result,
    };
  }
}
