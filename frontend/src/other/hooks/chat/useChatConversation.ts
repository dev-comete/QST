import type { useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import type { ChatMessage, MessagesCache } from "../../types/chatType";

export const useChatConversation = ({
	currentUser,
	currentUserId,
	conversationId,
	targetUserId,
	canSend,
	send,
	queryClient,
	setNotice,
	patchMessage,
}: {
	currentUser: { id: number; username: string; email: string } | null;
	currentUserId: number;
	conversationId: number | null;
	targetUserId: number | null;
	canSend: boolean;
	send: (payload: object) => boolean;
	queryClient: ReturnType<typeof useQueryClient>;
	setNotice: (value: string | null) => void;
	patchMessage: (convId: number, clientId: string, patch: Partial<ChatMessage>) => void;
}) => {
	const [draft, setDraft] = useState("");

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
	};
};
