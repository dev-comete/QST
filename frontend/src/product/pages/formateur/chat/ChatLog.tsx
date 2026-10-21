import Paper from "../../../../system/atoms/Container/Paper";
import Box from "../../../../system/atoms/Container/Box";
import CustomText from "../../../../system/atoms/Text/CustomText";

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
}

const ChatLog = ({ rooms, onSelectRoom }: ChatLogProps) => {
  return (
    <Paper className="w-[320px] min-w-[260px] overflow-y-auto p-3" hasShadow>
      <CustomText textTag="h3" weight="bold" className="mb-4">
        Messagerie
      </CustomText>

      <Box direction="column" className="gap-2">
        {rooms.map((room) => {
          const unread = room.active ? 0 : room.unread;
          return (
            <button
              key={room.key}
              onClick={() => onSelectRoom({ type: room.type, userId: room.userId })}
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
  );
};

export default ChatLog;
