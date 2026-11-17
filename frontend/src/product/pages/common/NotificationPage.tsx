// frontend/src/product/pages/common/NotificationPage.tsx
import Box from "../../../system/atoms/Container/Box";
import Paper from "../../../system/atoms/Container/Paper";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import BodyLayout from "../../layout/common/BodyLayout";
import Loading from "../../../system/atoms/Loading/Loading";
import { NotifCard } from "../../../system/organisms/notification/NotificationCard";

const NotificationPage = () => {
    const {
		notifications, unreadCount, markAsRead,
		markAllAsRead, isLoading, handleNotificationClick 
	} = useNotification();

    if (isLoading) return <Loading />;

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
                        {notifications.map((notif) =>
                            <NotifCard
								notif={notif}
								markAsRead={markAsRead}
								handleNotificationClick={handleNotificationClick}
							/>)}
					</div>
					)}
            </Paper>
        </BodyLayout>
    );
};

export default NotificationPage;