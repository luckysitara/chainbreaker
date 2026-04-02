export interface ISkill {
    name: string;
    description: string;
    apply(context: unknown): Promise<string>;
}
