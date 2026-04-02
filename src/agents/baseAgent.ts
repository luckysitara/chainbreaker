// chainbreaker/src/agents/baseAgent.ts

import { ToolManager } from "../tools/ToolManager"; // Removed .js
import { CommunicationManager } from "../communication/CommunicationManager"; // Removed .js

export interface Agent {
  name: string;
  run(task: string): Promise<void>;
}

export abstract class BaseAgent implements Agent {
  protected toolManager: ToolManager;
  protected communicationManager: CommunicationManager;

  constructor(
    public name: string,
    toolManager: ToolManager,
    communicationManager: CommunicationManager,
  ) {
    this.toolManager = toolManager;
    this.communicationManager = communicationManager;
  }
  abstract run(task: string): Promise<void>;
}
