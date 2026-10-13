import { useRef } from "react";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import Input from "../../atoms/Form/Input";
import CustomText from "../../atoms/Text/CustomText";
import ActionButton from "../../molecules/Buttons/ActionButton";

const PAGE_SIZE = 50;
const EMPTY_MESSAGES: ChatMessage[] = [];
const CONVERSATIONS_KEY = ["chat-conversations"] as const;
const messagesKey = (conversationId: number | null) => ["chat-messages", conversationId] as const;

const STATUS_LABEL : Record<string, string> = {
	idle: "",
	connecting: "Connexion...",
	connected: "Connecté",
	reconnecting: "Reconnexion...",
	closed: "Déconnecté",
} as const;

interface ChatConversationProps {
	activeRoomLabel,
	socketStatus,
	roomPath,
	reconnect,
	messageQuery,
	notice,
	handleSubmit
}

export const ChatConversation = ({
	activeRoomLabel,
	socketStatus,
	roomPath,
	reconnect,
	messagesQuery,
	notice,
	handleSubmit,
} : ChatConversationProps) => {

	const scrollRef = useRef<HTMLDivElement | null>(null);
	const atBottomRef = useRef(true);
	const restoreScrollRef = useRef<number | null>(null);
	const tempIdRef = useRef(0);
	const lastReadRef = useRef(new Map<number, number>());

	const handleScroll = () => {
		const element = scrollRef.current;
		if (!element) return;
		atBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
	};

	return (
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
						{socketStatus === "closed" && roomPath && (
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

				{/* Chat Input */}
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
	)
}
