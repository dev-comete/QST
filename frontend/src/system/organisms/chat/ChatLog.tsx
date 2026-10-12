import type { Rooms } from "../../../other/types/chatType";
import Box from "../../atoms/Container/Box";
import Paper from "../../atoms/Container/Paper";
import CustomText from "../../atoms/Text/CustomText";

interface ChatLogProps {
	roomList : Rooms[],
	handleRoomSelect: (room: { type: "general" | "direct"; userId?: number }) => void
}

const ChatLog = ({ roomList, handleRoomSelect } : ChatLogProps) => {
	return (
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
	)
}

export default ChatLog;