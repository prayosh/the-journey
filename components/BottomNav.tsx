import React from 'react';
import { MenuIcon, PlusIcon } from './Icons.tsx';

interface BottomNavProps {
    onOpenMenu: () => void;
    onOpenTaskModal: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onOpenMenu, onOpenTaskModal }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-between p-4 pointer-events-none">
            {/* Menu Button (Bottom Left) */}
            <button
                onClick={onOpenMenu}
                className="w-14 h-14 rounded-full pointer-events-auto shadow-2xl flex items-center justify-center transform hover:scale-110 transition duration-300 focus:outline-none theme-bg text-white"
                aria-label="Open menu"
            >
                <MenuIcon className="w-6 h-6" />
            </button>

            {/* Add Button (Bottom Right) */}
            <button
                onClick={onOpenTaskModal}
                className="w-14 h-14 rounded-full pointer-events-auto shadow-2xl flex items-center justify-center transform hover:scale-110 transition duration-300 focus:outline-none theme-bg text-white"
                aria-label="Add new task"
            >
                <PlusIcon className="w-[30px] h-[30px]" />
            </button>
        </div>
    );
};

export default BottomNav;