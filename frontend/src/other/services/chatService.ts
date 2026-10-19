import type { ChatConversation, ChatMessage, MessagePage, MessagesCache } from "../types/chatType";
import apiClient from "./apiClient";

const CHAT_URL = '/chat/conversations/';

export interface MarkReadParams {
    conversationId: number | null;
    newestServerId: number | string;
}

export const ChatService = {
	fetchMessages: async (conversationId: number | null, limit: number, beforeId?: number) => {
		const response = await apiClient.get<MessagePage>(
			`${CHAT_URL}${conversationId}/messages/`,
			{ params: { limit, before_id: beforeId } }
		);
		return response.data;
	},

	fetchConversation : async () => {
		const { data } = await apiClient.get<ChatConversation[]>(CHAT_URL);
		return data;
	},

	reconcilePendingMessages: (
		serverData: MessagePage,
		existingCache?: MessagesCache
	): MessagesCache => {
		const pending = (existingCache?.messages ?? []).filter(
		(m: ChatMessage) =>
		m.id < 0 &&
		!serverData.results.some((r) => r.client_id && r.client_id === m.client_id)
	);

		return {
			messages: [...serverData.results, ...pending],
			hasMore: serverData.has_more,
		};
	},

	getMessagesWithPending: async (
		conversationId: number,
		limit: number,
		existingCache?: MessagesCache
	) => {
		const data = await ChatService.fetchMessages(conversationId, limit);
		return ChatService.reconcilePendingMessages(data, existingCache);
	},

	sendLastServerId: async ({ conversationId, newestServerId }: MarkReadParams) => {
		const resp = apiClient.post(`${CHAT_URL}${conversationId}/read/`, {last_id: newestServerId })
		return resp
	}
};