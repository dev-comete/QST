// frontend/src/system/organisms/notification/NotificationBell.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import FAIcon from "../../atoms/Icon/FAIcon";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import { NotifItem } from "./NotificationCard";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, handleNotificationClick } = useNotification();
    const navigate = useNavigate();

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
                                <NotifItem
                                    key={notif.id}
                                    notif={notif}
                                    markAsRead={markAsRead}
                                    closeModal={() => setIsOpen(false)}
                                    handleNotificationClick={handleNotificationClick}
                                />
                            ))
                        )}
                    </div>
                    {/* View all link */}
                    <div 
                        className="p-3 bg-slate-50 border-t border-slate-100 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                        onClick={() => {
                            setIsOpen(false);
                            navigate('/admin/notifications'); // Dynamic based on role in reality, but this routes them to the full page.
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