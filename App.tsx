import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Subtask, HistoryData, HistoryLog, Notification, EditingHistoryLogState, Theme, Quote } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import TaskList from './components/TaskList';
import BottomNav from './components/BottomNav';
import TaskModal from './components/TaskModal';
import HistoryModal from './components/HistoryModal';
import NotificationArea from './components/NotificationArea';
import QuoteOfTheDay from './components/QuoteOfTheDay';

// Constants
const HISTORY_KEY = 'journey_history_v2';
const THEME_KEY = 'journey_custom_theme';
const QUOTE_KEY = 'journey_daily_quote';
const QUOTE_INDEX_KEY = 'journey_quote_index';
const COLOR_PALETTE = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', 
    '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

const LOCAL_QUOTES: Quote[] = [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "The journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { quote: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { quote: "Act as if what you do makes a difference. It does.", author: "William James" },
    { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
    { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
    { quote: "Great things never come from comfort zones.", author: "Unknown" },
    { quote: "Dream it. Wish it. Do it.", author: "Unknown" },
    { quote: "Success doesn’t just find you. You have to go out and get it.", author: "Unknown" },
    { quote: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { quote: "Dream bigger. Do bigger.", author: "Unknown" },
    { quote: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" }
];


const DEFAULT_THEME: Theme = {
    background: '#0f172a',    // slate-900
    text: '#f1f5f9',          // slate-100
    primary: '#6366f1',       // indigo-500
    card: '#1e293b',          // slate-800
    cardHover: '#334155',     // slate-700
    border: '#334155',        // slate-700
    input: '#0f172a',         // slate-900
};

declare const Tone: any;
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const App: React.FC = () => {
    const [taskHistory, setTaskHistory] = useState<HistoryData>({});
    const [customTheme, setCustomTheme] = useState<Theme>(DEFAULT_THEME);
    
    const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
    const [isTaskModalOpen, setTaskModalOpen] = useState<boolean>(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState<boolean>(false);
    
    const [editingHistoryLog, setEditingHistoryLog] = useState<EditingHistoryLogState | null>(null);
    const [isAddingUnavoidable, setIsAddingUnavoidable] = useState<boolean>(false);

    const [viewingDate, setViewingDate] = useState<string | null>(null); // null for today
    const [isUnavoidableOpen, setIsUnavoidableOpen] = useState<boolean>(true);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationCounter = useRef<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Quote State ---
    const [dailyQuote, setDailyQuote] = useState<Quote | null>(null);

    // --- Audio setup ---
    const audioInitialized = useRef(false);
    const synth = useRef<any>(null);
    const polySynth = useRef<any>(null);

    const initAudio = () => {
        if (audioInitialized.current || typeof Tone === 'undefined') return;
        try {
            if (Tone.context.state !== 'running') {
                Tone.start();
            }
            synth.current = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
            polySynth.current = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.4, sustain: 0.05, release: 0.5 } }).toDestination();
            audioInitialized.current = true;
        } catch (e) { console.error("Audio initialization failed:", e); }
    };

    const playTock = useCallback(() => { if (audioInitialized.current && synth.current) synth.current.triggerAttackRelease("C5", "8n"); }, []);
    const playChime = useCallback(() => { if (audioInitialized.current && polySynth.current) polySynth.current.triggerAttackRelease(["E5", "G5", "C6"], "4n"); }, []);
    const playWhoosh = useCallback(() => { if (audioInitialized.current && polySynth.current) polySynth.current.triggerAttackRelease(["C3", "C2"], "8n"); }, []);

    // --- Utility Functions ---
    const getTodayKey = useCallback(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);
    const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        notificationCounter.current++;
        const newNotification: Notification = { id: notificationCounter.current, message, type };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    // --- Data Persistence & Daily Rollover ---
    const saveHistoryToStorage = useCallback((updatedHistory: HistoryData) => {
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        } catch (error) { showNotification('Error saving task history.', 'error'); }
    }, [showNotification]);

    useEffect(() => {
        // Task History and Daily Rollover
        let loadedHistory: HistoryData = {};
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            loadedHistory = storedHistory ? JSON.parse(storedHistory) : {};
        } catch (error) {
            console.error("Error loading history from localStorage:", error);
            showNotification('Error loading history data. It might be corrupted.', 'error');
        }

        const todayKey = getTodayKey();
        if (!loadedHistory[todayKey]) {
            const allDateKeys = Object.keys(loadedHistory).sort().reverse();
            const mostRecentDateKey = allDateKeys[0];
            
            if (mostRecentDateKey) {
                const mostRecentTasks = loadedHistory[mostRecentDateKey] || [];
                const tasksToCarryOver = mostRecentTasks.filter(task => !task.isUnavoidable);

                loadedHistory[todayKey] = tasksToCarryOver.map(task => ({
                    ...task,
                    id: generateId(),
                    completed: false,
                    subtasks: task.subtasks.map(st => ({ ...st, completed: false })),
                    completedAt: new Date().toISOString()
                }));
            } else {
                 loadedHistory[todayKey] = [];
            }
        }
        setTaskHistory(loadedHistory);
        saveHistoryToStorage(loadedHistory);
        
        // Theme
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) { setCustomTheme(JSON.parse(savedTheme)); }

        // Daily Quote
        const savedQuoteData = localStorage.getItem(QUOTE_KEY);
        let quoteToSet: Quote | null = null;
        if (savedQuoteData) {
            const { date, quote } = JSON.parse(savedQuoteData);
            if (date === todayKey) {
                quoteToSet = quote;
            }
        }

        if (!quoteToSet) { // If no quote is set for today, get a new one
            const lastIndexStr = localStorage.getItem(QUOTE_INDEX_KEY);
            const lastIndex = lastIndexStr ? parseInt(lastIndexStr, 10) : -1;
            const newIndex = (lastIndex + 1) % LOCAL_QUOTES.length;
            
            quoteToSet = LOCAL_QUOTES[newIndex];
            
            localStorage.setItem(QUOTE_KEY, JSON.stringify({ date: todayKey, quote: quoteToSet }));
            localStorage.setItem(QUOTE_INDEX_KEY, newIndex.toString());
        }
        setDailyQuote(quoteToSet);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on initial mount


    // --- Theme Management ---
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--app-bg', customTheme.background);
        root.style.setProperty('--app-text', customTheme.text);
        root.style.setProperty('--app-primary', customTheme.primary);
        root.style.setProperty('--app-card-bg', customTheme.card);
        root.style.setProperty('--app-card-hover-bg', customTheme.cardHover);
        root.style.setProperty('--app-border', customTheme.border);
        root.style.setProperty('--app-input-bg', customTheme.input);
        localStorage.setItem(THEME_KEY, JSON.stringify(customTheme));
    }, [customTheme]);
    
    const resetTheme = () => setCustomTheme(DEFAULT_THEME);

    // --- Unified Task CRUD ---
    const handleSaveTask = (taskData: { id?: string; title: string; subtasks: Subtask[] }) => {
        const dateKey = viewingDate || getTodayKey();
        
        setTaskHistory(prev => {
            const newHistory = { ...prev };
            const dateHistory = newHistory[dateKey] ? [...newHistory[dateKey]] : [];
            
            if (taskData.id) { // Update existing task
                const index = dateHistory.findIndex(t => t.id === taskData.id);
                if (index !== -1) {
                    const updatedTask = { ...dateHistory[index], title: taskData.title, subtasks: taskData.subtasks };
                    updatedTask.completed = updatedTask.subtasks.length > 0 ? updatedTask.subtasks.every(st => st.completed) : updatedTask.completed;
                    dateHistory[index] = updatedTask;
                }
            } else { // Add new task
                const totalHistoryItems = Object.values(prev).flat().length;
                const newLog: HistoryLog = {
                    id: generateId(),
                    title: taskData.title,
                    subtasks: taskData.subtasks,
                    completedAt: new Date(dateKey.replace(/-/g, '/')).toISOString(),
                    color: COLOR_PALETTE[totalHistoryItems % COLOR_PALETTE.length],
                    completed: false,
                    isUnavoidable: isAddingUnavoidable
                };
                dateHistory.push(newLog);
                playChime();
            }
            newHistory[dateKey] = dateHistory;
            saveHistoryToStorage(newHistory);
            return newHistory;
        });

        closeTaskModal();
    };

    const handleToggleTask = (dateKey: string, logId: string, subtaskIndex?: number) => {
        setTaskHistory(prev => {
            const newHistory = { ...prev };
            const dateTasks = (newHistory[dateKey] || []).map(log => {
                if (log.id === logId) {
                    const updatedLog = { ...log, subtasks: JSON.parse(JSON.stringify(log.subtasks)) };
                    const isMainTaskToggle = subtaskIndex === undefined;

                    if (!isMainTaskToggle && updatedLog.subtasks.length > 0) {
                        updatedLog.subtasks[subtaskIndex!] = { ...updatedLog.subtasks[subtaskIndex!], completed: !updatedLog.subtasks[subtaskIndex!].completed };
                        updatedLog.completed = updatedLog.subtasks.every(st => st.completed);
                    } else if (updatedLog.subtasks.length === 0) {
                        updatedLog.completed = !updatedLog.completed;
                    } else if (isMainTaskToggle && updatedLog.subtasks.length > 0) {
                        const targetCompletion = !updatedLog.completed;
                        updatedLog.subtasks = updatedLog.subtasks.map(st => ({ ...st, completed: targetCompletion }));
                        updatedLog.completed = targetCompletion;
                    }
                    if (updatedLog.completed) playChime(); else playTock();
                    return updatedLog;
                }
                return log;
            });
            newHistory[dateKey] = dateTasks;
            saveHistoryToStorage(newHistory);
            return newHistory;
        });
    };

    const handleDeleteTask = (dateKey: string, logId: string) => {
        setTaskHistory(prev => {
            const dateHistory = (prev[dateKey] || []).filter(t => t.id !== logId);
            const newHistory = { ...prev, [dateKey]: dateHistory };
            saveHistoryToStorage(newHistory);
            playWhoosh();
            return newHistory;
        });
    };

    // --- Modal Controls ---
    const openTaskModalToAdd = (isUnavoidable: boolean) => {
        setIsAddingUnavoidable(isUnavoidable);
        setEditingHistoryLog(null);
        setTaskModalOpen(true);
    };

    const openTaskModalToEdit = (dateKey: string, log: HistoryLog) => {
        setEditingHistoryLog({dateKey, log, isUnavoidable: log.isUnavoidable});
        setIsAddingUnavoidable(!!log.isUnavoidable);
        setTaskModalOpen(true);
    };
    
    const closeTaskModal = () => {
        setTaskModalOpen(false);
        setEditingHistoryLog(null);
        setIsAddingUnavoidable(false);
    };
    
    // --- View Controls ---
    const goToToday = () => setViewingDate(null);
    const viewDay = (dateKey: string) => {
        setViewingDate(dateKey === getTodayKey() ? null : dateKey);
        setHistoryModalOpen(false);
    }

    // --- Data Import/Export ---
    const exportData = () => {
        const dataToExport = {
            history: taskHistory,
            customTheme,
        };
        const data = JSON.stringify(dataToExport, null, 2);
        const filename = `the_journey_backup_${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                if (!importedData.history) throw new Error("Invalid file format.");
                setTaskHistory(importedData.history);
                if (importedData.customTheme) setCustomTheme(importedData.customTheme);
                saveHistoryToStorage(importedData.history);
                setSidebarOpen(false);
            } catch (error) {
                showNotification(`Import failed: ${(error as Error).message || 'File is corrupted.'}`, 'error');
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };
    
    const currentDayKey = viewingDate || getTodayKey();
    const tasksForView = useMemo(() => taskHistory[currentDayKey] || [], [taskHistory, currentDayKey]);

    return (
        <>
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setSidebarOpen(false)} aria-hidden="true"></div>}
            
            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} customTheme={customTheme} onThemeChange={setCustomTheme} onThemeReset={resetTheme} onOpenHistory={() => { setHistoryModalOpen(true); setSidebarOpen(false); }} onExport={exportData} onImportClick={() => fileInputRef.current?.click()} />
            <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={importData} />

            <div className="flex-grow p-4 md:p-8 pt-2 overflow-y-auto pb-24">
                <Header tasks={tasksForView} viewingDate={viewingDate} customTheme={customTheme} />
                <TaskList
                    dailyTasks={tasksForView}
                    dateKey={currentDayKey}
                    isUnavoidableOpen={isUnavoidableOpen}
                    onToggleUnavoidable={() => setIsUnavoidableOpen(prev => !prev)}
                    onAddTask={openTaskModalToAdd}
                    onToggleTask={handleToggleTask}
                    onEditTask={openTaskModalToEdit}
                    onDeleteTask={handleDeleteTask}
                />
                 {!viewingDate && (
                    <QuoteOfTheDay quote={dailyQuote} />
                )}
            </div>

            {viewingDate && (
                 <div className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-4 z-30">
                    <button onClick={goToToday} className="px-6 py-3 text-base font-semibold rounded-full theme-bg text-white hover:opacity-90 transition shadow-lg flex items-center">
                        &larr; Return to Today
                    </button>
                 </div>
            )}

            <BottomNav onOpenMenu={() => { setSidebarOpen(true); initAudio(); }} onOpenTaskModal={() => openTaskModalToAdd(false)} />

            <TaskModal isOpen={isTaskModalOpen} onClose={closeTaskModal} onSave={handleSaveTask} editingHistoryLog={editingHistoryLog} dateKey={currentDayKey} isAddingUnavoidable={isAddingUnavoidable} />

            <HistoryModal isOpen={isHistoryModalOpen} onClose={() => setHistoryModalOpen(false)} historyData={taskHistory} onViewDay={viewDay} />

            <NotificationArea notifications={notifications} onDismiss={(id) => setNotifications(n => n.filter(notif => notif.id !== id))} />
        </>
    );
};

export default App;