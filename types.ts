export interface Subtask {
  description: string;
  completed: boolean;
}

export interface HistoryLog {
    id: string;
    title: string;
    subtasks: Subtask[];
    completedAt: string;
    color: string;
    completed?: boolean; // For toggling in historical view
    isUnavoidable?: boolean;
}

export type HistoryData = Record<string, HistoryLog[]>;

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface EditingHistoryLogState {
    dateKey: string;
    log: HistoryLog;
    isUnavoidable?: boolean;
}

export interface Theme {
    background: string;
    text: string;
    primary: string;
    card: string;
    cardHover: string;
    border: string;
    input: string;
}

export interface Quote {
    quote: string;
    author: string;
}
