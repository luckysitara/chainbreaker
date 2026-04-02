// chainbreaker/src/llms/OpenAILLM.ts
import { ILLMProvider, LLMOptions } from "./ILLMProvider"; // Removed .js
import OpenAI from "openai";

export class OpenAILLM implements ILLMProvider {
  public readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = "gpt-4o-mini") {
    if (!apiKey) {
      throw new Error("OpenAI API key is required.");
    }
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
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

  async generateChatCompletion(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
  ): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 1024,
      top_p: options?.topP ?? 1,
      stop: options?.stopSequences,
    });
    return completion.choices[0]?.message?.content || "";
  }
}
