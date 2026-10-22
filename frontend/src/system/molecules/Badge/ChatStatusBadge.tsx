import React from "react";
import FAIcon from "../../atoms/Icon/FAIcon";

// 1. Define explicit icons or omit them if not used
const STATUS_LABEL: Record<string, { label: string, icon?: string | null, className?: string, badgeClassName?: string }> = {
    idle: { label: "Inactif", icon: null, className: "bg-disabled", badgeClassName: 'bg-disabled-light'},
    connecting: { label: "Connexion", icon: "spinner", className: "bg-disabled", badgeClassName: 'bg-disabled-light'},
    connected: { label: "Connecté", icon: null, className: "bg-success", badgeClassName: "bg-success-light" },
    reconnecting: { label: "Reconnexion", className: "bg-warning", badgeClassName: "bg-warning-light"},
    closed: { label: "Déconnecté", icon: "times", className: "bg-error", badgeClassName: "bg-error-light"},
} as const;

export type ChatStatus = keyof typeof STATUS_LABEL;

interface ChatStatusBadgeProps {
    status: ChatStatus;
}

const ChatStatusBadge: React.FC<ChatStatusBadgeProps> = ({ status }) => {
    // Fallback to 'idle' if an invalid status is passed
    const currentStatus = STATUS_LABEL[status] ?? STATUS_LABEL.idle;
    const { label, icon, className, badgeClassName } = currentStatus;

    return (
        <div className={`inline-flex items-center gap-2 text-sm font-medium ${badgeClassName} rounded-xl p-2`}>
            <span className={`w-2 h-2 rounded-full ${className}`} aria-hidden="true" />
            {icon && <FAIcon name={icon} />}
            <span className="text-[9px]">{label}</span>
        </div>
    );
};

export default ChatStatusBadge;