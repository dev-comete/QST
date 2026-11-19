import Box from "../atoms/Container/Box";
import FAIcon from "../atoms/Icon/FAIcon";
import CustomText from "../atoms/Text/CustomText";
import IconButton from "./Buttons/IconButton";
import { formatDate } from "../../other/helper/helper";
import type { NotificationType } from "../../other/types/notificationType";

interface NotificationCardProps {
    notification: NotificationType;
    onOpen?: () => void;
    onMarkAsRead?: () => void;
}

const NotificationCard = ({ notification, onOpen, onMarkAsRead }: NotificationCardProps) => {
    const hasAction = Boolean(onOpen);
    const iconName = notification.type_notif?.startsWith("quiz_submit")
        || notification.type_notif === "quiz_submitted"
        ? "file-circle-check"
        : notification.type_notif === "password_reset"
            ? "key"
            : "bell";

    return (
        <article className={`flex items-start gap-3 p-4 sm:p-5 transition-colors ${notification.is_read ? "bg-white" : "bg-primary/5"}`}>
            <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${notification.is_read ? "bg-slate-100 text-slate-500" : "bg-primary/10 text-primary"}`}>
                <FAIcon name={iconName} />
            </div>

            <div className="min-w-0 flex-1">
                <Box className="items-start justify-between gap-3">
                    <div className="min-w-0">
                        <CustomText textTag="h3" weight={notification.is_read ? "normal" : "bold"} className="text-sm sm:text-base">
                            {notification.titre}
                        </CustomText>
                        <CustomText textTag="p" color="text-light" className="mt-1 text-sm">
                            {notification.message}
                        </CustomText>
                    </div>
                    {!notification.is_read && (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Non lue" />
                    )}
                </Box>

                <Box className="mt-3 flex-wrap items-center justify-between gap-2">
                    <CustomText textTag="caption" color="disabled" className="text-xs">
                        {formatDate(notification.created_at)}
                    </CustomText>
                    {hasAction && (
                        <button
                            type="button"
                            onClick={onOpen}
                            className="cursor-pointer shadow-sm inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                        >
                            Ouvrir
                            <FAIcon name="arrow-right" className="text-xs" />
                        </button>
                    )}
                </Box>
            </div>

            {!notification.is_read && onMarkAsRead && (
                <IconButton
                    iconName="check"
                    action={onMarkAsRead}
                    title="Marquer comme lue"
                    iconStyling="text-slate-500 hover:text-success"
                    className="mt-1 h-9 w-9 shrink-0 rounded-lg border border-slate-200 bg-white shadow-sm"
                />
            )}
        </article>
    );
};

export default NotificationCard;
