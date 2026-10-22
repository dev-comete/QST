type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarBadgeProps {
	name?: string;
	size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
	sm: 'w-8 h-8 text-xs',
	md: 'w-10 h-10 text-base',
	lg: 'w-12 h-12 text-lg',
	xl: 'w-16 h-16 text-2xl',
};

const AvatarBadge = ({ name = '#', size = 'md' }: AvatarBadgeProps) => {
	return (
		<div
			className={`${sizeClasses[size]} rounded-full bg-secondary text-primary flex items-center justify-center flex-shrink-0 font-bold shadow-sm leading-none`}
		>
			{name.charAt(0).toUpperCase()}
		</div>
	);
};

export default AvatarBadge;