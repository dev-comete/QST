import { useState } from "react";
import { useNavigate } from "react-router";
import Box from "../../../system/atoms/Container/Box";
import FAIcon from "../../../system/atoms/Icon/FAIcon";
import Paper from "../../../system/atoms/Container/Paper";
import CustomText from "../../../system/atoms/Text/CustomText";
import ActionButton from "../../../system/molecules/Buttons/ActionButton";
import NotificationCard from "../../../system/molecules/NotificationCard";
import { useNotification } from "../../../other/hooks/notification/useNotification";
import { getNotificationPath } from "../../../other/helper/notification";
import { useAuth } from "../../../other/hooks/auth/useAuth";
import BodyLayout from "../../layout/common/BodyLayout";
import Loading from "../../../system/atoms/Loading/Loading";
import { NotifCard } from "../../../system/organisms/notification/NotificationCard";
import type { NotificationType } from "../../../other/types/notificationType";

type NotificationFilter = "all" | "unread";

const NotificationPage = () => {
    const {
       
		notifications,
        unreadCount,
        markAsRead,
       
		markAllAsRead,
        isLoading,
        isMarkingRead,
   , handleNotificationClick 
	} = useNotification();
    const { authUser } = useAuth();
    const [filter, setFilter] = useState<NotificationFilter>("all");

    if (isLoading) return <Loading />;

    const filteredNotifications = filter === "unread"
        ? notifications.filter((notification) => !notification.is_read)
        : notifications;

    const openNotification = (notification: NotificationType) => {
        if (!authUser) return;
        if (!notification.is_read) markAsRead(notification.id);

        const path = getNotificationPath(notification, authUser.role);
        if (path) navigate(path);
    };

    return (
        <BodyLayout
            title="Centre de notifications"
            subtitle="Retrouvez ici les dernières activités et informations importantes."
            titleButton={
                unreadCount > 0 ? (
                    <ActionButton
                        btnColor="white"
                        textColor="primary"
                        onClick={markAllAsRead}
                        disabled={isMarkingRead}
                        isLoading={isMarkingRead}
                        interiorIcon="check-double"
                    >
                        Tout marquer comme lu
                    </ActionButton>
                ) : undefined
            }
        >
            <Box direction="column" className="w-full max-w-4xl gap-5 pb-6">
                <Paper hasShadow className="w-full border border-slate-100 p-4 sm:p-5">
                    <Box className="flex-wrap items-center justify-between gap-4">
                        <Box className="items-center gap-4">
                            <div className="min-w-0 space-y-1">
                                <CustomText textTag="p" weight="bold" className="leading-tight">
                                    Votre activité
                                </CustomText>
                                <CustomText textTag="p" color="text-light" className="text-sm leading-relaxed">
                                    {unreadCount === 0
                                        ? "Vous êtes à jour."
                                        : `${unreadCount} notification${unreadCount > 1 ? "s" : ""} à consulter`}
                                </CustomText>
                            </div>
                        </Box>

                        <div className="inline-flex rounded-xl bg-slate-100 p-1" aria-label="Filtrer les notifications">
                            {(["all", "unread"] as const).map((filterOption) => {
                                const isActive = filter === filterOption;
                                const label = filterOption === "all" ? "Toutes" : "Non lues";
                                return (
                                    <button
                                        key={filterOption}
                                        type="button"
                                        onClick={() => setFilter(filterOption)}
                                        aria-pressed={isActive}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${isActive ? "bg-white text-primary shadow-sm" : "text-slate-600 hover:text-slate-900"}`}
                                    >
                                        {label}
                                        <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${isActive ? "bg-primary/10 text-primary" : "bg-white/80 text-slate-500"}`}>
                                            {filterOption === "all" ? notifications.length : unreadCount}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </Box>
                </Paper>

                <Paper hasShadow className="w-full overflow-hidden border border-slate-100">
                    {filteredNotifications.length === 0 ? (
                        <Box direction="column" className="items-center justify-center gap-3 px-6 py-14 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                <FAIcon name="check-double" className="text-xl" />
                            </div>
                            <CustomText textTag="h3" weight="bold">
                                {filter === "unread" ? "Tout est lu" : "Aucune notification"}
                            </CustomText>
                            <CustomText color="text-light" className="max-w-sm text-sm">
                                {filter === "unread"
                                    ? "Vous n’avez aucune notification en attente. Revenez ici pour suivre les prochaines activités."
                                    : "Vous êtes à jour. Les nouvelles activités apparaîtront ici."}
                            </CustomText>
                        </Box>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredNotifications.map((notification) => {
                                const canOpen = authUser
                                    ? Boolean(getNotificationPath(notification, authUser.role))
                                    : false;
                                return (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onOpen={canOpen ? () => openNotification(notification) : undefined}
                                        onMarkAsRead={
                                            !notification.is_read && !isMarkingRead
                                                ? () => markAsRead(notification.id)
                                                : undefined
                                        }
                                    />
                                );
                            })}
                        </div>
                    )}
                </Paper>
            </Box>
        </BodyLayout>
    );
};

export default NotificationPage;
