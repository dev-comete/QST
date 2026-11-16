// frontend/src/other/services/notificationService.ts
import type { NotificationType } from "../types/notificationType";
import apiClient from "./apiClient";
import { ENDPOINTS } from "./endpoint";

const NOTIF_URL = ENDPOINTS.NOTIFICATION;

export const NotificationService = {
    list: async () => {
        const response = await apiClient.get(NOTIF_URL.LIST);
        return response.data as NotificationType[];
    },
    markAsRead: async (id: number) => {
        const response = await apiClient.post(`${NOTIF_URL.MARK_AS_READ}`.replace('{id}', id.toString()));
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await apiClient.post(`${NOTIF_URL.MARK_ALL_AS_READ}`);
        return response.data;
    }
};