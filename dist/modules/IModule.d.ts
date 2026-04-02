export interface IModule {
    name: string;
    description: string;
    execute(params: unknown): Promise<any>;
}
