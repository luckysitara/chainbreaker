import { Redis } from "ioredis";
import { Task, Result, AgentAnnouncement } from "./schemas.js";
export declare class CommunicationManager {
    private pubClient;
    protected subClient: Redis;
    constructor(redisUrl?: string);
    testMethod(): void;
    publishAnnouncement(announcement: AgentAnnouncement): Promise<void>;
    subscribeToDiscovery(callback: (announcement: AgentAnnouncement) => void): Promise<void>;
    publishTask(task: Task): Promise<void>;
    subscribeToTasks(agentId: string, callback: (task: Task) => void): Promise<void>;
    subscribeToResults(taskId: string | "*" | undefined, // "*" for all results
    callback: (result: Result) => void): Promise<void>;
    disconnect(): Promise<void>;
}
