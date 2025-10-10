import React, { useEffect } from 'react';
import { Notification as NotificationType } from '../types';
import { CheckCircleIcon, XCircleIcon, InfoIcon } from './Icons';

interface NotificationProps {
    notification: NotificationType;
    onDismiss: (id: number) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(notification.id);
        }, 1000); // Set timeout to 1 second

        return () => clearTimeout(timer);
    }, [notification.id, onDismiss]);

    let icon;
    switch (notification.type) {
        case 'success':
            icon = <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            break;
        case 'error':
            icon = <XCircleIcon className="w-5 h-5 text-red-400" />;
            break;
        case 'info':
        default:
            icon = <InfoIcon className="w-5 h-5 text-blue-400" />;
            break;
    }

    return (
        <div className="notification p-3 mb-2 rounded-xl shadow-xl border-2 border-gray-500/50 text-white flex items-start w-72 pointer-events-auto animate-fade-in-right bg-black/50 backdrop-blur-sm">
            <div className="mr-3 flex-shrink-0">{icon}</div>
            <div className="flex-grow text-sm">{notification.message}</div>
        </div>
    );
};

interface NotificationAreaProps {
    notifications: NotificationType[];
    onDismiss: (id: number) => void;
}

const NotificationArea: React.FC<NotificationAreaProps> = ({ notifications, onDismiss }) => {
    return (
        <div className="fixed top-0 right-0 p-4 z-[100] pointer-events-none">
            {notifications.map(notification => (
                <Notification key={notification.id} notification={notification} onDismiss={onDismiss} />
            ))}
        </div>
    );
};

export default NotificationArea;