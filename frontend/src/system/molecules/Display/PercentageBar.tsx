import React from 'react';

interface PercentageBarProps {
    score: number;
    height?: number;
    points?: string;
    showPercentage?: boolean;
}

export const PercentageBar: React.FC<PercentageBarProps> = ({
    score,
    height = 8,
    points,
    showPercentage = true,
}) => {
    const normalizedScore = Math.min(100, Math.max(0, score));

    // Color mapping consistent with your design
    const getColorClass = (val: number) => {
        if (val >= 80) return 'bg-success text-success';
        if (val >= 50) return 'bg-error text-error';
        return 'bg-rose-500 text-rose-500';
    };

    const colorClasses = getColorClass(normalizedScore);
    // Extract background color class separately for the bar fill
    const bgColorClass = colorClasses.split(' ')[0];

    return (
        <div className="w-full flex flex-col gap-1.5 font-sans">
            {/* Header / Metric Labels */}
            <div className="flex items-center justify-between text-sm">
                {points && (
                    <span className="font-medium text-text">{points}</span>
                )}
                {showPercentage && (
                    <span className="ml-auto font-bold tracking-tight text-text">
                        {Math.round(normalizedScore)}
                        <span className="text-xs font-semibold">%</span>
                    </span>
                )}
            </div>

            {/* Progress Bar Track */}
            <div
                className="w-full overflow-hidden rounded-full bg-background"
                style={{ height }}
            >
                {/* Animated Fill */}
                <div
                    className={`h-full rounded-full ${bgColorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${normalizedScore}%` }}
                />
            </div>
        </div>
    );
};