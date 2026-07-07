export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

export interface ChatRequestBody {
  messages: { role: ChatRole; content: string }[];
  model?: string;
}

export interface ChatResponseBody {
  reply: string;
  model: string;
}
