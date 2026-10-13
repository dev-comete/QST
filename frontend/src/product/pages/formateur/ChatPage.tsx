import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../other/services/apiClient";
import { TokenStorage } from "../../../other/services/auth/storage";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Input from "../../../system/atoms/Form/Input";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import type {
	ChatConversation,
	ChatMessage,
	MessagePage,
	MessagesCache,
} from "../../../other/types/chatType";

import ChatLog from "../../../system/organisms/chat/ChatLog";
import { useChat, useChatRealtime } from "../../../other/hooks/chat/useChat";
import { useChatLog } from "../../../other/hooks/chat/useChatLog";
import { useChatConversation } from "../../../other/hooks/chat/useChatConversation";

const PAGE_SIZE = 50;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const STATUS_LABEL : Record<string, string> = {
	idle: "",
	connecting: "Connexion...",
	connected: "Connecté",
	reconnecting: "Reconnexion...",
	closed: "Déconnecté",
} as const;

	// ---------------------------------------------------------------- message helpers

	const lastServerId = (list: ChatMessage[]) => {
		for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].id > 0) return list[i].id;
		return 0;
	};

	const firstServerId = (list: ChatMessage[]) => list.find((m) => m.id > 0)?.id ?? 0;

	const sortMessages = (list: ChatMessage[]) => [...list].sort((a, b) => {
		const aPending = a.id < 0;
		const bPending = b.id < 0;
		if (aPending && bPending) return b.id - a.id;
		if (aPending) return 1;
		if (bPending) return -1;
		return a.id - b.id;
	});

	// ---------------------------------------------------------------- component

