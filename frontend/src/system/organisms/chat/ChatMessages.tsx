import { useRef, type Dispatch, type SetStateAction } from "react";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";
import ActionButton from "../../molecules/Buttons/ActionButton";
import { useChatMessages } from "../../../other/hooks/chat/useChatMessages";
import type { SocketStatus } from "../../../other/hooks/chat/useChatSocket";
import ChatStatusBadge from "../../molecules/Badge/ChatStatusBadge";
import FAIcon from "../../atoms/Icon/FAIcon";
import TextArea from "../../atoms/Form/TextArea";
// import Loading from "../../atoms/Loading/Loading";

interface ChatConversationProps {
	conversationId: number | null
	activeRoomLabel: string
	socketStatus: SocketStatus
	roomPath : string | null
	reconnect : () => void
	notice: string | null
	setNotice: (value: string | null) => void
	targetUserId: number | null
	isVisible: boolean
	currentUserId: number
	currentUser: { id: number; username: string; email: string } | null
	draft: string
	setDraft: Dispatch<SetStateAction<string>>
	send: (payload: object) => boolean
}

export const ChatMessages = ({
	activeRoomLabel, socketStatus, roomPath,
	conversationId, currentUser, currentUserId, targetUserId,
	notice, setNotice, isVisible, send, draft, setDraft,
} : ChatConversationProps) => {
	const scrollRef = useRef<HTMLDivElement | null>(null);
	const canSend = socketStatus === "connected" && (conversationId !== null || targetUserId !== null);

	const {
		messagesQuery, messages, hasMore,
		handleSubmit, retryMessage, handleScroll,
		loadOlder, isLoadingOlder,
	} = useChatMessages({
		isVisible, currentUser, currentUserId, targetUserId, conversationId,
		canSend, send, notice, setNotice, draft, setDraft, scrollRef,
	});

	return (
		<Paper className="flex-1 overflow-hidden p-0" hasShadow>
			<Box direction="column" className="h-full w-full">
				<Box className="w-full items-center justify-between border-b border-background p-4">
					<CustomText textTag="h3" weight="bold">
						{activeRoomLabel}
					</CustomText>
					<ChatStatusBadge status={socketStatus}/>
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
				<form id="sendMessage" onSubmit={handleSubmit} className="w-full">
					<Box className="w-full items-center gap-2 border-t border-background p-5">
						<div className="flex-1">
							<TextArea
								id="chat-message"
								name="chat-message"
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
								placeholder="Écrire un message..."
								row={3}
							/>
						</div>
						<ActionButton type="submit" disabled={!canSend || draft.trim().length === 0} interiorIcon="paper-plane">
							Envoyer
						</ActionButton>
					</Box>
				</form>
			</Box>
		</Paper>
	)
}
