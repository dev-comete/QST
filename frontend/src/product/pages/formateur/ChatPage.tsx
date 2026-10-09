import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
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
  ServerEvent,
} from "./types";
import { useChatSocket } from "./useChatSocket";

const PAGE_SIZE = 50;
const MAX_MESSAGE_LENGTH = 2000;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const ERROR_TEXT: Record<string, string> = {
  too_long: `Message trop long (${MAX_MESSAGE_LENGTH} caractères max).`,
  rate_limited: "Trop de messages envoyés, ralentissez un peu.",
  bad_json: "Message invalide.",
  bad_payload: "Message invalide.",
};

const STATUS_LABEL = {
  idle: "",
  connecting: "Connexion...",
  connected: "Connecté",
  reconnecting: "Reconnexion...",
  closed: "Déconnecté",
} as const;

const newClientId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// ---------------------------------------------------------------- message helpers

const lastServerId = (list: ChatMessage[]) => {
  for (let i = list.length - 1; i >= 0; i -= 1) if (list[i].id > 0) return list[i].id;
  return 0;
};

const firstServerId = (list: ChatMessage[]) => list.find((m) => m.id > 0)?.id ?? 0;

/** Insert a server message, replacing the optimistic bubble that has the same client_id. */
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

/** Server messages by id, then still-pending optimistic ones (negative ids) in send order. */
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
  const [live, setLive] = useState<{ roomPath: string; id: number } | null>(null);
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isVisible, setIsVisible] = useState(document.visibilityState === "visible");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef(true);
  const restoreScrollRef = useRef<number | null>(null);
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
    refetchInterval: 30_000, // keeps unread badges of OTHER rooms reasonably fresh
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

  // The ONLY thing that (re)creates the WebSocket.
  const roomPath = useMemo(() => {
    if (selectedRoom === "general") return "/ws/chat/general/";
    return targetUserId ? `/ws/chat/direct/${targetUserId}/` : null;
  }, [selectedRoom, targetUserId]);

  const knownConversationId =
    selectedRoom === "general"
      ? (generalConversation?.id ?? null)
      : targetUserId
        ? (directConversationMap.get(targetUserId)?.id ?? null)
        : null;

  // After connecting, the server tells us the id (needed for a brand new DM).
  const conversationId = live && live.roomPath === roomPath ? live.id : knownConversationId;

  const messagesQuery = useQuery({
    queryKey: messagesKey(conversationId),
    queryFn: async (): Promise<MessagesCache> => {
      const { data } = await apiClient.get<MessagePage>(`/chat/conversations/${conversationId}/messages/`, {
        params: { limit: PAGE_SIZE },
      });
      // Keep optimistic messages that the server doesn't know about yet.
      const existing = queryClient.getQueryData<MessagesCache>(messagesKey(conversationId));
      const pending = (existing?.messages ?? []).filter(
        (m) => m.id < 0 && !data.results.some((r) => r.client_id && r.client_id === m.client_id)
      );
      return { messages: [...data.results, ...pending], hasMore: data.has_more };
    },
    enabled: conversationId !== null,
    staleTime: Infinity, // the socket keeps it fresh; we catch up manually after a reconnect
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

  /** After a reconnect: fetch everything newer than what we have (paged). */
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
        setLive({ roomPath: roomPath ?? "", id: event.conversation_id });
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
        queryClient.setQueryData<ChatConversation[]>(CONVERSATIONS_KEY, (old) =>
          old?.map((c) =>
            c.id === incoming.conversation ? { ...c, last_message: incoming, updated_at: incoming.created_at } : c
          )
        );
        return;
      }
      case "error": {
        setNotice(ERROR_TEXT[event.code] ?? event.detail ?? "Une erreur est survenue.");
        if (event.client_id && conversationId !== null) {
          patchMessage(conversationId, event.client_id, { status: "failed" });
        }
        return;
      }
      default:
        return;
    }
  };

  const handleOpen = ({ isReconnect, send: sendFn }: { isReconnect: boolean; send: (p: object) => boolean }) => {
    if (!isReconnect || conversationId === null) return;
    const convId = conversationId;
    void (async () => {
      try {
        await catchUp(convId);
      } catch {
        /* the next reconnect will try again */
      }
      // Re-send what was still "sending" when the connection dropped.
      // Safe: the server de-duplicates on client_id.
      const cached = queryClient.getQueryData<MessagesCache>(messagesKey(convId));
      cached?.messages
        .filter((m) => m.status === "sending" && m.client_id)
        .forEach((m) => sendFn({ type: "message", message: m.content, client_id: m.client_id }));
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

  // Mark as read while the tab is visible and the room is open.
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

  // Scroll: stick to the bottom for new messages, keep position when prepending history.
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
        params: { limit: PAGE_SIZE, before_id: beforeId },
      });
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

  const canSend = socketStatus === "connected" && conversationId !== null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !canSend || conversationId === null) return;
    if (text.length > MAX_MESSAGE_LENGTH) {
      setNotice(ERROR_TEXT.too_long);
      return;
    }

    const clientId = newClientId();
    if (!send({ type: "message", message: text, client_id: clientId })) return;

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

    atBottomRef.current = true;
    setDraft("");
  };

  const retryMessage = (message: ChatMessage) => {
    if (!message.client_id || conversationId === null) return;
    if (send({ type: "message", message: message.content, client_id: message.client_id })) {
      patchMessage(conversationId, message.client_id, { status: "sending" });
    }
  };

  // ------------------------------------------------------------ sidebar

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
    <Box className="h-[calc(100vh-110px)] w-full gap-4 p-4" direction="row">
      <Paper className="w-[320px] min-w-[260px] overflow-y-auto p-3" hasShadow>
        <CustomText textTag="h3" weight="bold" className="mb-4">
          Messagerie
        </CustomText>

        <Box direction="column" className="gap-2">
          {roomList.map((room) => {
            const unread = room.active ? 0 : room.unread;
            return (
              <button
                key={room.key}
                onClick={() => handleRoomSelect(room)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  room.active ? "border-primary bg-primary-light" : "border-transparent bg-background-light hover:border-primary"
                }`}
                type="button"
              >
                <span className="flex items-center justify-between gap-2">
                  <CustomText weight="bold" className="block truncate">
                    {room.label}
                  </CustomText>
                  {unread > 0 && (
                    <span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </span>
                <CustomText color="disabled" textTag="span" className="block truncate text-xs">
                  {room.subtitle}
                </CustomText>
              </button>
            );
          })}
        </Box>
      </Paper>

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
              {socketStatus === "closed" && (
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
