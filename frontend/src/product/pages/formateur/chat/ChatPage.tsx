import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../../other/services/apiClient";
import { TokenStorage } from "../../../../other/services/auth/storage";
import Box from "../../../../system/atoms/Container/Box";
import FetchError from "../../../../system/atoms/Loading/FetchError";
import Loading from "../../../../system/atoms/Loading/Loading";
import type {
	ChatConversation,
	ChatMessage,
	MessagePage,
	MessagesCache,
	ServerEvent,
} from "../../../../other/types/chatType";
import { useChatSocket } from "../../../../other/hooks/chat/useChatSocket";
import ChatLog from "./ChatLog";
import type { ChatRoomItem, RoomSelection } from "./ChatLog";
import ChatMessages from "./ChatMessages";

const PAGE_SIZE = 50;
const MAX_MESSAGE_LENGTH = 2000;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const MESSAGES_ROOT_KEY = ["chat-messages"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const ERROR_TEXT: Record<string, string> = {
	too_long: `Message trop long (${MAX_MESSAGE_LENGTH} caractères max).`,
	rate_limited: "Trop de messages envoyés, ralentissez un peu.",
	bad_json: "Message invalide.",
	bad_payload: "Message invalide.",
};

const newClientId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ---------------------------------------------------------------- message helpers

const lastServerId = (list: ChatMessage[]) => {
  for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].id > 0) return list[i].id;
  return 0;
};

const firstServerId = (list: ChatMessage[]) => list.find((m) => m.id > 0)?.id ?? 0;

