import Paper from "../../../../system/atoms/Container/Paper";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";
import AvatarBadge from "../../../../system/molecules/Avatar/AvatarBadge";
import FAIcon from "../../../../system/atoms/Icon/FAIcon";
import ChatStatusBadge from "../../../../system/molecules/Badge/ChatStatusBadge";
import type { SocketStatus } from "../../../../other/hooks/chat/useChatSocket";

interface ChatLogItemProps {
	room : ChatRoomItem,
	type?: 'default' | 'custom'
	handleRoomSelect: (room: { type: "general" | "direct"; userId?: number }) => void
}

const ChatLogItem = ({ room, handleRoomSelect, type = 'custom' } : ChatLogItemProps) => {

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
		<span className="flex items-center gap-2">
			<AvatarBadge name={type == 'custom' ? room.label : '#'} size="sm"/>
			<span>
				<CustomText weight="bold" className="block truncate" color={room.active ? 'white' : 'text'}>
					{room.label}
				</CustomText>
				{unread > 0 && (
				<span className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
					{unread > 99 ? "99+" : unread}
				</span>
				)}
				<CustomText textTag="span" className="block truncate text-xs" color={room.active ? 'white' : 'text'}>
					{room.subtitle}
				</CustomText>
			</span>
		</span>
		</button>
	)
}

export interface ChatRoomItem {
	key: string;
	type: "general" | "direct";
	label: string;
	subtitle: string;
	unread: number;
	active: boolean;
	userId?: number;
	lastAt?: string | null;
}

export interface RoomSelection {
	type: "general" | "direct";
	userId?: number;
}

interface ChatLogProps {
	rooms: ChatRoomItem[];
	onSelectRoom: (room: RoomSelection) => void;
	socketStatus: SocketStatus
}

const ChatLog = ({ rooms, onSelectRoom, socketStatus }: ChatLogProps) => {
	const channel = rooms.filter((r) => r.type == 'general')
	const direct = rooms.filter((r) => r.type == 'direct')

	return (
		<Paper className="w-[320px] min-w-[260px] overflow-y-auto p-5" hasShadow>
			<Box className="items-center justify-between gap-2 pb-5 mb-5 border-b border-background">
				<Box>
					<FAIcon name="comments" className="bg-background text-primary p-2 rounded-xl"/>
					<CustomText textTag="h1" weight="bold">
						Messagerie
					</CustomText>
				</Box>
				<ChatStatusBadge status={socketStatus}/>
			</Box>

			<Box direction="column" className="gap-5">
				<Box direction="column" className="gap-2">
					<CustomText textTag="h3" weight="bold" color="disabled" className="border-b border-background">Canaux</CustomText>
					{channel.map((room) => <ChatLogItem type="default" key={'chat-channel' + room.userId} room={room} handleRoomSelect={onSelectRoom}/>)}
				</Box>
				<Box direction="column" className="gap-2">
					<CustomText textTag="h3" weight="bold" color="disabled" className="border-b border-background">Discussions</CustomText>
					{direct.map((room) => <ChatLogItem key={'chat-direct' + room.userId} room={room} handleRoomSelect={onSelectRoom}/>)}
				</Box>
			</Box>
		</Paper>
	)
};

export default ChatLog;
