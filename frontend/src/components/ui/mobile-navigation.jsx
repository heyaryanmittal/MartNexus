import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home, Package, ShoppingCart, TrendingUp, Users,
    FileText, Settings, Menu, X, ChevronRight, Store
} from 'lucide-react';
import { cn } from '@/lib/utils';


export const MobileBottomNav = ({ items, className = '' }) => {
    return (
        <nav className={cn(
            'fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 lg:hidden',
            className
        )}>
            <div className="grid grid-cols-5 gap-1 px-2 py-2">
                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={({ isActive }) => cn(
                                'flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors',
                                isActive
                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            )}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium truncate w-full text-center">
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};


export const MobileDrawer = ({ isOpen, onClose, children, title, className = '' }) => {
    return (
        <>
            {}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {}
            <div
                className={cn(
                    'fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    className
                )}
            >
                {}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {title || 'Menu'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {}
                <div className="overflow-y-auto h-[calc(100vh-64px)]">
                    {children}
                </div>
            </div>
        </>
    );
};


export const MobileMenuItem = ({ icon: Icon, label, to, badge, onClick, className = '' }) => {
    const content = (
        <div className={cn(
            'flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
            className
        )}>
            <div className="flex items-center gap-3">
                {Icon && <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
                <span className="text-base font-medium text-gray-900 dark:text-white">
                    {label}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                        {badge}
                    </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
        </div>
    );

    if (to) {
        return (
            <NavLink
                to={to}
                className={({ isActive }) =>
                    isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' : ''
                }
            >
                {content}
            </NavLink>
        );
    }

    return (
        <button onClick={onClick} className="w-full text-left">
            {content}
        </button>
    );
};


export const MobileMenuSection = ({ title, children, className = '' }) => {
    return (
        <div className={cn('py-2', className)}>
            {title && (
                <div className="px-4 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {title}
                    </h3>
                </div>
            )}
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
};


export const MobileHeader = ({
    title,
    onMenuClick,
    actions,
    showBack = false,
    onBackClick,
    className = ''
}) => {
    return (
        <header className={cn(
            'sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 lg:hidden',
            className
        )}>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    {showBack ? (
                        <button
                            onClick={onBackClick}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={onMenuClick}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {title}
                    </h1>
                </div>
                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
        </header>
    );
};


export const MobileFAB = ({ icon: Icon, label, onClick, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                'fixed bottom-20 right-4 z-30 p-4 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 lg:hidden',
                variants[variant],
                className
            )}
            aria-label={label}
        >
            {Icon && <Icon className="w-6 h-6" />}
        </button>
    );
};


export const MobileSearchBar = ({
    value,
    onChange,
    onFocus,
    placeholder = 'Search...',
    className = ''
}) => {
    return (
        <div className={cn('p-4 lg:hidden', className)}>
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onFocus={onFocus}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
        </div>
    );
};


export const MobileCardItem = ({
    title,
    subtitle,
    value,
    icon: Icon,
    badge,
    onClick,
    className = ''
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700',
                onClick && 'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {Icon && (
                        <div className="flex-shrink-0 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    {badge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                            {badge}
                        </span>
                    )}
                    {value && (
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {value}
                        </span>
                    )}
                    {onClick && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                </div>
            </div>
        </div>
    );
};


export const usePullToRefresh = (onRefresh) => {
    const [isPulling, setIsPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [startY, setStartY] = useState(0);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e) => {
        if (startY === 0) return;

        const currentY = e.touches[0].clientY;
        const distance = currentY - startY;

        if (distance > 0 && window.scrollY === 0) {
            setPullDistance(Math.min(distance, 100));
            setIsPulling(true);
        }
    };

    const handleTouchEnd = async () => {
        if (pullDistance > 60) {
            await onRefresh();
        }
        setIsPulling(false);
        setPullDistance(0);
        setStartY(0);
    };

    return {
        isPulling,
        pullDistance,
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: handleTouchEnd
        }
    };
};

export const PullToRefreshIndicator = ({ isPulling, pullDistance }) => {
    if (!isPulling) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 transition-all"
            style={{ transform: `translateY(${Math.min(pullDistance - 60, 0)}px)` }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                <svg
                    className={`w-6 h-6 text-blue-600 ${pullDistance > 60 ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                </svg>
            </div>
        </div>
    );
};
