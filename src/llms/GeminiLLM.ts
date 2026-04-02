// chainbreaker/src/llms/GeminiLLM.ts
import { ILLMProvider, LLMOptions } from "./ILLMProvider"; // Removed .js
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiLLM implements ILLMProvider {
  public readonly name = "gemini";
  private genAI: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = "gemini-pro") {
    if (!apiKey) {
      throw new Error("Gemini API key is required.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async generateText(prompt: string, options?: LLMOptions): Promise<string> {
    const geminiModel = this.genAI.getGenerativeModel({ model: this.model });
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    return response.text();
  }

  async generateChatCompletion(
    messages: Array<{ role: string; content: string }>,
    options?: LLMOptions,
  ): Promise<string> {
    const geminiModel = this.genAI.getGenerativeModel({ model: this.model });
    const chat = geminiModel.startChat({
      history: messages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model", // Gemini expects 'user' or 'model'
        parts: [{ text: msg.content }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    return response.text();
  }
}