const ChatPage = () => {
	const queryClient = useQueryClient();

	const currentUser = (TokenStorage.getUser() ?? null) as { id: number; username: string; email: string } | null;
	const currentUserId = currentUser?.id ?? 0;

	const [selectedRoom, setSelectedRoom] = useState<"general" | "direct">("general");
	const [targetUserId, setTargetUserId] = useState<number | null>(null);
	const [live, setLive] = useState<{ roomPath: string; id: number } | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [isLoadingOlder, setIsLoadingOlder] = useState(false);
	const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");

	const scrollRef = useRef<HTMLDivElement | null>(null);
	const atBottomRef = useRef(true);
	const restoreScrollRef = useRef<number | null>(null);
	const lastReadRef = useRef(new Map<number, number>());

	// ------------------------------------------------------------ data

	const { formateursQuery, conversationsQuery } = useChat();
	const { roomList, activeRoomLabel, directConversationMap, generalConversation } = useChatLog({
		currentUserId,
		selectedRoom,
		targetUserId,
		formateursQuery,
		conversationsQuery,
	});

	// Connect once. Always.
	const roomPath = currentUserId ? "/ws/chat/stream/" : null;

	const knownConversationId =
	selectedRoom === "general"
		? (generalConversation?.id ?? null)
		: targetUserId
		? (directConversationMap.get(targetUserId)?.id ?? null)
		: null;

	const conversationId = live && live.roomPath === roomPath ? live.id : knownConversationId;

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

	const messages = messagesQuery.data?.messages ?? EMPTY_MESSAGES;
	const hasMore = messagesQuery.data?.hasMore ?? false;
	const newestServerId = lastServerId(messages);

	// ------------------------------------------------------------ cache helpers

	const patchMessage = (convId: number, clientId: string, patch: Partial<ChatMessage>) => {
		queryClient.setQueryData<MessagesCache>(messagesKey(convId), (old) =>
			old ? { ...old, messages: old.messages.map((m) => (m.client_id === clientId ? { ...m, ...patch } : m)) } : old
		);
	};

	// ------------------------------------------------------------ socket

	const { socketStatus, send, reconnect } = useChatRealtime({
		roomPath,
		conversationId,
		currentUserId,
		queryClient,
		setNotice,
		setLive,
		messagesKey,
	});

	// ------------------------------------------------------------ effects

	useEffect(() => {
		const onVisibility = () => setIsVisible(document.visibilityState === "visible");
		document.addEventListener("visibilitychange", onVisibility);
		return () => document.removeEventListener("visibilitychange", onVisibility);
	}, []);

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

	const handleScroll = () => {
		const element = scrollRef.current;
		if (!element) return;
			atBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
	};

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

	const handleRoomSelect = (room: { type: "general" | "direct"; userId?: number }) => {
		atBottomRef.current = true;
		setDraft("");
		if (room.type === "general") {
			setSelectedRoom("general");
			setTargetUserId(null);
			return;
		}
		setSelectedRoom("direct");
		setTargetUserId(room.userId ?? null);
	};

	const canSend = socketStatus === "connected" && (conversationId !== null || targetUserId !== null);
	const { draft, setDraft, handleSubmit, retryMessage } = useChatConversation({
		currentUser,
		currentUserId,
		conversationId,
		targetUserId,
		canSend,
		send,
		queryClient,
		setNotice,
		patchMessage,
	});

	// ------------------------------------------------------------ render

	if (formateursQuery.isPending || conversationsQuery.isPending) {
		return <Loading message="Chargement de la messagerie..." />;
	}

	if (formateursQuery.isError || conversationsQuery.isError) {
		return <FetchError />;
	}

	return (
	<Box className="h-[calc(100vh-110px)] w-full gap-4 p-4" direction="row">

		{/* Left side */}
		<ChatLog roomList={roomList} handleRoomSelect={handleRoomSelect}/>

		{/* Right side */}
		<Paper className="flex-1 overflow-hidden p-0" hasShadow>
			<Box direction="column" className="h-full w-full">
				<Box className="w-full items-center justify-between border-b border-background p-4">
					<CustomText textTag="h3" weight="bold">
						{activeRoomLabel}
					</CustomText>
					<span className="flex items-center gap-2">
						<CustomText color="disabled" textTag="span" className="text-xs">
						{STATUS_LABEL[socketStatus]}
						</CustomText>
						{socketStatus === "closed" && roomPath && (
						<button type="button" onClick={reconnect} className="text-xs underline">
							Réessayer
						</button>
						)}
					</span>
				</Box>

				{(socketStatus === "reconnecting" || socketStatus === "closed") && roomPath && (
				<div className="w-full bg-background-light px-4 py-2 text-xs">
					{socketStatus === "reconnecting"
					? "Connexion perdue. Reconnexion en cours — vos messages seront envoyés dès le retour."
					: "Impossible de se connecter à la messagerie."}
				</div>
				)}

				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className="flex w-full flex-1 flex-col gap-3 overflow-y-auto p-4"
				>
				{hasMore && (
					<button
						type="button"
						onClick={loadOlder}
						disabled={isLoadingOlder}
						className="self-center text-xs underline disabled:opacity-50"
					>
						{isLoadingOlder ? "Chargement..." : "Charger les messages précédents"}
					</button>
				)}

				{messagesQuery.isError && (
					<Paper className="w-full bg-background-light p-4">
						<CustomText color="disabled" textTag="span">
							Impossible de charger les messages.{" "}
							<button type="button" className="underline" onClick={() => messagesQuery.refetch()}>
							Réessayer
							</button>
						</CustomText>
					</Paper>
				)}

				{!messagesQuery.isError && messages.length === 0 ? (
					<Paper className="w-full bg-background-light p-4">
						<CustomText color="disabled" textTag="span">
							{messagesQuery.isFetching ? "Chargement..." : "Aucun message pour l’instant."}
						</CustomText>
					</Paper>
				) : (
					messages.map((message) => {
					const isMine = message.sender.id === currentUserId;
					return (
						<Box
						key={message.client_id ?? `srv-${message.id}`}
						className={`w-full ${isMine ? "justify-end" : "justify-start"}`}
						>
						<Paper
							className={`max-w-[75%] p-3 ${isMine ? "bg-primary text-white" : "bg-background-light"} ${
							message.status === "sending" ? "opacity-70" : ""
							}`}
						>
							{!isMine && (
							<CustomText textTag="span" weight="bold" className="mb-1 block text-xs">
								{message.sender.username || message.sender.email || "Formateur"}
							</CustomText>
							)}
							<CustomText textTag="span" className="block whitespace-pre-wrap break-words">
							{message.content}
							</CustomText>
							<span className="mt-2 flex items-center gap-2 text-[10px] opacity-75">
							<span>
								{new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
							</span>
							{message.status === "sending" && <span>Envoi…</span>}
							{message.status === "failed" && (
								<button type="button" className="underline" onClick={() => retryMessage(message)}>
								Échec · Réessayer
								</button>
							)}
							</span>
						</Paper>
						</Box>
					);
					})
				)}
				</div>

				{notice && <div className="w-full bg-background-light px-4 py-2 text-xs">{notice}</div>}

				{/* Chat Input */}
				<form onSubmit={handleSubmit} className="w-full">
					<Box className="w-full items-center gap-2 border-t border-background p-4">
						<div className="flex-1">
						<Input
							id="chat-message"
							name="chat-message"
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							placeholder="Écrire un message..."
							className="border-0 bg-background-light"
						/>
						</div>
						<ActionButton type="submit" disabled={!canSend || draft.trim().length === 0}>
						Envoyer
						</ActionButton>
					</Box>
				</form>
			</Box>
		</Paper>
	</Box>
	);
};

export default ChatPage;