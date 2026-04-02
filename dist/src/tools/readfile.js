import fs from "node:fs/promises";
export class ReadFileTool {
    constructor() {
        this.name = "read_file";
        this.description = "Reads the content of a specified file.";
    }
    async execute(params) {
        const { path: filePath } = params;
        if (!filePath) {
            throw new Error("File path is required for read_file tool.");
        }
        try {
            const content = await fs.readFile(filePath, { encoding: "utf8" });
            return { content };
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }
}
