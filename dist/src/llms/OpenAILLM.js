import OpenAI from "openai";
export class OpenAILLM {
    constructor(apiKey, model = "gpt-4o-mini") {
        this.name = "openai";
        if (!apiKey) {
            throw new Error("OpenAI API key is required.");
        }
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }
    async generateText(prompt, options) {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: [{ role: "user", content: prompt }],
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 1024,
            top_p: options?.topP ?? 1,
            stop: options?.stopSequences,
        });
        return completion.choices[0]?.message?.content || "";
    }
    async generateChatCompletion(messages, options) {
        const completion = await this.client.chat.completions.create({
            model: this.model,
            messages: messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens ?? 1024,
            top_p: options?.topP ?? 1,
            stop: options?.stopSequences,
        });
        return completion.choices[0]?.message?.content || "";
    }
}
