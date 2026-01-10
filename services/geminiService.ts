import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;

export const getGeminiChat = (): Chat => {
  if (chatSession) return chatSession;

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables.");
    // In a real app, we'd handle this more gracefully, but for this demo structure we proceed.
  }

  const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
  
  chatSession = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });

  return chatSession;
};

export const sendMessageToCoach = async (message: string): Promise<string> => {
  try {
    const chat = getGeminiChat();
    const result = await chat.sendMessage({ message });
    return result.text || "I'm reviewing your stats... try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Focus on your rep range while I reconnect.";
  }
};