function upsertMessage(list: ChatMessage[], incoming: ChatMessage, clientId?: string | null): ChatMessage[] {
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

function sortMessages(list: ChatMessage[]): ChatMessage[] {
  return [...list].sort((a, b) => {
    const aPending = a.id < 0;
    const bPending = b.id < 0;
    if (aPending && bPending) return b.id - a.id;
    if (aPending) return 1;
    if (bPending) return -1;
    return a.id - b.id;
  });
}

// ---------------------------------------------------------------- component

const ChatPage = () => {
  const queryClient = useQueryClient();

  const currentUser = (TokenStorage.getUser() ?? null) as { id: number; username: string; email: string } | null;
  const currentUserId = currentUser?.id ?? 0;
  const token = TokenStorage.getAccessToken();

  const [selectedRoom, setSelectedRoom] = useState<"general" | "direct">("general");
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");

  const tempIdRef = useRef(0);
  const lastReadRef = useRef(new Map<number, number>());

  // ------------------------------------------------------------ data

  const formateursQuery = useQuery({
    queryKey: ["chat-formateurs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quizzes/crud/utilisateurs/", { params: { role: "formateur" } });
      return data as { id: number; username: string; email: string }[];
    },
    enabled: Boolean(currentUserId),
  });

  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get<ChatConversation[]>("/chat/conversations/");
      return data;
    },
    enabled: Boolean(token),
    refetchInterval: 30_000,
  });

  const otherFormateurs = useMemo(
    () => (formateursQuery.data ?? []).filter((user) => user.id !== currentUserId),
    [formateursQuery.data, currentUserId]
  );

  const generalConversation = useMemo(
    () => (conversationsQuery.data ?? []).find((c) => c.type === "general") ?? null,
    [conversationsQuery.data]
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

  // Connect once. Always.
  const roomPath = currentUserId ? "/ws/chat/stream/" : null;

  // The open conversation is derived ONLY from the sidebar selection.
  const conversationId =
    selectedRoom === "general"
      ? (generalConversation?.id ?? null)
      : targetUserId
        ? (directConversationMap.get(targetUserId)?.id ?? null)
        : null;

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

  const catchUp = async (convId: number) => {
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
              messages: sortMessages(data.results.reduce((acc, m) => upsertMessage(acc, m, m.client_id), old.messages)),
            }
          : old
      );
      afterId = data.results[data.results.length - 1].id;
      if (!data.has_more) break;
    }
  };

  // ------------------------------------------------------------ socket

  const handleEvent = (event: ServerEvent) => {
    switch (event.type) {
      case "ready": {
        // Only make sure the conversations list knows about this conversation.
        // It must NOT decide which room is displayed.
        const known = (queryClient.getQueryData<ChatConversation[]>(CONVERSATIONS_KEY) ?? []).some(
          (c) => c.id === event.conversation_id
        );
        if (!known) queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
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

        // Keep the updater pure: decide first, then either invalidate or update.
        const list = queryClient.getQueryData<ChatConversation[]>(CONVERSATIONS_KEY);
        if (!list?.some((c) => c.id === incoming.conversation)) {
          queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
        } else {
          queryClient.setQueryData<ChatConversation[]>(CONVERSATIONS_KEY, (old) =>
            old?.map((c) =>
              c.id !== incoming.conversation
                ? c
                : {
                    ...c,
                    last_message: incoming,
                    updated_at: incoming.created_at,
                    unread_count:
                      incoming.sender.id !== currentUserId && conversationId !== incoming.conversation
                        ? (c.unread_count || 0) + 1
                        : c.unread_count,
                  }
            )
          );
        }
        return;
      }
      case "error": {
        setNotice(ERROR_TEXT[event.code] ?? event.detail ?? "Une erreur est survenue.");
        if (event.client_id) {
          // The error may arrive after the user switched rooms: find the message in any cache.
          queryClient.getQueriesData<MessagesCache>({ queryKey: MESSAGES_ROOT_KEY }).forEach(([key, data]) => {
            if (data?.messages.some((m) => m.client_id === event.client_id)) {
              queryClient.setQueryData<MessagesCache>(key, {
                ...data,
                messages: data.messages.map((m) =>
                  m.client_id === event.client_id ? { ...m, status: "failed" } : m
                ),
              });
            }
          });
        }
        return;
      }
      default:
        return;
    }
  };

  const handleOpen = ({ isReconnect, send: sendFn }: { isReconnect: boolean; send: (p: object) => boolean }) => {
    if (!isReconnect) return;

    // Other cached rooms may have missed messages while offline: refresh the list now,
    // and mark every message cache stale so each one refetches the next time it is opened.
    queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    queryClient.invalidateQueries({ queryKey: MESSAGES_ROOT_KEY, refetchType: "none" });

    if (conversationId === null) return;
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
          })
        );
    })();
  };

  const { status: socketStatus, send, reconnect } = useChatSocket({
    roomPath,
    onEvent: handleEvent,
    onOpen: handleOpen,
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

  // ------------------------------------------------------------ actions

  const loadOlder = async (beforeApply: () => void) => {
    if (conversationId === null || isLoadingOlder) return;
    const cached = queryClient.getQueryData<MessagesCache>(messagesKey(conversationId));
    const beforeId = cached ? firstServerId(cached.messages) : 0;
    if (!cached?.hasMore || !beforeId) return;

    setIsLoadingOlder(true);
    try {
      const { data } = await apiClient.get<MessagePage>(`/chat/conversations/${conversationId}/messages/`, {
        params: { limit: PAGE_SIZE, before_id: beforeId },
      });
      beforeApply(); // lets ChatMessages remember its scroll height right before the prepend
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
      setNotice("Impossible de charger les messages précédents.");
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const handleRoomSelect = (room: RoomSelection) => {
    if (room.type === "general") {
      setSelectedRoom("general");
      setTargetUserId(null);
      return;
    }
    setSelectedRoom("direct");
    setTargetUserId(room.userId ?? null);
  };

  const canSend = socketStatus === "connected" && (conversationId !== null || targetUserId !== null);

  // Returns true only when the message was really sent, so ChatMessages knows to clear its draft.
  const handleSend = (text: string): boolean => {
    if (!text || !canSend) return false;
    if (text.length > MAX_MESSAGE_LENGTH) {
      setNotice(ERROR_TEXT.too_long);
      return false;
    }

    const clientId = newClientId();
    if (
      !send({
        type: "message",
        message: text,
        client_id: clientId,
        conversation_id: conversationId,
        target_user_id: conversationId === null ? targetUserId : undefined,
      })
    )
      return false;

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

    return true;
  };

  const retryMessage = (message: ChatMessage) => {
    if (!message.client_id || conversationId === null) return;
    if (
      send({
        type: "message",
        message: message.content,
        client_id: message.client_id,
        conversation_id: conversationId,
      })
    ) {
      patchMessage(conversationId, message.client_id, { status: "sending" });
    }
  };

  // ------------------------------------------------------------ sidebar

  const roomList = useMemo<ChatRoomItem[]>(() => {
    const general: ChatRoomItem = {
      key: "general-room",
      type: "general",
      label: "Général formateurs",
      subtitle: generalConversation?.last_message?.content ?? "Salle commune",
      unread: generalConversation?.unread_count ?? 0,
      active: selectedRoom === "general",
      userId: undefined,
      lastAt: generalConversation?.last_message?.created_at ?? null,
    };

    const direct: ChatRoomItem[] = otherFormateurs.map((user) => {
      const conversation = directConversationMap.get(user.id);
      return {
        key: `direct-${user.id}`,
        type: "direct",
        label: user.username || user.email,
        subtitle: conversation?.last_message?.content ?? user.email,
        unread: conversation?.unread_count ?? 0,
        active: selectedRoom === "direct" && targetUserId === user.id,
        userId: user.id,
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

  const activeRoomLabel =
    selectedRoom === "general"
      ? "Général formateurs"
      : (otherFormateurs.find((user) => user.id === targetUserId)?.username ?? "Conversation directe");

  // ------------------------------------------------------------ render

  if (formateursQuery.isPending || conversationsQuery.isPending) {
    return <Loading message="Chargement de la messagerie..." />;
  }

  if (formateursQuery.isError || conversationsQuery.isError) {
    return <FetchError />;
  }

  return (
    <Box className="h-screen w-full gap-4 p-4" direction="row">
      <ChatLog rooms={roomList} onSelectRoom={handleRoomSelect} />

      {/* key = the SELECTION (not conversationId): switching rooms remounts the window
          (fresh draft + scroll state), but a new direct conversation getting its id does not. */}
      <ChatMessages
        key={selectedRoom === "general" ? "general" : `direct-${targetUserId}`}
        title={activeRoomLabel}
        messages={messages}
        currentUserId={currentUserId}
        socketStatus={socketStatus}
        notice={notice}
        canSend={canSend}
        hasMore={hasMore}
        isLoadingOlder={isLoadingOlder}
        isFetching={messagesQuery.isFetching}
        isError={messagesQuery.isError}
        onLoadOlder={loadOlder}
        onRetryMessage={retryMessage}
        onRetryFetch={() => void messagesQuery.refetch()}
        onReconnect={reconnect}
        onSend={handleSend}
      />
    </Box>
  );
};

export default ChatPage;
