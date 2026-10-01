import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { StatItem } from '../../../other/types/analyticsType';
import Box from '../../atoms/Container/Box';
import Paper from '../../atoms/Container/Paper';
import CustomText from '../../atoms/Text/CustomText';

interface StatCardProps {
    stat: StatItem;
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

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (stat.link) {
            navigate(stat.link);
        }
    };

    return (
        <div
            className={`flex-1 min-w-[210px] ${stat.link ? 'cursor-pointer' : ''}`}
            onClick={handleClick}
            role={stat.link ? 'button' : undefined}
            tabIndex={stat.link ? 0 : undefined}
            onKeyDown={(event) => {
                if (stat.link && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    navigate(stat.link);
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