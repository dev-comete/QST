import FAIcon from "../../atoms/Icon/FAIcon";

const STATUS_LABEL = {
	idle: { status: "idle", icon: "", className: "" },
	connecting: { status: "connexion", icon: "", className: "" },
	connected: { status: "connecté", icon: "", className: "" },
	reconnecting: { status: "reconnexion", icon: "", className: "" },
	closed: { status: "déconnecté", icon: "", className: "" },
} as const;

type ChatStatus = keyof typeof STATUS_LABEL;

interface ChatStatusBadgeProps {
	status: ChatStatus;
}

const ChatStatusBadge = ({ status }: ChatStatusBadgeProps) => {
	const { icon, className, status: label } = STATUS_LABEL[status];

	return (
		<div>
			<FAIcon name={icon} />
			<span className={className}>{label}</span>
		</div>
	);
};

export default ChatStatusBadge;