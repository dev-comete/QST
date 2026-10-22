import type { Rooms } from "../../../other/types/chatType";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";

interface ChatLogItemProps {
	room : Rooms,
	handleRoomSelect: (room: { type: "general" | "direct"; userId?: number }) => void
}

const ChatLogItem = ({ room, handleRoomSelect } : ChatLogItemProps) => {

	const unread = room.active ? 0 : room.unread;

	return (
		<button
			key={room.key}
			onClick={() => handleRoomSelect(room)}
			className={`w-full rounded-xl p-3 text-left transition-all ${
				room.active ? "bg-primary-light" : "bg-background-light hover:border-primary"
			}`}
			type="button"
		>
		<span className="flex items-center justify-between gap-2">
			<CustomText weight="bold" className="block truncate" color={room.active ? 'white' : 'text'}>
			{room.label}
			</CustomText>
			{unread > 0 && (
			<span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
				{unread > 99 ? "99+" : unread}
			</span>
			)}
		</span>
		<CustomText textTag="span" className="block truncate text-xs" color={room.active ? 'white' : 'text'}>
			{room.subtitle}
		</CustomText>
		</button>
	)
}

interface ChatLogProps {
	roomList : Rooms[],
	handleRoomSelect: (room: { type: "general" | "direct"; userId?: number }) => void
}

const ChatLog = ({ roomList, handleRoomSelect } : ChatLogProps) => {

	const channel = roomList.filter((r) => r.type == 'general')
	const direct = roomList.filter((r) => r.type == 'direct')

	return (
		<Paper className="w-[320px] min-w-[260px] overflow-y-auto p-3" hasShadow>
			<CustomText textTag="h3" weight="bold" className="mb-4">
				Messagerie
			</CustomText>

			<Box direction="column" className="gap-5">
				<Box direction="column" className="gap-2">
					<CustomText textTag="h3" weight="bold" color="disabled" className="border-b border-background">Canaux</CustomText>
					{channel.map((room) => <ChatLogItem key={'chat-channel' + room.userId} room={room} handleRoomSelect={handleRoomSelect}/>)}
				</Box>
				<Box direction="column" className="gap-2">
					<CustomText textTag="h3" weight="bold" color="disabled" className="border-b border-background">Discussions</CustomText>
					{direct.map((room) => <ChatLogItem key={'chat-direct' + room.userId} room={room} handleRoomSelect={handleRoomSelect}/>)}
				</Box>
			</Box>
		</Paper>
	)
}

export default ChatLog;