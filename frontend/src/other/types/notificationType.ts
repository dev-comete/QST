// frontend/src/other/types/notificationType.ts
export interface NotificationType {
    id: number;
    titre: string;
    message: string;
    is_read: boolean;
    type_notif: string | null;
    data: {
        quiz_id?: number | string;
        vague_id?: number | string;
        student_id?: number | string;
    } | null;
    created_at: string;
}