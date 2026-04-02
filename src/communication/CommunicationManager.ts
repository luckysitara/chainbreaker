// chainbreaker/src/communication/CommunicationManager.ts
import { Redis } from "ioredis";
import {
  Task,
  TaskSchema,
  Result,
  ResultSchema,
  AgentAnnouncement,
  AgentAnnouncementSchema,
} from "./schemas"; // Removed .js

export class CommunicationManager {
  private pubClient: Redis;
  protected subClient: Redis; // Changed to protected

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || "redis://localhost:6379";
    this.pubClient = new Redis(url);
    this.subClient = new Redis(url);
  }

  // Temporary test method
  testMethod(): void {
    console.log("CommunicationManager test method called!");
  }

  async publishAnnouncement(announcement: AgentAnnouncement): Promise<void> {
    AgentAnnouncementSchema.parse(announcement);
    await this.pubClient.publish(
      "agents:discovery",
      JSON.stringify(announcement),
    );
  }

  async subscribeToDiscovery(
    callback: (announcement: AgentAnnouncement) => void,
  ): Promise<void> {
    await this.subClient.subscribe("agents:discovery");
    this.subClient.on("message", (channel: string, message: string) => {
      if (channel === "agents:discovery") {
        try {
          const announcement = JSON.parse(message);
          callback(AgentAnnouncementSchema.parse(announcement));
        } catch (err) {
          console.error("Failed to parse agent announcement:", err);
        }
      }
    });
  }

  async publishTask(task: Task): Promise<void> {
    TaskSchema.parse(task);
    const channel = task.assignedTo
      ? `agents:tasks:${task.assignedTo}`
      : "agents:tasks:broadcast";
    await this.pubClient.publish(channel, JSON.stringify(task));
  }

  async subscribeToTasks(
    agentId: string,
    callback: (task: Task) => void,
  ): Promise<void> {
    const channels = [`agents:tasks:${agentId}`, "agents:tasks:broadcast"];
    await this.subClient.subscribe(...channels);
    this.subClient.on("message", (channel: string, message: string) => {
      if (channels.includes(channel)) {
        try {
          const task = JSON.parse(message);
          callback(TaskSchema.parse(task));
        } catch (err) {
          console.error("Failed to parse task:", err);
        }
      }
    });
  }

  // Modified to allow subscription to all results or specific task ID
  async subscribeToResults(
    taskId: string | "*" | undefined, // "*" for all results
    callback: (result: Result) => void,
  ): Promise<void> {
    const channel = taskId === "*" ? "agents:results:*" : `agents:results:${taskId}`;
    await this.subClient.psubscribe("agents:results:*"); // Use psubscribe for wildcard
    this.subClient.on("pmessage", (pattern: string, channelName: string, message: string) => {
      if (taskId === "*" || channelName === `agents:results:${taskId}`) {
        try {
          const result = JSON.parse(message);
          callback(ResultSchema.parse(result));
        } catch (err) {
          console.error("Failed to parse result:", err);
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}
