import React from 'react';
import { HistoryLog } from '../types';
import { CheckIcon, EditIcon, TrashIcon } from './Icons';

interface TaskItemProps {
    task: HistoryLog;
    onToggle: (id: string, subtaskIndex?: number) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const lightenColor = (hex: string, percent: number): string => {
    if (!hex || hex.length < 7) return '#cccccc'; // Fallback color
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
        return '#cccccc';
    }
};


const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {

    const isCompleted = task.subtasks.length > 0 ? task.subtasks.every(st => st.completed) : !!task.completed;
    
    const taskColor = task.color || '#6366f1'; // Fallback to original theme color
    const subtaskColor = task.color ? lightenColor(task.color, 40) : '#10b981';

    return (
        <div className={`task-card p-4 mb-4 rounded-xl shadow-lg transition duration-300 card-bg card-hover ${isCompleted ? 'opacity-70' : ''}`}>
            {/* Main Task Header */}
            <div className="flex items-start mb-2 group">
                <button
                    onClick={() => onToggle(task.id)}
                    className={`flex-shrink-0 mr-3 mt-1 rounded-lg w-6 h-6 border-2 flex items-center justify-center transition duration-200 custom-checkbox ${isCompleted ? 'checked' : ''}`}
                    style={{ borderColor: taskColor, backgroundColor: isCompleted ? taskColor : 'transparent' }}
                    aria-label={`Mark task as ${isCompleted ? 'incomplete' : 'complete'}`}
                >
                    <CheckIcon className="check-icon text-white w-4 h-4" strokeWidth={3} />
                </button>
                <h3 className={`font-extrabold text-xl flex-grow ${isCompleted && task.subtasks.length === 0 ? 'line-through' : ''}`} style={{ color: taskColor }}>
                    {task.title}
                </h3>
                
                <button
                    onClick={() => onEdit(task.id)}
                    className="text-gray-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hover:text-yellow-500 ml-2"
                    aria-label="Edit Task"
                >
                    <EditIcon className="w-[18px] h-[18px]" />
                </button>
                
                <button
                    onClick={() => onDelete(task.id)}
                    className="text-gray-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hover:text-red-500 ml-2"
                    aria-label="Delete Task"
                >
                    <TrashIcon className="w-[18px] h-[18px]" />
                </button>
            </div>

            {/* Subtasks List */}
            {task.subtasks.length > 0 && (
                <ul className="pt-2 pl-2 border-l border-dashed app-border space-y-2 mt-2">
                    {task.subtasks.map((subtask, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-300">
                            <button
                                onClick={() => onToggle(task.id, index)}
                                className={`flex-shrink-0 mr-3 mt-0.5 rounded-md w-5 h-5 border-2 flex items-center justify-center transition duration-200 custom-checkbox ${subtask.completed ? 'checked' : ''}`}
                                style={{ borderColor: subtaskColor, backgroundColor: subtask.completed ? subtaskColor : 'transparent' }}
                                aria-label={`Mark subtask as ${subtask.completed ? 'incomplete' : 'complete'}`}
                            >
                                <CheckIcon className="check-icon text-white w-3 h-3" strokeWidth={3} />
                            </button>
                            <span className={`flex-grow transition duration-200 ${subtask.completed ? 'line-through opacity-60' : ''}`}>
                                {subtask.description}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TaskItem;