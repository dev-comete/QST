// frontend/src/system/organisms/notification/NotificationBell.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import Box from "../../atoms/Container/Box";
import CustomText from "../../atoms/Text/CustomText";
import FAIcon from "../../atoms/Icon/FAIcon";
import IconButton from "../../molecules/Buttons/IconButton";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import { formatDate } from "../../../other/helper/helper";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
    const navigate = useNavigate();

    // Map notification types to application routes
    const handleNotificationClick = (notifId: number, typeNotif: string | null) => {
        markAsRead(notifId);
        setIsOpen(false);
        
        switch (typeNotif) {
            case 'password_reset':
                navigate('/admin/parametre_general?tab=4'); // Or wherever your User Management/Password Reset view is
                break;
            case 'quiz_submit':
                // navigate(`/formateur/vague/${vagueId}/bulletin`); -> Needs more context from backend, but placeholder ready
                break;
            default:
                // Default fallback route, or do nothing
                break;
        }
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
        <div className="relative" ref={dropdownRef}>
            <button 
                type="button" 
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FAIcon name="bell" className="text-slate-600 text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-lg border border-slate-100 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <Box className="justify-between items-center p-3 border-b border-background bg-slate-50">
                        <CustomText weight="bold">Notifications</CustomText>
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
                                    onClick={() => handleNotificationClick(notif.id, notif.type_notif)}
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
                            navigate('/admin/notifications'); // Dynamic based on role in reality, but this routes them to the full page.
                        }}
                    >
                        <CustomText className="text-sm font-medium text-primary">Voir toutes les notifications</CustomText>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;