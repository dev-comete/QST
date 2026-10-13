import type { ChatConversation, MessagePage, MessagesCache } from "../types/chatType";
import apiClient from "./apiClient";

const CHAT_URL = '/chat/conversations/';

export const ChatService = {
	fetchMessages: async (conversationId: string, limit: number) => {
		const response = await apiClient.get<MessagePage>(
			`${CHAT_URL}${conversationId}/messages/`,
			{ params: { limit } }
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
		(m: Message) =>
		m.id < 0 &&
		!serverData.results.some((r) => r.client_id && r.client_id === m.client_id)
	);

		return {
			messages: [...serverData.results, ...pending],
			hasMore: serverData.has_more,
		};
	},

	getMessagesWithPending: async (
		conversationId: string,
		limit: number,
		existingCache?: MessagesCache
	) => {
		const data = await ChatService.fetchMessages(conversationId, limit);
		return ChatService.reconcilePendingMessages(data, existingCache);
	},
};