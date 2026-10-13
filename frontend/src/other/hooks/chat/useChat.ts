import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../services/apiClient";
import { ChatService } from "../../services/chatService";
import { useUser } from "../user/useUser";
import { TokenStorage } from "../../services/auth/storage";
import type { ChatConversation, ChatMessage, MessagePage, MessagesCache, ServerEvent } from "../../types/chatType";
import { useChatSocket } from "./useChatSocket";
import { lastServerId, sortMessages, upsertMessage } from "../../helper/chatHelper";

const CONVERSATIONS_KEY = ["chat-conversations"] as const;

export const useChat = () => {
	const token = TokenStorage.getAccessToken();

	const { getUserQuery: formateursQuery } = useUser({ role: "formateur" });

	const conversationsQuery = useQuery({
		queryKey: CONVERSATIONS_KEY,
		queryFn: ChatService.fetchConversation,
		enabled: Boolean(token),
		refetchInterval: 30_000,
	});

	return {
		formateursQuery,
		conversationsQuery,
	};
};

export const useChatRealtime = ({
	roomPath,
	conversationId,
	currentUserId,
	queryClient,
	setNotice,
	setLive,
	messagesKey,
}: {
	roomPath: string | null;
	conversationId: number | null;
	currentUserId: number;
	queryClient: ReturnType<typeof useQueryClient>;
	setNotice: (value: string | null) => void;
	setLive: (value: { roomPath: string; id: number } | null) => void;
	messagesKey: (conversationId: number | null) => readonly [string, number | null];
}) => {
	const patchMessage = useCallback((convId: number, clientId: string, patch: Partial<ChatMessage>) => {
		queryClient.setQueryData<MessagesCache>(messagesKey(convId), (old) =>
			old ? { ...old, messages: old.messages.map((m) => (m.client_id === clientId ? { ...m, ...patch } : m)) } : old,
		);
	}, [messagesKey, queryClient]);

	const catchUp = useCallback(async (convId: number) => {
		const key = messagesKey(convId);
		const cached = queryClient.getQueryData<MessagesCache>(key);
		if (!cached) {
			await queryClient.invalidateQueries({ queryKey: key });
			return;
		}
		let afterId = lastServerId(cached.messages);
		for (let page = 0; page < 10; page += 1) {
			const { data } = await apiClient.get<MessagePage>(`/chat/conversations/${convId}/messages/`, {
				params: { after_id: afterId, limit: 100 },
			});
			if (data.results.length === 0) break;
			queryClient.setQueryData<MessagesCache>(key, (old) =>
				old
					? {
							...old,
							messages: sortMessages(
								data.results.reduce<ChatMessage[]>((acc, m) => upsertMessage(acc, m, m.client_id), old.messages),
							),
						}
					: old,
			);
			afterId = data.results[data.results.length - 1].id;
			if (!data.has_more) break;
		}
	}, [messagesKey, queryClient]);

	const handleEvent = useCallback((event: ServerEvent) => {
		switch (event.type) {
			case "ready": {
				setLive({ roomPath: roomPath ?? "", id: event.conversation_id });
				const known = (queryClient.getQueryData<ChatConversation[]>(["chat-conversations"]) ?? []).some(
					(c) => c.id === event.conversation_id,
				);
				if (!known) queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
				return;
			}
			case "message": {
				const incoming = event.message;
				const key = messagesKey(incoming.conversation);
				const cached = queryClient.getQueryData<MessagesCache>(key);

				if (cached) {
					queryClient.setQueryData<MessagesCache>(key, {
						...cached,
						messages: upsertMessage(cached.messages, incoming, event.client_id),
					});
				} else {
					queryClient.invalidateQueries({ queryKey: key });
				}

				queryClient.setQueryData<ChatConversation[]>(["chat-conversations"], (old) => {
					if (!old) return old;

					const exists = old.some((c) => c.id === incoming.conversation);
					if (!exists) {
						queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
						return old;
					}

					return old.map((c) => {
						if (c.id === incoming.conversation) {
							const isUnread = incoming.sender.id !== currentUserId && conversationId !== incoming.conversation;
							return {
								...c,
								last_message: incoming,
								updated_at: incoming.created_at,
								unread_count: isUnread ? (c.unread_count || 0) + 1 : c.unread_count,
							};
						}
						return c;
					});
				});
				return;
			}
			case "error": {
				setNotice((event.code === "too_long" ? `Message trop long (2000 caractères max).` : event.detail ?? "Une erreur est survenue."));
				if (event.client_id && conversationId !== null) {
					patchMessage(conversationId, event.client_id, { status: "failed" });
				}
				return;
			}
			default:
				return;
		}
	}, [conversationId, currentUserId, messagesKey, patchMessage, queryClient, roomPath, setLive, setNotice]);

	const handleOpen = useCallback(({ isReconnect, send: sendFn }: { isReconnect: boolean; send: (payload: object) => boolean }) => {
		if (!isReconnect || conversationId === null) return;
		const convId = conversationId;
		void (async () => {
			try {
				await catchUp(convId);
			} catch {
				// next reconnect will try again
			}
			const cached = queryClient.getQueryData<MessagesCache>(messagesKey(convId));
			cached?.messages
				.filter((m) => m.status === "sending" && m.client_id)
				.forEach((m) =>
					sendFn({
						type: "message",
						message: m.content,
						client_id: m.client_id,
						conversation_id: convId,
					}),
				);
		})();
	}, [catchUp, conversationId, messagesKey, queryClient]);

	const { status: socketStatus, send, reconnect } = useChatSocket({
		roomPath,
		onEvent: handleEvent,
		onOpen: handleOpen,
	});

	return {
		socketStatus,
		send,
		reconnect,
	};
};
