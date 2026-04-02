// chainbreaker/src/tools/ToolManager.ts
import { ITool } from "./ITool"; // Removed .js

export class ToolManager {
  private tools: Map<string, ITool> = new Map();

  registerTool(tool: ITool): void {
    if (this.tools.has(tool.name)) {
      console.warn(
        `Tool with name "${tool.name}" already registered. Overwriting.`,
      );
    }
    this.tools.set(tool.name, tool);
    console.log(`Tool "${tool.name}" registered.`);
  }

  getTool(name: string): ITool | undefined {
    return this.tools.get(name);
  }

  listTools(): ITool[] {
    return Array.from(this.tools.values());
  }

  async executeTool(name: string, params: unknown): Promise<unknown> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool "${name}" not found.`);
    }
    return tool.execute(params);
  }
}
