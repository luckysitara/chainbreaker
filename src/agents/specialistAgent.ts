// chainbreaker/src/agents/specialistAgent.ts
import { BaseAgent } from "./baseAgent"; // Removed .js
import { ToolManager } from "../tools/ToolManager"; // Removed .js
import { CommunicationManager } from "../communication/CommunicationManager"; // Removed .js
import { Task } from "../communication/schemas"; // Removed .js

export class SpecialistAgent extends BaseAgent {
  public agentId: string;
  public capabilities: string[];

  constructor(
    name: string,
    toolManager: ToolManager,
    communicationManager: CommunicationManager,
    capabilities: string[],
  ) {
    super(name, toolManager, communicationManager);
    this.agentId = `${name}_${Math.random().toString(36).substring(2, 9)}`;
    this.capabilities = capabilities;
  }

  async init(): Promise<void> {
    console.log(`${this.name} initializing...`);
    await this.communicationManager.subscribeToTasks(this.agentId, (task) => {
      this.handleTask(task).catch((err) =>
        console.error(`${this.name} task error:`, err),
      );
    });

    await this.communicationManager.publishAnnouncement({
      agentId: this.agentId,
      name: this.name,
      capabilities: this.capabilities,
    });
    console.log(`${this.name} (ID: ${this.agentId}) announced presence.`);
  }

  protected async handleTask(task: Task): Promise<void> {
    // Call the test method
    this.communicationManager.testMethod(); 
    
    console.log(`${this.name} processing task ${task.id}: ${task.type}`);

    try {
      let resultData: any;
      switch (task.type) {
        case "analyze_code": {
          // Simulate code analysis
          resultData = { analysis: `Analyzed code at ${task.payload.path}. Found no major issues.` };
          break;
        }
        case "read_file": {
          const { content } = (await this.toolManager.executeTool(
            "read_file",
            task.payload,
          )) as { content: string };
          resultData = { fileContent: content };
          break;
        }
        case "write_file": {
          const { message } = (await this.toolManager.executeTool(
            "write_file",
            task.payload,
          )) as { message: string };
          resultData = { writeStatus: message };
          break;
        }
        case "load_module": {
          const { message, data } = (await this.toolManager.executeTool(
            "module_loader",
            { action: "load", moduleName: task.payload.moduleName },
          )) as { message: string; data?: any };
          resultData = { moduleLoadStatus: message, moduleData: data };
          break;
        }
        case "execute_module": {
          const { message, data } = (await this.toolManager.executeTool(
            "module_loader",
            {
              action: "execute",
              moduleName: task.payload.moduleName,
              moduleParams: task.payload.params,
            },
          )) as { message: string; data?: any };
          resultData = { moduleExecutionStatus: message, moduleResult: data };
          break;
        }
        case "load_skill": {
          const { message, data } = (await this.toolManager.executeTool(
            "skill_loader",
            { action: "load", skillName: task.payload.skillName },
          )) as { message: string; data?: any };
          resultData = { skillLoadStatus: message, skillData: data };
          break;
        }
        case "apply_skill": {
          const { message, data } = (await this.toolManager.executeTool(
            "skill_loader",
            {
              action: "apply",
              skillName: task.payload.skillName,
              context: task.payload.context,
            },
          )) as { message: string; data?: any };
          resultData = { skillApplicationStatus: message, skillOutput: data };
          break;
        }
        default:
          resultData = { result: `Task type "${task.type}" not specifically handled.` };
          break;
      }

      await this.communicationManager.publishResult({
        taskId: task.id,
        status: "success",
        data: resultData,
      });
    } catch (err: any) {
      await this.communicationManager.publishResult({
        taskId: task.id,
        status: "error",
        data: null,
        error: err.message || "Unknown error",
      });
    }
  }

  async run(task: string): Promise<void> {
    console.log(`${this.name} "run" called with task: "${task}". Waiting for tasks via Redis...`);
  }
}
