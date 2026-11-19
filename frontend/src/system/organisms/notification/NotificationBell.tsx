// frontend/src/system/organisms/notification/NotificationBell.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import FAIcon from "../../atoms/Icon/FAIcon";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import { NotifItem } from "./NotificationCard";
import { useAuth } from "../../../other/hooks/auth/useAuth";
import { getNotificationPath } from "../../../other/helper/notification";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, handleNotificationClick } = useNotification();
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const getBasePath = () => {
        if (authUser?.role === 'admin') return '/admin';
        if (authUser?.role === 'formateur') return '/formateur';
        return '/my_eval';
    };

    const handleNotificationClick = (notification: (typeof notifications)[number]) => {
        if (!notification.is_read) markAsRead(notification.id);
        setIsOpen(false);

        if (!authUser) return;
        const path = getNotificationPath(notification, authUser.role);
        if (path) navigate(path);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative z-50 bg-white rounded-full shadow-md translate-y-[1px]" ref={dropdownRef}>
            <button 
                type="button" 
                className="relative z-50 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer translate-y-[1px]"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FAIcon name="bell" className={` text-xl ${isOpen ? 'text-primary' : 'text-slate-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <Box className="justify-between items-center p-3 border-b border-background bg-primary">
                        <CustomText weight="bold" color="white">Notifications</CustomText>
                        {unreadCount > 0 && (
                            <button 
                                onClick={(e) => { e.preventDefault(); markAllAsRead(); }}
                                className="text-xs text-primary hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </Box>

                    <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <Box className="p-5 justify-center">
                                <CustomText textTag="h6" isItalic color="disabled">Aucune notification.</CustomText>
                            </Box>
                        ) : (
                            notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    className={`p-3 border-b border-slate-50 transition-colors flex flex-col gap-1 cursor-pointer hover:bg-slate-50 ${notif.is_read ? 'opacity-70 bg-white' : 'bg-primary/5'}`}
                                    onClick={() => handleNotificationClick(notif)}
                                >
                                    <Box className="justify-between items-start w-full">
                                        <CustomText textTag="h6" weight={notif.is_read ? "normal" : "bold"} className="text-sm">
                                            {notif.titre}
                                        </CustomText>
                                        {!notif.is_read && (
                                            <IconButton 
                                                iconName="check" 
                                                action={(e) => {
                                                    // Prevent the parent div onClick from firing when clicking the checkmark
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
                            ))
                        )}
                    </div>
                    {/* View all link */}
                    <div 
                        className="p-3 bg-slate-50 border-t border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => {
                            setIsOpen(false);
                            const basePath = getBasePath();
                            navigate(`${basePath}/notifications`); 
                        }}
                    >
                        <CustomText color="primary" className="text-sm font-medium">Voir toutes les notifications</CustomText>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;