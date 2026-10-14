import type { ChatMessage } from "../types/chatType";

export const lastServerId = (list: ChatMessage[]) => {
	for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].id > 0) return list[i].id;
	return 0;
};

export const firstServerId = (list: ChatMessage[]) => list.find((m) => m.id > 0)?.id ?? 0;

export function upsertMessage(list: ChatMessage[], incoming: ChatMessage, clientId?: string | null): ChatMessage[] {
	const key = clientId ?? incoming.client_id ?? null;
	if (key) {
		const index = list.findIndex((m) => m.client_id === key);
		if (index !== -1) {
			const next = [...list];
			next[index] = { ...incoming, client_id: key, status: undefined };
			return next;
		}
	}
	if (list.some((m) => m.id === incoming.id)) return list;
	return [...list, incoming];
}

export function sortMessages(list: ChatMessage[]): ChatMessage[] {
	return [...list].sort((a, b) => {
		const aPending = a.id < 0;
		const bPending = b.id < 0;
		if (aPending && bPending) return b.id - a.id;
		if (aPending) return 1;
		if (bPending) return -1;
		return a.id - b.id;
	});
}
