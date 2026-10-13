import type { useQuery } from "@tanstack/react-query";
import type { ChatConversation } from "../../types/chatType";
import type { useUser } from "../user/useUser";
import { useMemo } from "react";

export const useChatLog = ({
	currentUserId,
	selectedRoom,
	targetUserId,
	formateursQuery,
	conversationsQuery,
}: {
	currentUserId: number;
	selectedRoom: "general" | "direct";
	targetUserId: number | null;
	formateursQuery: ReturnType<typeof useUser>["getUserQuery"];
	conversationsQuery: ReturnType<typeof useQuery<ChatConversation[]>>;
}) => {
	const otherFormateurs = useMemo(
		() => (formateursQuery.data ?? []).filter((user) => user.id !== currentUserId),
		[formateursQuery.data, currentUserId],
	);

	const generalConversation = useMemo(
		() => (conversationsQuery.data ?? []).find((c) => c.type === "general") ?? null,
		[conversationsQuery.data],
	);

	const directConversationMap = useMemo(() => {
		const map = new Map<number, ChatConversation>();
		(conversationsQuery.data ?? []).forEach((conversation) => {
			if (conversation.type !== "direct") return;
			const other = conversation.participants.find((person) => person.id !== currentUserId);
			if (other) map.set(other.id, conversation);
		});
		return map;
	}, [conversationsQuery.data, currentUserId]);

	const roomList = useMemo(() => {
		const general = {
			key: "general-room",
			type: "general" as const,
			label: "Général formateurs",
			subtitle: generalConversation?.last_message?.content ?? "Salle commune",
			unread: generalConversation?.unread_count ?? 0,
			active: selectedRoom === "general",
			userId: undefined as number | undefined,
			lastAt: generalConversation?.last_message?.created_at ?? null,
		};

		const direct = otherFormateurs.map((user) => {
			const conversation = directConversationMap.get(user.id);
			return {
				key: `direct-${user.id}`,
				type: "direct" as const,
				label: user.username || user.email,
				subtitle: conversation?.last_message?.content ?? user.email,
				unread: conversation?.unread_count ?? 0,
				active: selectedRoom === "direct" && targetUserId === user.id,
				userId: user.id as number | undefined,
				lastAt: conversation?.last_message?.created_at ?? null,
			};
		});

		direct.sort((a, b) => {
			if (a.lastAt && b.lastAt) return b.lastAt.localeCompare(a.lastAt);
			if (a.lastAt) return -1;
			if (b.lastAt) return 1;
			return a.label.localeCompare(b.label);
		});

		return [general, ...direct];
	}, [directConversationMap, generalConversation, otherFormateurs, selectedRoom, targetUserId]);

	const activeRoomLabel = selectedRoom === "general"
		? "Général formateurs"
		: (otherFormateurs.find((user) => user.id === targetUserId)?.username ?? "Conversation directe");

	return {
		otherFormateurs,
		generalConversation,
		directConversationMap,
		roomList,
		activeRoomLabel,
	};
};
