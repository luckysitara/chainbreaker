// chainbreaker/src/agents/baseAgent.ts

import { ToolManager } from "../tools/ToolManager.js"; // Import ToolManager

export interface Agent {
  name: string;
  run(task: string): Promise<void>;
}

export abstract class BaseAgent implements Agent {
  protected toolManager: ToolManager; // Add ToolManager property

  constructor(
    public name: string,
    toolManager: ToolManager,
  ) {
    this.toolManager = toolManager;
  }
  abstract run(task: string): Promise<void>;
}
