import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import type { ChatMessage, MessagesCache } from "../../types/chatType";

const PAGE_SIZE = 50;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

export const useChatMessages = ({
	currentUser,
	currentUserId,
	conversationId,
	targetUserId,
	canSend,
	send,
	setNotice,
}: {
	currentUser: { id: number; username: string; email: string } | null;
	currentUserId: number;
	conversationId: number | null;
	targetUserId: number | null;
	canSend: boolean;
	send: (payload: object) => boolean;
	setNotice: (value: string | null) => void;
}) => {
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);
	const atBottomRef = useRef(true);
	const restoreScrollRef = useRef<number | null>(null);
	const lastReadRef = useRef(new Map<number, number>());
	const tempIdRef = useRef(0);

	const queryClient = useQueryClient()

	const messagesQuery = useQuery({
		queryKey: messagesKey(conversationId),
		queryFn: async (): Promise<MessagesCache> => {
				const { data } = await apiClient.get<MessagePage>(`/chat/conversations/${conversationId}/messages/`, {
				params: { limit: PAGE_SIZE },
				});
				const existing = queryClient.getQueryData<MessagesCache>(messagesKey(conversationId));
				const pending = (existing?.messages ?? []).filter(
					(m) => m.id < 0 && !data.results.some((r) => r.client_id && r.client_id === m.client_id)
				);
				return { messages: [...data.results, ...pending], hasMore: data.has_more };
			},
			enabled: conversationId !== null,
			staleTime: Infinity,
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
	});

	// ------------------------------------------------------------ cache helpers

	const patchMessage = (convId: number, clientId: string, patch: Partial<ChatMessage>) => {
		queryClient.setQueryData<MessagesCache>(messagesKey(convId), (old) =>
			old ? { ...old, messages: old.messages.map((m) => (m.client_id === clientId ? { ...m, ...patch } : m)) } : old
		);
	};

	const handleScroll = () => {
		const element = scrollRef.current;
		if (!element) return;
		atBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
	};

	const messages = messagesQuery.data?.messages ?? EMPTY_MESSAGES;
	const hasMore = messagesQuery.data?.hasMore ?? false;
	const newestServerId = lastServerId(messages);

	// ------------------------------------------------------------ effects

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(null), 4000);
		return () => window.clearTimeout(timer);
	}, [notice]);

	useEffect(() => {
		if (conversationId === null || !newestServerId || !isVisible) return;
		if (lastReadRef.current.get(conversationId) === newestServerId) return;

		lastReadRef.current.set(conversationId, newestServerId);
		apiClient
			.post(`/chat/conversations/${conversationId}/read/`, { last_id: newestServerId })
			.catch(() => lastReadRef.current.delete(conversationId));
		queryClient.setQueryData<ChatConversation[]>(CONVERSATIONS_KEY, (old) =>
			old?.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
		);
	}, [conversationId, newestServerId, isVisible, queryClient]);

	useLayoutEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		if (restoreScrollRef.current !== null) {
			element.scrollTop += element.scrollHeight - restoreScrollRef.current;
			restoreScrollRef.current = null;
			return;
		}
		const last = messages[messages.length - 1];
		if (atBottomRef.current || last?.sender.id === currentUserId) {
			element.scrollTop = element.scrollHeight;
		}
	}, [messages, currentUserId]);

	// ------------------------------------------------------------ actions

	const loadOlder = async () => {
		if (conversationId === null || isLoadingOlder) return;
		const cached = queryClient.getQueryData<MessagesCache>(messagesKey(conversationId));
		const beforeId = cached ? firstServerId(cached.messages) : 0;
		if (!cached?.hasMore || !beforeId) return;

		setIsLoadingOlder(true);
		const previousHeight = scrollRef.current?.scrollHeight ?? 0;
		try {
			const { data } = await apiClient.get<MessagePage>(`/chat/conversations/${conversationId}/messages/`, {
			params: { limit: PAGE_SIZE, before_id: beforeId }});
			restoreScrollRef.current = previousHeight;
			queryClient.setQueryData<MessagesCache>(messagesKey(conversationId), (old) =>
			old
				? {
					hasMore: data.has_more,
					messages: sortMessages([
					...data.results.filter((r) => !old.messages.some((m) => m.id === r.id)),
					...old.messages,
					]),
				}
				: old
			);
		} catch {
			restoreScrollRef.current = null;
			setNotice("Impossible de charger les messages précédents.");
		} finally {
			setIsLoadingOlder(false);
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || !canSend) return;
		if (text.length > 2000) {
			setNotice(`Message trop long (2000 caractères max).`);
			return;
		}

		const clientId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
		if (!send({
			type: "message",
			message: text,
			client_id: clientId,
			conversation_id: conversationId,
			target_user_id: conversationId === null ? targetUserId : undefined,
		})) return;

		if (conversationId !== null) {
			const optimistic: ChatMessage = {
				id: -Date.now(),
				conversation: conversationId,
				sender: { id: currentUserId, username: currentUser?.username ?? "Moi", email: currentUser?.email ?? "" },
				content: text,
				created_at: new Date().toISOString(),
				client_id: clientId,
				status: "sending",
			};
			queryClient.setQueryData<MessagesCache>(["chat-messages", conversationId], (old) => ({
				hasMore: old?.hasMore ?? false,
				messages: [...(old?.messages ?? []), optimistic],
			}));
		}

		setDraft("");
	};

	const retryMessage = (message: ChatMessage) => {
		if (!message.client_id || conversationId === null) return;
		if (send({
			type: "message",
			message: message.content,
			client_id: message.client_id,
			conversation_id: conversationId,
			target_user_id: conversationId === null ? targetUserId : undefined,
		})) {
			patchMessage(conversationId, message.client_id, { status: "sending" });
		}
	};

	return {
		draft,
		setDraft,
		handleSubmit,
		retryMessage,
		messagesQuery,
	};
};
