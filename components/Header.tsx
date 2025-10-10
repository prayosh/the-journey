import React, { useMemo } from 'react';
import { HistoryLog, Theme } from '../types.ts';

interface HeaderProps {
    tasks: HistoryLog[];
    viewingDate: string | null;
    customTheme: Theme;
}

const formatDate = (dateString: string | null) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    // The date constructor needs a timezone hint to avoid off-by-one day errors
    const date = dateString ? new Date(dateString.replace(/-/g, '/')) : new Date();
    return date.toLocaleString(undefined, options);
};

const lightenColor = (hex: string, percent: number): string => {
    if (!hex || hex.length < 7) return '#334155'; // Fallback color (slate-700)
    try {
        let r = parseInt(hex.slice(1, 3), 16),
            g = parseInt(hex.slice(3, 5), 16),
            b = parseInt(hex.slice(5, 7), 16);

        const p = percent / 100;

        r = Math.round(Math.min(255, r + (255 - r) * p));
        g = Math.round(Math.min(255, g + (255 - g) * p));
        b = Math.round(Math.min(255, b + (255 - b) * p));

        return "#" + (r).toString(16).padStart(2, '0') + (g).toString(16).padStart(2, '0') + (b).toString(16).padStart(2, '0');
    } catch(e) {
        return '#334155';
    }
};

const Header: React.FC<HeaderProps> = ({ tasks, viewingDate, customTheme }) => {
    
    const { completedItems, totalItems, percentage } = useMemo(() => {
        let total = 0;
        let completed = 0;

        tasks.forEach(task => {
            if (task.subtasks.length > 0) {
                total += task.subtasks.length;
                completed += task.subtasks.filter(st => st.completed).length;
            } else {
                total += 1;
                if (task.completed) {
                    completed += 1;
                }
            }
        });

        const percent = total > 0 ? (completed / total) * 100 : 0;
        return { completedItems: completed, totalItems: total, percentage: percent };
    }, [tasks]);

    const trackColor = useMemo(() => lightenColor(customTheme.primary, 80), [customTheme.primary]);

    return (
        <header className="flex flex-col items-center py-4 relative">
            <h1 className="text-6xl font-extrabold tracking-tight cursive-title mb-2">
                The Journey
            </h1>
            <p className="text-lg font-medium mb-4 text-gray-400">{formatDate(viewingDate)}</p>
            
            <div 
                className="w-full max-w-3xl mt-4 rounded-full h-3"
                style={{ backgroundColor: trackColor }}
            >
                <div 
                    className="progress-bar h-3 rounded-full theme-bg" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <p className="text-sm mt-1 text-gray-400">
                {completedItems} of {totalItems} steps complete ({percentage.toFixed(0)}%)
            </p>
        </header>
    );
};

export default Header;