import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../../other/services/apiClient";
import { TokenStorage } from "../../../other/services/auth/storage";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import Input from "../../../system/atoms/Form/Input";
import FetchError from "../../../system/atoms/Loading/FetchError";
import Loading from "../../../system/atoms/Loading/Loading";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";

interface ChatParticipant {
  id: number;
  username: string;
  email: string;
}

interface ChatMessage {
  id: number;
  conversation: number;
  sender: ChatParticipant;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatConversation {
  id: number;
  type: "general" | "direct";
  title: string | null;
  participants: ChatParticipant[];
  created_at: string;
  updated_at: string;
  last_message: ChatMessage | null;
}

interface ChatRoomItem {
  id: number | null;
  type: "general" | "direct";
  label: string;
  subtitle: string;
  userId?: number;
  active: boolean;
}

const ChatPage = () => {
  const currentUser = (TokenStorage.getUser() ?? null) as { id: number; username: string; email: string } | null;
  const currentUserId = currentUser?.id ?? 0;
  const token = TokenStorage.getAccessToken();

  const [selectedRoom, setSelectedRoom] = useState<"general" | "direct">("general");
  const [targetUserId, setTargetUserId] = useState<number | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState<string>("");
  const [socketStatus, setSocketStatus] = useState<"connecting" | "connected" | "closed" | "error">("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  const formateursQuery = useQuery({
    queryKey: ["chat-formateurs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quizzes/crud/utilisateurs/", {
        params: { role: "formateur" },
      });
      return data as { id: number; username: string; email: string }[];
    },
    enabled: Boolean(currentUserId),
  });

  const conversationsQuery = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const { data } = await apiClient.get<ChatConversation[]>("/chat/conversations/");
      return data;
    },
    enabled: Boolean(token),
  });

  const otherFormateurs = useMemo(
    () => (formateursQuery.data ?? []).filter((user) => user.id !== currentUserId),
    [formateursQuery.data, currentUserId]
  );

  const generalConversation = useMemo(
    () => (conversationsQuery.data ?? []).find((conversation) => conversation.type === "general") ?? null,
    [conversationsQuery.data]
  );

  const directConversationMap = useMemo(() => {
    const directMap = new Map<number, ChatConversation>();

    (conversationsQuery.data ?? []).forEach((conversation) => {
      if (conversation.type !== "direct") {
        return;
      }

      const otherParticipant = conversation.participants.find((person) => person.id !== currentUserId);
      if (!otherParticipant) {
        return;
      }

      directMap.set(otherParticipant.id, conversation);
    });

    return directMap;
  }, [conversationsQuery.data, currentUserId]);

  const loadMessages = useCallback(async (conversationId: number | null) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      const { data } = await apiClient.get<ChatMessage[]>(`/chat/conversations/${conversationId}/messages/`);
      setMessages(data);
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!conversationsQuery.data) {
      return;
    }

    if (selectedRoom === "general") {
      const nextConversation = conversationsQuery.data.find((conversation) => conversation.type === "general");
      setSelectedConversationId(nextConversation?.id ?? null);
      loadMessages(nextConversation?.id ?? null);
      return;
    }

    if (!targetUserId) {
      setSelectedConversationId(null);
      setMessages([]);
      return;
    }

    const nextConversation =
      conversationsQuery.data.find(
        (conversation) =>
          conversation.type === "direct" &&
          conversation.participants.some((person) => person.id === targetUserId) &&
          conversation.participants.some((person) => person.id === currentUserId)
      ) ?? null;

    setSelectedConversationId(nextConversation?.id ?? null);
    loadMessages(nextConversation?.id ?? null);
  }, [conversationsQuery.data, currentUserId, loadMessages, selectedRoom, targetUserId]);

  useEffect(() => {
    if (!token || !currentUserId) {
      return;
    }

    const isGeneralRoom = selectedRoom === "general";
    const hasDirectTarget = selectedRoom === "direct" && targetUserId !== null;

    if (!isGeneralRoom && !hasDirectTarget) {
      return;
    }

    if (socketRef.current) {
      socketRef.current.close();
    }

    const baseUrl = (import.meta.env.VITE_WS_BASE_URL || `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:8001`).replace(/\/$/, "");
    const wsUrl =
      selectedRoom === "general"
        ? `${baseUrl}/ws/chat/general/?token=${encodeURIComponent(token)}`
        : `${baseUrl}/ws/chat/direct/${targetUserId}/?token=${encodeURIComponent(token)}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    setSocketStatus("connecting");

    socket.onopen = () => {
      setSocketStatus("connected");

      if (selectedRoom === "general") {
        loadMessages(generalConversation?.id ?? null);
      } else if (targetUserId) {
        const nextConversation = directConversationMap.get(targetUserId);
        loadMessages(nextConversation?.id ?? null);
      }
    };

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as {
        message?: string;
        sender_id?: number;
        sender_email?: string;
        created_at?: string;
      };

      if (!payload.message || !payload.created_at) {
        return;
      }

      const newMessage: ChatMessage = {
        id: Date.now() + Math.random(),
        conversation: selectedConversationId ?? 0,
        sender: {
          id: payload.sender_id ?? 0,
          username: payload.sender_email ?? "Formateur",
          email: payload.sender_email ?? "",
        },
        content: payload.message,
        created_at: payload.created_at,
        is_read: true,
      };

      setMessages((previous) => {
        const alreadyPresent = previous.some(
          (message) =>
            message.content === payload.message &&
            message.created_at === payload.created_at &&
            message.sender.id === (payload.sender_id ?? 0)
        );

        if (alreadyPresent) {
          return previous;
        }

        return [...previous, newMessage];
      });
    };

    socket.onerror = () => {
      setSocketStatus("error");
    };

    socket.onclose = () => {
      setSocketStatus("closed");
    };

    return () => {
      socket.close();
    };
  }, [currentUserId, directConversationMap, generalConversation?.id, loadMessages, selectedRoom, targetUserId, token]);

  const roomList = useMemo<ChatRoomItem[]>(() => {
    const items: ChatRoomItem[] = [
      {
        id: generalConversation?.id ?? null,
        type: "general",
        label: "Général formateurs",
        subtitle: "Salle commune",
        active: selectedRoom === "general",
      },
    ];

    otherFormateurs.forEach((user) => {
      const directConversation = directConversationMap.get(user.id);

      items.push({
        id: directConversation?.id ?? null,
        type: "direct",
        label: user.username || user.email,
        subtitle: user.email,
        userId: user.id,
        active: selectedRoom === "direct" && targetUserId === user.id,
      });
    });

    return items;
  }, [directConversationMap, generalConversation?.id, otherFormateurs, selectedRoom, targetUserId]);

  const handleRoomSelect = (room: ChatRoomItem) => {
    if (room.type === "general") {
      setSelectedRoom("general");
      setTargetUserId(null);
      return;
    }

    setSelectedRoom("direct");
    setTargetUserId(room.userId ?? null);
  };

  const handleSend = () => {
    const message = draft.trim();

    if (!message || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    socketRef.current.send(JSON.stringify({ message }));

    setMessages((previous) => [
      ...previous,
      {
        id: Date.now() + 1,
        conversation: selectedConversationId ?? 0,
        sender: {
          id: currentUserId,
          username: currentUser?.username ?? "Moi",
          email: currentUser?.email ?? "",
        },
        content: message,
        created_at: new Date().toISOString(),
        is_read: true,
      },
    ]);

    setDraft("");
  };

  const activeRoomLabel =
    selectedRoom === "general"
      ? "Général formateurs"
      : (otherFormateurs.find((user) => user.id === targetUserId)?.username ?? "Conversation directe");

  if (formateursQuery.isPending || conversationsQuery.isPending) {
    return <Loading message="Chargement de la messagerie..." />;
  }

  if (formateursQuery.isError || conversationsQuery.isError) {
    return <FetchError />;
  }

  return (
    <Box className="h-[calc(100vh-110px)] w-full gap-4 p-4" direction="row">
      <Paper className="w-[320px] min-w-[260px] p-3" hasShadow>
        <CustomText textTag="h3" weight="bold" className="mb-4">
          Messagerie
        </CustomText>

        <Box direction="column" className="gap-2">
          {roomList.map((room) => (
            <button
              key={room.type === "general" ? "general-room" : `direct-${room.userId}`}
              onClick={() => handleRoomSelect(room)}
              className={`w-full rounded-xl border p-3 text-left transition-all ${
                room.active
                  ? "border-primary bg-primary-light"
                  : "border-transparent bg-background-light hover:border-primary"
              }`}
              type="button"
            >
              <CustomText weight="bold" className="block">
                {room.label}
              </CustomText>
              <CustomText color="disabled" textTag="span" className="block text-xs">
                {room.subtitle}
              </CustomText>
            </button>
          ))}
        </Box>
      </Paper>

      <Paper className="flex-1 p-0 overflow-hidden" hasShadow>
        <Box direction="column" className="h-full w-full">
          <Box className="w-full items-center justify-between border-b border-background p-4">
            <CustomText textTag="h3" weight="bold">
              {activeRoomLabel}
            </CustomText>
            <CustomText color="disabled" textTag="span" className="text-xs">
              {socketStatus === "connected" ? "Connecté" : socketStatus === "connecting" ? "Connexion..." : socketStatus === "error" ? "Erreur" : "Déconnecté"}
            </CustomText>
          </Box>

          <Box direction="column" className="flex-1 w-full gap-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <Paper className="w-full p-4 bg-background-light">
                <CustomText color="disabled" textTag="span">
                  Aucune conversation pour ce salon pour l’instant.
                </CustomText>
              </Paper>
            ) : (
              messages.map((message) => {
                const isMine = message.sender.id === currentUserId;

                return (
                  <Box
                    key={`${message.id}-${message.created_at}`}
                    className={`w-full ${isMine ? "justify-end" : "justify-start"}`}
                  >
                    <Paper
                      className={`max-w-[75%] p-3 ${isMine ? "bg-primary text-white" : "bg-background-light"}`}
                    >
                      {!isMine && (
                        <CustomText textTag="span" weight="bold" className="block mb-1 text-xs">
                          {message.sender.username || message.sender.email || "Formateur"}
                        </CustomText>
                      )}
                      <CustomText textTag="span" className="block break-words">
                        {message.content}
                      </CustomText>
                      <CustomText textTag="span" className="mt-2 block text-[10px] opacity-75">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CustomText>
                    </Paper>
                  </Box>
                );
              })
            )}
          </Box>

          <Box className="w-full items-center gap-2 border-t border-background p-4">
            <div className="flex-1">
              <Input
                id="chat-message"
                name="chat-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Écrire un message..."
                className="bg-background-light border-0"
              />
            </div>
            <ActionButton onClick={handleSend} disabled={socketStatus !== "connected" || draft.trim().length === 0} type="button">
              Envoyer
            </ActionButton>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatPage;
