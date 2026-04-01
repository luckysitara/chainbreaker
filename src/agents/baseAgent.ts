// chainbreaker/src/agents/baseAgent.ts

export interface Agent {
  name: string;
  run(task: string): Promise<void>;
}

export abstract class BaseAgent implements Agent {
  constructor(public name: string) {}
  abstract run(task: string): Promise<void>;
}
