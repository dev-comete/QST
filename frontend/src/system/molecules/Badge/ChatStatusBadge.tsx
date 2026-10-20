import React from "react";
import FAIcon from "../../atoms/Icon/FAIcon";

// 1. Define explicit icons or omit them if not used
const STATUS_LABEL: Record<string, { label: string, icon?: string | null, className?: string }> = {
    idle: { label: "Inactif", icon: null, className: "bg-disabled" },
    connecting: { label: "Connexion", icon: "spinner", className: "bg-disabled" },
    connected: { label: "Connecté", icon: null, className: "bg-success" },
    reconnecting: { label: "Reconnexion", className: "bg-warning" },
    closed: { label: "Déconnecté", icon: "times", className: "bg-error" },
} as const;

export type ChatStatus = keyof typeof STATUS_LABEL;

interface ChatStatusBadgeProps {
    status: ChatStatus;
}

const ChatStatusBadge: React.FC<ChatStatusBadgeProps> = ({ status }) => {
    // Fallback to 'idle' if an invalid status is passed
    const currentStatus = STATUS_LABEL[status] ?? STATUS_LABEL.idle;
    const { label, icon, className } = currentStatus;

    return (
        <div className="inline-flex items-center gap-2 text-sm font-medium">
            <span className={`w-2 h-2 rounded-full ${className}`} aria-hidden="true" />
            {icon && <FAIcon name={icon} />}
            <span>{label}</span>
        </div>
    );
};

export default ChatStatusBadge;