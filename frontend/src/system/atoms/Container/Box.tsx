import type React from "react";

// On étend les attributs HTML standards d'une balise <div>
interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    direction?: 'column' | 'row';
    flexDirection?: string;
    className?: string;
    style?: React.CSSProperties;
}

const Box = ({
    children,
    direction = 'row',
    flexDirection,
    className = "",
    style,
    ...rest // Capture toutes les autres props passées (comme onClick)
}: BoxProps) => {

    const dirClass = flexDirection ?? (direction === 'row' ? 'flex-row' : 'flex-col');

    return (
        <div
            className={`flex gap-2 ${dirClass} ${className}`}
            style={style}
            {...rest} // Applique ces props (ex: onClick) sur le div
        >
            {children}
        </div>
    );
};

export default Box;