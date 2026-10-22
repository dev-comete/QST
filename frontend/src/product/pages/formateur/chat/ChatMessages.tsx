import { useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Box from "../../../../system/atoms/Container/Box";
import Paper from "../../../../system/atoms/Container/Paper";
import Input from "../../../../system/atoms/Form/Input";
import CustomText from "../../../../system/atoms/Text/CustomText";
import ActionButton from "../../../../system/molecules/Buttons/ActionButton";
import type { ChatMessage } from "../../../../other/types/chatType";
import type { SocketStatus } from "../../../../other/hooks/chat/useChatSocket";
import AvatarBadge from "../../../../system/molecules/Avatar/AvatarBadge";
import { formatDate } from "../../../../other/helper/helper";

// const STATUS_LABEL: Record<SocketStatus, string> = {
//   idle: "",
//   connecting: "Connexion...",
//   connected: "Connecté",
//   reconnecting: "Reconnexion...",
//   closed: "Déconnecté",
// };

interface ChatMessagesProps {
  title: string;
  messages: ChatMessage[];
  currentUserId: number;
  notice: string | null;
  canSend: boolean;
  socketStatus: SocketStatus;
  hasMore: boolean;
  isLoadingOlder: boolean;
  isFetching: boolean;
  isError: boolean;
  channelType?: boolean;
  /** Must call `beforeApply` right before the older messages are written to the cache. */
  onLoadOlder: (beforeApply: () => void) => Promise<void>;
  onRetryMessage: (message: ChatMessage) => void;
  onRetryFetch: () => void;
  onReconnect: () => void;
  /** Returns true only if the message was really sent (the draft is then cleared). */
  onSend: (text: string) => boolean;
}

const ChatMessages = ({
  title,
  messages,
  currentUserId,
  notice,
  canSend,
  socketStatus,
  hasMore,
  isLoadingOlder,
  isFetching,
  isError,
  onLoadOlder,
  onRetryMessage,
  onRetryFetch,
  onReconnect,
  onSend,
  channelType = true,
}: ChatMessagesProps) => {
  const [draft, setDraft] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const atBottomRef = useRef(true);
  const restoreScrollRef = useRef<number | null>(null);

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

  const handleLoadOlder = () => {
    void onLoadOlder(() => {
      // Called by the parent just before prepending: remember the height to keep the view in place.
      restoreScrollRef.current = scrollRef.current?.scrollHeight ?? 0;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (onSend(text)) {
      atBottomRef.current = true;
      setDraft("");
    }
  };

  return (
    <Paper className="flex-1 overflow-hidden p-0" hasShadow>
      <Box direction="column" className="h-full w-full">
        <Box className="w-full items-center justify-between border-b border-background p-4">
			<Box className="items-center">
		  		<AvatarBadge name={channelType ? title : '#'}/>
				<CustomText textTag="h3" weight="bold">
				{title}
				</CustomText>
			</Box>
          <span className="flex items-center gap-2">
            {/* <CustomText color="disabled" textTag="span" className="text-xs">
              {STATUS_LABEL[socketStatus]}
            </CustomText> */}
            {socketStatus === "closed" && (
              <button type="button" onClick={onReconnect} className="text-xs underline">
                Réessayer
              </button>
            )}
          </span>
        </Box>

        {(socketStatus === "reconnecting" || socketStatus === "closed") && (
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
              onClick={handleLoadOlder}
              disabled={isLoadingOlder}
              className="self-center text-xs underline disabled:opacity-50"
            >
              {isLoadingOlder ? "Chargement..." : "Charger les messages précédents"}
            </button>
          )}

          {isError && (
            <Paper className="w-full bg-background-light p-4">
              <CustomText color="disabled" textTag="span">
                Impossible de charger les messages.{" "}
                <button type="button" className="underline" onClick={onRetryFetch}>
                  Réessayer
                </button>
              </CustomText>
            </Paper>
          )}

          {!isError && messages.length === 0 ? (
            <Paper className="w-full bg-background-light p-4">
              <CustomText color="disabled" textTag="span">
                {isFetching ? "Chargement..." : "Aucun message pour l’instant."}
              </CustomText>
            </Paper>
          ) : (
            <Box direction="column" className="w-full gap-5">
              {messages.map((message) => {
                const isMine = message.sender.id === currentUserId;
                return (
					<div
						key={message.client_id ?? `srv-${message.id}`}
						className={`flex flex-col gap-1 max-w-[75%] ${isMine ? "self-end" : "self-start"}`}
						
					>
					  {!isMine && (
						<CustomText textTag="span" weight="bold" className="mb-1 block text-xs">
						  {message.sender.username || message.sender.email || "Formateur"}
						</CustomText>
					  )}
                    <Paper
                      color={isMine === true ? "background" : "primary-light"}
                      className={` p-3 ${
                        message.status === "sending" ? "opacity-70" : ""
                      }`}
                    >
                      <CustomText textTag="span" color={isMine ? 'text' : 'white'} className="block whitespace-pre-wrap break-words">
                        {message.content}
                      </CustomText>
                      <span className="mt-2 flex items-center gap-2 text-[10px] opacity-75">
                        {message.status === "sending" && <span>Envoi…</span>}
                        {message.status === "failed" && (
                          <button type="button" className="underline" onClick={() => onRetryMessage(message)}>
                            Échec · Réessayer
                          </button>
                        )}
                      </span>
                    </Paper>
                    <span className={`italic text-[9px] ${isMine ? "self-start" : "self-end"}`}>
						{formatDate(message.created_at)}
                    </span>
                  </div>
                );
              })}
            </Box>
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
  );
};

export default ChatMessages;
