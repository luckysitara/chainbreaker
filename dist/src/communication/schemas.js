// chainbreaker/src/communication/schemas.ts
import { z } from "zod";
export const AgentAnnouncementSchema = z.object({
    agentId: z.string(),
    name: z.string(),
    capabilities: z.array(z.string()),
});
export const TaskSchema = z.object({
    id: z.string(),
    type: z.string(),
    payload: z.any(),
    assignedTo: z.string().optional(),
});
export const ResultSchema = z.object({
    taskId: z.string(),
    status: z.enum(["success", "error"]),
    data: z.any(),
    error: z.string().optional(),
});
