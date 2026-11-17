import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import IconButton from "../../molecules/Buttons/IconButton";
import { formatDate } from "../../../other/helper/helper";
import type { NotificationType } from "../../../other/types/notificationType";

interface NotifItemProps {
	notif: NotificationType;
	markAsRead: (id: number) => void;
	closeModal: () => void;
	handleNotificationClick: (notifId: number, typeNotif: string | null, closeModal?: () => void) => void;
}

export const NotifItem = ({ notif, markAsRead, closeModal, handleNotificationClick } : NotifItemProps) => {
	return (
		<div 
			className={`p-3 border-b border-slate-50 transition-colors flex flex-col gap-1 cursor-pointer hover:bg-slate-50 ${notif.is_read ? 'opacity-70 bg-white' : 'bg-primary/5'}`}
			onClick={() => handleNotificationClick(notif.id, notif.type_notif, closeModal)}
		>
			<Box className="justify-between items-start w-full">
				<CustomText textTag="h6" weight={notif.is_read ? "normal" : "bold"} className="text-sm">
					{notif.titre}
				</CustomText>
				{!notif.is_read && (
					<IconButton 
						iconName="check" 
						action={(e) => {
							e.stopPropagation(); 
							markAsRead(notif.id);
						}} 
						title="Marquer comme lu"
						iconStyling="text-primary hover:text-success text-xs"
						className="p-1"
					/>
				)}
			</Box>
			<CustomText textTag="p" className="text-xs text-slate-600 line-clamp-2">
				{notif.message}
			</CustomText>
			<CustomText textTag="caption" className="text-[10px] text-slate-400 mt-1">
				{formatDate(notif.created_at)}
			</CustomText>
		</div>
	)
};

interface NotifCardProps {
	notif: NotificationType;
	markAsRead: (id: number) => void;
	handleNotificationClick: (notifId: number, typeNotif: string | null, closeModal?: () => void) => void;
}

export const NotifCard = ({ notif, markAsRead, handleNotificationClick }: NotifCardProps) => {
	return (
		<Box
			direction="column"
			onClick={() => handleNotificationClick(notif.id, notif.type_notif)}
			className={`p-5 transition-colors flex-col gap-2 cursor-pointer hover:bg-slate-50 ${notif.is_read ? 'bg-white opacity-80' : 'bg-primary/5'}`}
		>
			<Box className="justify-between items-start w-full">
				<Box className="items-center gap-2">
					{!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
					<CustomText textTag="h4" color={notif.is_read ? "text" : "primary"} weight={"bold"}>
						{notif.titre}
					</CustomText>
				</Box>
				
				<Box className="items-center gap-3">
					<CustomText textTag="caption" className="text-slate-400">
						{formatDate(notif.created_at)}
					</CustomText>
					{!notif.is_read && (
						<IconButton 
							iconName="check" 
							action={(e) => {
								e.stopPropagation();
								markAsRead(notif.id);
							}} 
							title="Marquer comme lu"
							iconStyling="text-primary hover:text-success text-sm"
							className="bg-white border border-slate-200 shadow-sm p-1.5"
						/>
					)}
				</Box>
			</Box>
			<CustomText textTag="p" className={`text-slate-600 ${notif.is_read ? '' : 'pl-4'}`}>
				{notif.message}
			</CustomText>
		</Box>
	)
};

