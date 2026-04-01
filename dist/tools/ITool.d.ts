export interface ITool {
    name: string;
    description: string;
    execute(params: unknown): Promise<unknown>;
}
