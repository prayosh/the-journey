import React from 'react';
import { HistoryLog } from '../types.ts';
import TaskItem from './TaskItem.tsx';
import { CompassIcon, PlusIcon, ChevronDownIcon } from './Icons.tsx';

interface TaskListProps {
    dailyTasks: HistoryLog[];
    dateKey: string;
    isUnavoidableOpen: boolean;
    onToggleUnavoidable: () => void;
    onAddTask: (isUnavoidable: boolean) => void;
    onToggleTask: (dateKey: string, logId: string, subtaskIndex?: number) => void;
    onEditTask: (dateKey: string, log: HistoryLog) => void;
    onDeleteTask: (dateKey: string, logId: string) => void;
}

const TaskList: React.FC<TaskListProps> = (props) => {
    const {
        dailyTasks,
        dateKey,
        isUnavoidableOpen,
        onToggleUnavoidable,
        onAddTask,
        onToggleTask,
        onEditTask,
        onDeleteTask
    } = props;

    const unavoidableTasks = dailyTasks.filter(task => task.isUnavoidable);
    const regularTasks = dailyTasks.filter(task => !task.isUnavoidable);

    return (
        <div className="max-w-3xl mx-auto mt-8">
            {/* Unavoidable Tasks Section */}
            <div className="mb-6 app-border border-b-2 pb-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={onToggleUnavoidable}>
                    <h2 className="text-lg font-bold theme-text">Unavoidable Tasks</h2>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddTask(true); }}
                            className="p-1 rounded-full theme-bg text-white hover:opacity-80 transition"
                            aria-label="Add Unavoidable Task"
                        >
                            <PlusIcon className="w-5 h-5" />
                        </button>
                         <ChevronDownIcon className={`w-6 h-6 theme-text transition-transform duration-300 ${isUnavoidableOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
                {isUnavoidableOpen && (
                    <div className="mt-4">
                        {unavoidableTasks.length > 0 
                            ? unavoidableTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={(id, subIdx) => onToggleTask(dateKey, id, subIdx)}
                                    onEdit={() => onEditTask(dateKey, task)}
                                    onDelete={(id) => onDeleteTask(dateKey, id)}
                                />
                            ))
                            : <p className="text-sm text-gray-400">No unavoidable tasks added for this day.</p>
                        }
                    </div>
                )}
            </div>

            {/* Daily Tasks Section */}
            <h2 className="text-lg font-bold theme-text mb-4">Daily Tasks</h2>
            {regularTasks.length === 0 && unavoidableTasks.length === 0 ? (
                <div className={`text-center py-16 px-4 rounded-xl border-4 border-dashed app-border text-gray-400`}>
                    <CompassIcon className="mx-auto mb-4 theme-text w-9 h-9" />
                    <p className="text-xl font-semibold">Start your Journey!</p>
                    <p>Click the '+' button to add your first daily Task.</p>
                </div>
            ) : (
                regularTasks.map((task) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={(id, subIdx) => onToggleTask(dateKey, id, subIdx)}
                        onEdit={() => onEditTask(dateKey, task)}
                        onDelete={(id) => onDeleteTask(dateKey, id)}
                    />
                ))
            )}
        </div>
    );
};

export default TaskList;