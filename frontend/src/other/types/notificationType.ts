// frontend/src/other/types/notificationType.ts
export interface NotificationType {
    id: number;
    titre: string;
    message: string;
    is_read: boolean;
    type_notif: string | null;
    created_at: string;
}