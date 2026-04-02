import path from "node:path";
export class SkillLoaderTool {
    constructor() {
        this.name = "skill_loader";
        this.description = "Loads and applies specialized skills (prompt templates) for auditing tasks.";
        this.loadedSkills = new Map();
    }
    async execute(params) {
        const { skillName, action, context } = params; // Action could be 'load' or 'apply'
        if (action === "load") {
            return this.loadSkill(skillName);
        }
        else if (action === "apply") {
            return this.applySkill(skillName, context);
        }
        else {
            throw new Error("Invalid action for skill_loader. Must be 'load' or 'apply'.");
        }
    }
    async loadSkill(skillName) {
        if (this.loadedSkills.has(skillName)) {
            return { message: `Skill ${skillName} already loaded.` };
        }
        try {
            // Dynamically import the skill
            const skillPath = path.resolve(process.cwd(), `skills/${skillName}.js`);
            const skill = await import(skillPath);
            const skillInstance = new skill[skillName]();
            this.loadedSkills.set(skillName, skillInstance);
            return { message: `Skill ${skillName} loaded successfully.` };
        }
        catch (error) {
            throw new Error(`Failed to load skill ${skillName}: ${error.message}`);
        }
    }
    async applySkill(skillName, context) {
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
