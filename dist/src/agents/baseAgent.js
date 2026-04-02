// chainbreaker/src/agents/baseAgent.ts
export class BaseAgent {
    constructor(name, toolManager, communicationManager) {
        this.name = name;
        this.toolManager = toolManager;
        this.communicationManager = communicationManager;
    }
}
