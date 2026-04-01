export interface Agent {
    name: string;
    run(task: string): Promise<void>;
}
export declare abstract class BaseAgent implements Agent {
    name: string;
    constructor(name: string);
    abstract run(task: string): Promise<void>;
}
