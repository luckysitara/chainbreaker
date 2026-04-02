import { ITool } from "./ITool.js";
interface SkillLoaderResult {
    message: string;
    data?: string;
}
export declare class SkillLoaderTool implements ITool {
    readonly name = "skill_loader";
    readonly description = "Loads and applies specialized skills (prompt templates) for auditing tasks.";
    private loadedSkills;
    execute(params: unknown): Promise<SkillLoaderResult>;
    private loadSkill;
    private applySkill;
}
export {};
