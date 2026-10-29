import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Box from "../../../system/atoms/Container/Box";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import ChatLog from "../../../system/organisms/chat/ChatLog";
import { useChat, useChatRealtime } from "../../../other/hooks/chat/useChat";
import { useChatLog } from "../../../other/hooks/chat/useChatLog";
import { ChatMessages } from "../../../system/organisms/chat/ChatMessages";
import { useAuth } from "../../../other/hooks/auth/useAuth";

const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const ChatPage = () => {
	const queryClient = useQueryClient();

	const { authUser: currentUser } = useAuth();
	const currentUserId = currentUser?.id ?? 0;

	const [selectedRoom, setSelectedRoom] = useState<"general" | "direct">("general");
	const [targetUserId, setTargetUserId] = useState<number | null>(null);
	const [,setLive] = useState<{ roomPath: string; id: number } | null>(null);
	const [draft, setDraft] = useState("");
	const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");
	const [notice, setNotice] = useState<string | null>(null);

	// ------------------------------------------------------------ data

	const { formateursQuery, conversationsQuery } = useChat();
	const { roomList, directConversationMap, generalConversation, activeRoomLabel } = useChatLog({
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

	// const conversationId = live && live.roomPath === roomPath ? live.id : knownConversationId;
	const conversationId = knownConversationId;

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
		setDraft("");
		setLive(null);
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
		<Box className="w-full h-screen gap-4 p-4" direction="row">
			<ChatLog roomList={roomList} handleRoomSelect={handleRoomSelect}/>
			<ChatMessages {...{ socketStatus, send, reconnect, draft, setDraft, isVisible, notice,
					conversationId, activeRoomLabel, roomPath, setNotice,
					currentUser, currentUserId, targetUserId,
				}}
			/>
		</Box>
	);
};

export default ChatPage;