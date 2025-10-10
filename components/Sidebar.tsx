import React from 'react';
// Fix: Import the Theme interface to use for props.
import { Theme } from '../types';
import { CalendarIcon, DownloadIcon, UploadIcon, XIcon } from './Icons';

// Fix: Use the strong-typed Theme interface for theme props.
interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    customTheme: Theme;
    onThemeChange: (theme: Theme) => void;
    onThemeReset: () => void;
    onOpenHistory: () => void;
    onExport: () => void;
    onImportClick: () => void;
}

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <input 
            type="color" 
            value={value}
            onChange={onChange}
            className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent"
        />
    </div>
);

const Sidebar: React.FC<SidebarProps> = (props) => {
    const { isOpen, onClose, customTheme, onThemeChange, onThemeReset, onOpenHistory, onExport, onImportClick } = props;

    // Fix: Ensure the key is a valid key of the Theme interface.
    const handleColorChange = (key: keyof Theme, value: string) => {
        onThemeChange({ ...customTheme, [key]: value });
    };

    return (
        <div 
            className={`sidebar card-bg fixed top-0 left-0 h-full w-64 z-40 shadow-2xl p-6 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} app-border border-r`}
        >
            <div className="flex justify-between items-center mb-8 app-border border-b pb-4">
                <h1 className="text-3xl font-bold theme-text">Settings</h1>
                <button onClick={onClose} className="p-2 rounded-full transition theme-text" aria-label="Close menu">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-6">
                {/* History Button */}
                <button
                    onClick={onOpenHistory}
                    className="w-full flex items-center justify-center p-3 rounded-xl transition-colors duration-200 theme-text theme-border/50 border card-hover"
                >
                    <CalendarIcon className="mr-2 w-5 h-5" />
                    Task History
                </button>
                
                {/* Data Management Section */}
                <div className="space-y-3 pt-4 app-border border-t">
                    <p className="text-sm font-semibold theme-text border-b app-border/30 pb-2">Local Data Backup</p>

                    <button
                        onClick={onExport}
                        className="w-full flex items-center justify-center p-3 rounded-xl transition-colors duration-200 theme-bg hover:opacity-90 text-white shadow-md"
                    >
                        <DownloadIcon className="mr-2 w-5 h-5" />
                        Export Data (JSON)
                    </button>

                    <button
                        onClick={onImportClick}
                        className="w-full flex items-center justify-center p-3 rounded-xl transition-colors duration-200 theme-text theme-border/50 border card-hover"
                    >
                        <UploadIcon className="mr-2 w-5 h-5" />
                        Import Data (JSON)
                    </button>
                </div>

                 {/* Theme Customization */}
                 <div className="space-y-3 pt-4 app-border border-t">
                    <p className="text-sm font-semibold theme-text border-b app-border/30 pb-2">Theme Customization</p>
                    <ColorInput label="Background" value={customTheme.background} onChange={(e) => handleColorChange('background', e.target.value)} />
                    <ColorInput label="Card" value={customTheme.card} onChange={(e) => handleColorChange('card', e.target.value)} />
                    <ColorInput label="Text" value={customTheme.text} onChange={(e) => handleColorChange('text', e.target.value)} />
                    <ColorInput label="Primary" value={customTheme.primary} onChange={(e) => handleColorChange('primary', e.target.value)} />
                    <button onClick={onThemeReset} className="w-full text-xs p-2 mt-2 rounded-lg theme-border border hover:opacity-80 transition">
                        Reset to Default Theme
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;