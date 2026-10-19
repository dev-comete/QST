import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction, type SubmitEventHandler } from "react";
import type { ChatConversation, ChatMessage, MessagePage, MessagesCache } from "../../types/chatType";
import { ChatService, type MarkReadParams } from "../../services/chatService";
import { firstServerId, lastServerId, newClientId, sortMessages } from "../../helper/chatHelper";

const PAGE_SIZE = 50;
const MAX_MESSAGE_LENGTH = 2000;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const normalizeMessagesData = (data?: MessagePage | MessagesCache) => {
	if (!data) return { results: [] as ChatMessage[], hasMore: false };
	if ("results" in data) {
		return { results: data.results, hasMore: data.has_more };
	}
	return { results: data.messages, hasMore: data.hasMore };
};

const ERROR_TEXT: Record<string, string> = {
	too_long: `Message trop long (${MAX_MESSAGE_LENGTH} caractères max).`,
	rate_limited: "Trop de messages envoyés, ralentissez un peu.",
	bad_json: "Message invalide.",
	bad_payload: "Message invalide.",
};


interface useChatMessagesParam {
	currentUser: { id: number; username: string; email: string } | null;
	currentUserId: number;
	conversationId: number | null;
	targetUserId: number | null;
	canSend: boolean;
	send: (payload: object) => boolean;
	setNotice: (value: string | null) => void;
	notice : string | null
	isVisible: boolean
	draft: string
	setDraft: Dispatch<SetStateAction<string>>
	scrollRef: RefObject<HTMLDivElement | null>;
}

export const useChatMessages = ({
	currentUser,
	currentUserId,
	conversationId,
	targetUserId,
	canSend,send,
	isVisible,
	notice, setNotice,
	draft, setDraft,
	scrollRef,
}: useChatMessagesParam ) => {
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);
	const atBottomRef = useRef(true);
	const restoreScrollRef = useRef<number | null>(null);
	const lastReadRef = useRef<Map<number | string, number | string>>(new Map());
	const tempIdRef = useRef(0);

	// ------------------------------------------------------------ query and mutation

	const queryClient = useQueryClient()

	const messagesQuery = useQuery({
		queryKey: messagesKey(conversationId),
		queryFn: () => ChatService.fetchMessages(conversationId, 10),
		enabled: conversationId !== null,
		staleTime: Infinity,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		select: (serverData) => {
			const normalized = normalizeMessagesData(serverData as MessagePage | MessagesCache);
			const existing = queryClient.getQueryData<MessagesCache>(messagesKey(conversationId));
			const pending = (existing?.messages ?? []).filter(
				(m: ChatMessage) =>
				m.id < 0 &&
				!normalized.results.some((r) => r.client_id && r.client_id === m.client_id)
			);

			return {
				messages: [...normalized.results, ...pending],
				hasMore: normalized.hasMore,
			};
		},
	});

	const markAsReadMutation = useMutation({
		mutationFn: () => ChatService.sendLastServerId({ conversationId, newestServerId }),
		onMutate: async ({conversationId} : MarkReadParams) => {
			await queryClient.cancelQueries({ queryKey: CONVERSATIONS_KEY });

			const previousConversations = queryClient.getQueryData<ChatConversation[]>(CONVERSATIONS_KEY);

			queryClient.setQueryData<ChatConversation[]>(CONVERSATIONS_KEY, (old) =>
				old?.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
			);

			return { previousConversations };
		},
		onError: (_err, variables, context) => {
			if (variables.conversationId) lastReadRef.current.delete(variables.conversationId);

			if (context?.previousConversations) {
				queryClient.setQueryData(CONVERSATIONS_KEY, context.previousConversations);
			}
		},
		meta: { suppressToast: true }
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

	// ------------------------------------------------------------ data


	const messages = messagesQuery.data?.messages ?? EMPTY_MESSAGES;
	const hasMore = messagesQuery.data?.hasMore ?? false;
	const newestServerId = lastServerId(messages);

	// ------------------------------------------------------------ effects

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(null), 4000);
		return () => window.clearTimeout(timer);
	}, [notice, setNotice]);

	useEffect(() => {
		if (conversationId === null || !newestServerId || !isVisible) return;
	
		if (lastReadRef.current.get(conversationId) === newestServerId) return;
	
		lastReadRef.current.set(conversationId, newestServerId);
	
		markAsReadMutation.mutate({ conversationId, newestServerId });
	}, [conversationId, newestServerId, isVisible, markAsReadMutation]);

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
	}, [messages, currentUserId, scrollRef]);

	// ------------------------------------------------------------ actions

	const loadOlder = async () => {
		if (conversationId === null || isLoadingOlder) return;

		const getCached = queryClient.getQueryData<MessagePage>(messagesKey(conversationId));
		const cached = {
			hasMore: getCached?.has_more,
			messages: getCached?.results ?? []
		}

		const beforeId = cached ? firstServerId(cached.messages) : 0;
		if (!cached?.hasMore || !beforeId) return;
	
		setIsLoadingOlder(true);
		const previousHeight = scrollRef.current?.scrollHeight ?? 0;
	
		try {
			const data = await queryClient.fetchQuery({
				queryKey: ['messages', conversationId, beforeId],
				queryFn: () => ChatService.fetchMessages(conversationId, PAGE_SIZE, beforeId),
				meta: { suppressToast: true }
			});
	
			restoreScrollRef.current = previousHeight;

			queryClient.setQueryData<MessagesCache>(messagesKey(conversationId), (old) => {
			
				// Provide default fallback values for new data
				const newResults = data?.results ?? [];
				const hasMore = data?.has_more ?? false;
			
				// Handle initial state if old cache is empty/undefined
				if (!old) {
					return {
						hasMore,
						messages: sortMessages([...newResults]),
					};
				}
			
				const existingMessages = old.messages ?? [];
			
				// Filter out duplicates safely
				const uniqueNewMessages = newResults.filter(
					(r) => !existingMessages.some((m) => m.id === r.id)
				);
			
				return {
					hasMore,
					messages: sortMessages([...uniqueNewMessages, ...existingMessages]),
				};
			});

		} catch {
			restoreScrollRef.current = null;
			setNotice("Impossible de charger les messages précédents.");
		} finally {
			setIsLoadingOlder(false);
		}
	};

	const handleSubmit : SubmitEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || !canSend) return;
		if (text.length > MAX_MESSAGE_LENGTH) {
			setNotice(ERROR_TEXT.too_long);
			return;
		}

		const clientId = newClientId();
		if (!send({ 
			type: "message", 
			message: text, 
			client_id: clientId,
			conversation_id: conversationId,
			target_user_id: conversationId === null ? targetUserId : undefined
		})) return;

		// Optimistic UI for existing conversations
		if (conversationId !== null) {
			tempIdRef.current += 1;
			const optimistic: ChatMessage = {
					id: -tempIdRef.current,
					conversation: conversationId,
					sender: { id: currentUserId, username: currentUser?.username ?? "Moi", email: currentUser?.email ?? "" },
					content: text,
					created_at: new Date().toISOString(),
					client_id: clientId,
					status: "sending",
				};
				queryClient.setQueryData<MessagesCache>(messagesKey(conversationId), (old) => ({
				hasMore: old?.hasMore ?? false,
				messages: [...(old?.messages ?? []), optimistic],
			}));
		}
		atBottomRef.current = true;
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
		handleSubmit,
		retryMessage,
		messages,
		messagesQuery,
		handleScroll,
		loadOlder, isLoadingOlder,
		hasMore,
	};
};
