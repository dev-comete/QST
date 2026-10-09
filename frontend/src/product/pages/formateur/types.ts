export interface ChatParticipant {
  id: number;
  username: string;
  email: string;
}

export interface ChatMessage {
  id: number; // negative = optimistic message not yet confirmed by the server
  conversation: number;
  sender: ChatParticipant;
  content: string;
  created_at: string;
  client_id?: string | null;
  status?: "sending" | "failed"; // undefined = confirmed by the server
}

export interface ChatConversation {
  id: number;
  type: "general" | "direct";
  title: string | null;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
  last_message: ChatMessage | null;
  unread_count: number;
}

export interface MessagePage {
  results: ChatMessage[];
  has_more: boolean;
}

export interface MessagesCache {
  messages: ChatMessage[];
  hasMore: boolean;
}

export type ServerEvent =
  | { type: "ready"; conversation_id: number }
  | { type: "message"; message: ChatMessage; client_id?: string | null }
  | { type: "error"; code: string; detail?: string; client_id?: string | null }
  | { type: "pong" };
