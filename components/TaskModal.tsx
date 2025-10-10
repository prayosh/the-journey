import React, { useState, useEffect, FormEvent } from 'react';
import { Subtask, EditingHistoryLogState } from '../types';
import { PlusIcon, XIcon } from './Icons';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (taskData: { id?: string; title:string; subtasks: Subtask[] }) => void;
    editingHistoryLog: EditingHistoryLogState | null;
    dateKey: string;
    isAddingUnavoidable: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, editingHistoryLog, dateKey, isAddingUnavoidable }) => {
    const [title, setTitle] = useState('');
    const [subtaskInput, setSubtaskInput] = useState('');
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    
    useEffect(() => {
        if (isOpen) {
            const currentItem = editingHistoryLog?.log;
            setTitle(currentItem?.title || '');
            setSubtasks(currentItem ? JSON.parse(JSON.stringify(currentItem.subtasks)) : []);
        } else {
            // Reset form when modal closes
            setTitle('');
            setSubtaskInput('');
            setSubtasks([]);
        }
    }, [isOpen, editingHistoryLog]);

    const handleAddSubtask = () => {
        if (subtaskInput.trim()) {
            setSubtasks([...subtasks, { description: subtaskInput.trim(), completed: false }]);
            setSubtaskInput('');
        }
    };

    const handleRemoveSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        let finalSubtasks = [...subtasks];
        if (subtaskInput.trim()) {
            finalSubtasks.push({ description: subtaskInput.trim(), completed: false });
        }
        
        const id = editingHistoryLog?.log.id;
        onSave({ id, title, subtasks: finalSubtasks });
    };

    const isEditing = !!editingHistoryLog;

    let modalTitle = 'Add New Daily Task';
    if (isAddingUnavoidable) {
        modalTitle = isEditing ? "Edit Unavoidable Task" : "Add Unavoidable Task";
    } else if (isEditing) {
        modalTitle = 'Edit Daily Task'
    }

    return (
        <div 
            className={`modal fixed inset-0 z-50 flex items-center justify-center bg-black/70 ${isOpen ? 'modal-active' : 'modal-inactive'}`}
            onClick={onClose}
        >
            <div 
                className={`p-6 w-full max-w-md rounded-2xl shadow-2xl transform transition duration-300 ${isOpen ? 'modal-card-active opacity-100' : 'modal-card-inactive opacity-0'} card-bg`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-3 app-border">
                    <h2 className="text-2xl font-bold theme-text">{modalTitle}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-300 transition" aria-label="Close modal">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="taskTitle" className="block text-sm font-medium mb-1">
                            Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="taskTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Complete Morning Run"
                            className="w-full p-3 rounded-lg border theme-ring-focus focus:ring-2 transition-colors duration-200 input-bg app-border app-text"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Subtasks (Optional)</label>
                        <div className="flex space-x-2">
                            <input
                                id="subtaskInput" type="text" value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)}
                                placeholder="e.g., Stretch for 10 min"
                                className="flex-grow p-3 rounded-lg border theme-ring-focus focus:ring-2 transition-colors duration-200 input-bg app-border app-text"
                            />
                            <button
                                type="button" onClick={handleAddSubtask}
                                className="p-3 theme-bg text-white rounded-lg hover:opacity-90 transition-colors duration-200 flex items-center justify-center"
                                style={{backgroundColor: 'var(--subtask-color)'}}
                                aria-label="Add subtask"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {subtasks.length > 0 && (
                        <div className="mb-4 max-h-40 overflow-y-auto pr-2 space-y-2">
                            <p className="text-xs theme-text mb-1">Subtasks:</p>
                            {subtasks.map((st, index) => (
                                <div key={index} className="flex justify-between items-center p-2 rounded-lg card-hover">
                                    <span className={`text-sm ${st.completed ? 'line-through opacity-70' : ''}`}>{st.description}</span>
                                    <button type="button" onClick={() => handleRemoveSubtask(index)} className="text-red-400 hover:text-red-500 p-1 rounded-full hover:bg-red-900/10 transition" aria-label="Remove subtask">
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 mt-4 font-semibold rounded-xl transition duration-300 theme-bg hover:opacity-90 text-white shadow-lg"
                    >
                        {isEditing ? 'Update Task' : 'Save Task'}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-2">Applying changes for: <span className="font-bold">{dateKey}</span></p>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
