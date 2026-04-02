// chainbreaker/src/tools/skillLoader.ts
import { ITool } from "./ITool"; // Removed .js
import { ISkill } from "../../skills/ISkill"; // Removed .js
import path from "node:path";

interface LoadSkillParams {
  skillName: string;
}

interface ApplySkillParams {
  skillName: string;
  context: unknown;
}

interface SkillLoaderResult {
  message: string;
  data?: string;
}

export class SkillLoaderTool implements ITool {
  public readonly name = "skill_loader";
  public readonly description = "Loads and applies specialized skills (prompt templates) for auditing tasks.";
  private loadedSkills: Map<string, ISkill> = new Map();

  async execute(params: unknown): Promise<SkillLoaderResult> {
    const { skillName, action, context } = params as any; // Action could be 'load' or 'apply'

    if (action === "load") {
      return this.loadSkill(skillName);
    } else if (action === "apply") {
      return this.applySkill(skillName, context);
    } else {
      throw new Error(
        "Invalid action for skill_loader. Must be 'load' or 'apply'.",
      );
    }
  }

  private async loadSkill(skillName: string): Promise<SkillLoaderResult> {
    if (this.loadedSkills.has(skillName)) {
      return { message: `Skill ${skillName} already loaded.` };
    }

    try {
      // Dynamically import the skill
      const skillPath = path.resolve(
        process.cwd(),
        `skills/${skillName}.js`,
      );
      const skill = await import(skillPath);
      const skillInstance: ISkill = new skill[skillName]();
      this.loadedSkills.set(skillName, skillInstance);
      return { message: `Skill ${skillName} loaded successfully.` };
    } catch (error: any) {
      throw new Error(`Failed to load skill ${skillName}: ${error.message}`);
    }
  }

  private async applySkill(
    skillName: string,
    context: unknown,
  ): Promise<SkillLoaderResult> {
    const skill = this.loadedSkills.get(skillName);
    if (!skill) {
      throw new Error(`Skill ${skillName} not loaded. Please load it first.`);
    }
    const result = await skill.apply(context);
    return {
      message: `Skill ${skillName} applied successfully.`,
      data: result,
    };
  }
}
