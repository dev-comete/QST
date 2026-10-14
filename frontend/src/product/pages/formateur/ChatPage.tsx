import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TokenStorage } from "../../../other/services/auth/storage";
import Box from "../../../system/atoms/Container/Box";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import ChatLog from "../../../system/organisms/chat/ChatLog";
import { useChat, useChatRealtime } from "../../../other/hooks/chat/useChat";
import { useChatLog } from "../../../other/hooks/chat/useChatLog";
import { ChatMessages } from "../../../system/organisms/chat/ChatMessages";

const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const ChatPage = () => {
	const queryClient = useQueryClient();

	const currentUser = (TokenStorage.getUser() ?? null) as { id: number; username: string; email: string } | null;
	const currentUserId = currentUser?.id ?? 0;

	const [selectedRoom, setSelectedRoom] = useState<"general" | "direct">("general");
	const [targetUserId, setTargetUserId] = useState<number | null>(null);
	const [live, setLive] = useState<{ roomPath: string; id: number } | null>(null);
	const atBottomRef = useRef(true);

	// ------------------------------------------------------------ data

	const { formateursQuery, conversationsQuery } = useChat();
	const { roomList, directConversationMap, generalConversation } = useChatLog({
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


	// ------------------------------------------------------------ render

	if (formateursQuery.isPending || conversationsQuery.isPending) {
		return <Loading message="Chargement de la messagerie..." />;
	}

	if (formateursQuery.isError || conversationsQuery.isError) {
		return <FetchError />;
	}

	return (
		<Box className="h-[calc(100vh-110px)] w-full gap-4 p-4" direction="row">
			<ChatLog roomList={roomList} handleRoomSelect={handleRoomSelect}/>
			<ChatMessages
			
			
			/>
		</Box>
	);
};

export default ChatPage;