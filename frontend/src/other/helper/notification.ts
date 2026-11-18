import type { Role } from "../types/common";
import type { NotificationType } from "../types/notificationType";

export const getNotificationPath = (notification: NotificationType, role: Role): string | null => {
    if (notification.type_notif === "password_reset") {
        return role === "admin" ? "/admin/parametre_general?tab=4" : null;
    }

    if (notification.type_notif !== "quiz_submitted" && notification.type_notif !== "quiz_submit") {
        return null;
    }

    const { quiz_id, vague_id, student_id } = notification.data ?? {};
    if (!quiz_id || !vague_id || !student_id) return null;

    const params = new URLSearchParams({
        vague_id: String(vague_id),
        student_id: String(student_id),
    });
    return `/quiz/${quiz_id}/revue?${params.toString()}`;
};
