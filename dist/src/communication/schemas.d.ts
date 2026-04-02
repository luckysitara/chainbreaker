import { z } from "zod";
export declare const AgentAnnouncementSchema: z.ZodObject<{
    agentId: z.ZodString;
    name: z.ZodString;
    capabilities: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    agentId: string;
    name: string;
    capabilities: string[];
}, {
    agentId: string;
    name: string;
    capabilities: string[];
}>;
export type AgentAnnouncement = z.infer<typeof AgentAnnouncementSchema>;
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    payload: z.ZodAny;
    assignedTo: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    id: string;
    payload?: any;
    assignedTo?: string | undefined;
}, {
    type: string;
    id: string;
    payload?: any;
    assignedTo?: string | undefined;
}>;
export type Task = z.infer<typeof TaskSchema>;
export declare const ResultSchema: z.ZodObject<{
    taskId: z.ZodString;
    status: z.ZodEnum<["success", "error"]>;
    data: z.ZodAny;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "success" | "error";
    taskId: string;
    error?: string | undefined;
    data?: any;
}, {
    status: "success" | "error";
    taskId: string;
    error?: string | undefined;
    data?: any;
}>;
export type Result = z.infer<typeof ResultSchema>;
