// frontend/src/other/hooks/notification/useNotification.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationService } from "../../services/notificationService";
import type { NotificationType } from "../../types/notificationType";

export const useNotification = () => {
    const queryClient = useQueryClient();

    const notificationsQuery = useQuery({
        queryKey: ['notifications_list'],
        queryFn: NotificationService.list,
        refetchInterval: 5000, 
    });

    const markAsRead = useMutation({
        mutationFn: NotificationService.markAsRead,
        onMutate: async (id) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['notifications_list'] });

            // Snapshot the previous value
            const previousNotifications = queryClient.getQueryData<NotificationType[]>(['notifications_list']);

            // Optimistically update to the new value
            if (previousNotifications) {
                queryClient.setQueryData<NotificationType[]>(['notifications_list'], old => {
                    if (!old) return old;
                    return old.map(notif => 
                        notif.id === id ? { ...notif, is_read: true } : notif
                    );
                });
            }

            // Return a context with the previous notifications
            return { previousNotifications };
        },
        // If the mutation fails, use the context returned from onMutate to roll back
        onError: (err, newTodo, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(['notifications_list'], context.previousNotifications);
            }
        },
        // Always refetch after error or success to ensure data is correct
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications_list'] });
        },
    });

    const markAllAsRead = useMutation({
        mutationFn: NotificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications_list'] });
        }
    });

    const notifications = notificationsQuery.data ?? [];
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
        notifications,
        unreadCount,
        isLoading: notificationsQuery.isPending,
        markAsRead: (id: number) => markAsRead.mutate(id),
        markAllAsRead: () => markAllAsRead.mutate(),
        isMarkingRead: markAsRead.isPending || markAllAsRead.isPending
    };
};