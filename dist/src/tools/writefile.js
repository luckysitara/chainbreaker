import fs from "node:fs/promises";
export class WriteFileTool {
    constructor() {
        this.name = "write_file";
        this.description = "Writes content to a specified file.";
    }
    async execute(params) {
        const { path: filePath, content } = params;
        if (!filePath) {
            throw new Error("File path is required for write_file tool.");
        }
        if (content === undefined) {
            throw new Error("Content is required for write_file tool.");
        }
        try {
            await fs.writeFile(filePath, content, { encoding: "utf8" });
            return { message: `Successfully wrote to file ${filePath}` };
        }
        catch (error) {
            throw new Error(`Failed to write to file ${filePath}: ${error.message}`);
        }
    }
}
