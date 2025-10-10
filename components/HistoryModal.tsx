import React, { useState, useEffect } from 'react';
import { HistoryData } from '../types';
import { XIcon } from './Icons';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyData: HistoryData;
    onViewDay: (dateKey: string) => void;
}

const getLocalTodayKey = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, historyData, onViewDay }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateKey, setSelectedDateKey] = useState<string | null>(getLocalTodayKey());

    useEffect(() => {
        if (isOpen) {
            setCurrentDate(new Date());
            setSelectedDateKey(getLocalTodayKey());
        }
    }, [isOpen]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayKey = getLocalTodayKey();

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`}></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const hasHistory = historyData[dateKey] && historyData[dateKey].length > 0;
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selectedDateKey;

            days.push(
                <button 
                    key={dateKey}
                    onClick={() => setSelectedDateKey(dateKey)}
                    className={`relative p-2 rounded-lg text-sm transition duration-150 flex items-center justify-center flex-col card-hover ${isToday ? 'theme-border border-2' : ''} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 theme-ring-focus' : ''}`}
                >
                    {day}
                    {hasHistory && <span className="w-1.5 h-1.5 rounded-full absolute bottom-1.5 theme-bg"></span>}
                </button>
            );
        }
        return days;
    };

    const selectedHistoryCount = selectedDateKey ? (historyData[selectedDateKey] || []).length : 0;
    
    return (
        <div className={`modal fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${isOpen ? 'modal-active' : 'modal-inactive'}`} onClick={onClose}>
            <div className={`p-6 w-full max-w-lg rounded-2xl shadow-2xl transform transition duration-300 ${isOpen ? 'modal-card-active opacity-100' : 'modal-card-inactive opacity-0'} card-bg`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 border-b pb-3 app-border">
                    <h2 className="text-2xl font-bold theme-text">Task History</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-300 transition" aria-label="Close history modal">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex justify-between items-center mb-4 text-center">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg transition theme-text" aria-label="Previous month">&lt;</button>
                    <h3 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-lg transition theme-text" aria-label="Next month">&gt;</button>
                </div>

                <div className="calendar-grid text-center text-sm font-medium mb-2 text-gray-400">
                    <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="calendar-grid">
                    {renderCalendar()}
                </div>
                
                <div className="mt-6 pt-4 border-t app-border min-h-[80px]">
                    {selectedDateKey && (
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-xl font-semibold theme-text">
                                    {`Entries for ${selectedDateKey}`}
                                </h4>
                                <p className="text-sm text-gray-400">{selectedHistoryCount} task(s) logged on this day.</p>
                            </div>
                            <button
                                onClick={() => onViewDay(selectedDateKey)}
                                className="px-4 py-2 text-base font-semibold rounded-lg theme-bg text-white hover:opacity-90 transition shadow-md"
                            >
                                View Day &rarr;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;