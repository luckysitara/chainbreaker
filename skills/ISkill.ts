// chainbreaker/skills/ISkill.ts
export interface ISkill {
  name: string;
  description: string;
  apply(context: unknown): Promise<string>; // context could be code, vulnerability details etc.
}
