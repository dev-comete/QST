import React from 'react';
import type { StatItem } from '../../../other/types/analyticsType';
import Box from '../../atoms/Container/Box';
import Paper from '../../atoms/Container/Paper';
import CustomText from '../../atoms/Text/CustomText';

interface StatCardProps {
    stat: StatItem;
    onClick?: () => void;
}

const toneClasses: Record<StatItem['tone'], string> = {
    primary: 'border-primary',
    success: 'border-success',
    warning: 'border-warning',
    error: 'border-error',
    secondary: 'border-secondary',
};

const textColors: Record<StatItem['tone'], 'primary' | 'success' | 'warning' | 'error' | 'secondary'> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    error: 'error',
    secondary: 'secondary',
};

const StatCard: React.FC<StatCardProps> = ({ stat, onClick }) => {
    const clickable = Boolean(onClick);


    return (
        <div
            className={`flex-1 min-w-[210px] ${clickable ? 'cursor-pointer' : ''}`}
            onClick={onClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={(event) => {
                if (onClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            <Paper className={`h-full border-2 border-solid ${toneClasses[stat.tone]} p-5 transition-all duration-200 ${stat.link ? 'hover:shadow-md' : ''}`}>
                <Box direction="column" className="h-full justify-between gap-2">
                    <CustomText textTag="h6" color="disabled" className="uppercase tracking-wide">
                        {stat.label}
                    </CustomText>
                    <CustomText textTag="h3" weight="bold" color={textColors[stat.tone]}>
                        {stat.value}
                    </CustomText>
                    <CustomText textTag="h6" color={textColors[stat.tone]}>
                        {stat.change}
                    </CustomText>
                </Box>
            </Paper>
        </div>
    );
};

export default StatCard;