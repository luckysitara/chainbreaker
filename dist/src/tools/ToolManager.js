export class ToolManager {
    constructor() {
        this.tools = new Map();
    }
    registerTool(tool) {
        if (this.tools.has(tool.name)) {
            console.warn(`Tool with name "${tool.name}" already registered. Overwriting.`);
        }
        this.tools.set(tool.name, tool);
        console.log(`Tool "${tool.name}" registered.`);
    }
    getTool(name) {
        return this.tools.get(name);
    }
    listTools() {
        return Array.from(this.tools.values());
    }
    async executeTool(name, params) {
        const tool = this.getTool(name);
        if (!tool) {
            throw new Error(`Tool "${name}" not found.`);
        }
        return tool.execute(params);
    }
}
