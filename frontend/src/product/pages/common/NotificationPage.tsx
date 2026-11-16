// frontend/src/product/pages/common/NotificationPage.tsx
import { useNavigate } from "react-router";
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import CustomText from "../../../system/atoms/Text/CustomText";
import IconButton from "../../../system/molecules/Buttons/IconButton";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import { formatDate } from "../../../other/helper/helper";
import BodyLayout from "../../layout/common/BodyLayout";
import Loading from "../../../system/atoms/Loading/Loading";

const NotificationPage = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotification();
    const navigate = useNavigate();

    if (isLoading) return <Loading />;

    const handleNotificationClick = (notifId: number, typeNotif: string | null) => {
        markAsRead(notifId);
        
        switch (typeNotif) {
            case 'password_reset':
                navigate('/admin/parametre_general?tab=4'); // Redirige vers la gestion des utilisateurs/mots de passe
                break;
            case 'quiz_submit':
                // Exemple futur : navigate(`/formateur/vague/${vagueId}/bulletin`);
                break;
            default:
                // Aucune redirection spécifique par défaut
                break;
        }
    };

    return (
        <BodyLayout
            title="Notifications"
            titleButton={
                unreadCount > 0 ? (
                    <ActionButton 
                        btnColor="white" 
                        textColor="primary" 
                        onClick={() => markAllAsRead()}
                    >
                        Tout marquer comme lu
                    </ActionButton>
                ) : undefined
            }
        >
            <Paper className="w-full max-w-4xl mx-auto p-0 overflow-hidden" hasShadow>
                {notifications.length === 0 ? (
                    <Box className="p-8 justify-center items-center flex-col gap-3">
                        <CustomText textTag="h3" color="disabled">Aucune notification.</CustomText>
                        <CustomText textTag="p" color="disabled-dark">Vous êtes à jour !</CustomText>
                    </Box>
                ) : (
                    <div className="flex flex-col divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <Box 
                                key={notif.id} 
                                onClick={() => handleNotificationClick(notif.id, notif.type_notif)}
                                className={`p-5 transition-colors flex-col gap-2 cursor-pointer hover:bg-slate-50 ${notif.is_read ? 'bg-white opacity-80' : 'bg-primary/5'}`}
                            >
                                <Box className="justify-between items-start w-full">
                                    <Box className="items-center gap-2">
                                        {!notif.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                                        <CustomText textTag="h4" weight={notif.is_read ? "normal" : "bold"}>
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
                                                    e.stopPropagation(); // Bloque le onClick parent pour éviter la redirection
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
                        ))}
                    </div>
                )}
            </Paper>
        </BodyLayout>
    );
};

export default NotificationPage;