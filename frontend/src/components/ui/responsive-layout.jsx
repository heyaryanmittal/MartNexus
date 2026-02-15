import React from 'react';
import { cn } from '@/lib/utils';


export const Container = ({ children, className = '', size = 'default' }) => {
    const sizes = {
        sm: 'max-w-3xl',
        default: 'max-w-7xl',
        lg: 'max-w-[1400px]',
        full: 'max-w-full'
    };

    return (
        <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizes[size], className)}>
            {children}
        </div>
    );
};


export const ResponsiveGrid = ({
    children,
    cols = { xs: 1, sm: 2, md: 3, lg: 4 },
    gap = 6,
    className = ''
}) => {
    const gridCols = `
    grid-cols-${cols.xs}
    sm:grid-cols-${cols.sm}
    md:grid-cols-${cols.md}
    lg:grid-cols-${cols.lg}
  `;

    return (
        <div className={cn('grid', gridCols, `gap-${gap}`, className)}>
            {children}
        </div>
    );
};


export const Stack = ({
    children,
    direction = 'vertical',
    spacing = 4,
    align = 'stretch',
    className = ''
}) => {
    const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row';
    const spacingClass = direction === 'vertical' ? `space-y-${spacing}` : `space-x-${spacing}`;

    const alignClasses = {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
    };

    return (
        <div className={cn('flex', directionClass, spacingClass, alignClasses[align], className)}>
            {children}
        </div>
    );
};


export const ResponsiveCard = ({
    children,
    padding = 'default',
    hover = false,
    className = ''
}) => {
    const paddings = {
        none: '',
        sm: 'p-3 sm:p-4',
        default: 'p-4 sm:p-6',
        lg: 'p-6 sm:p-8'
    };

    const hoverClass = hover ? 'hover:shadow-xl hover:scale-[1.02] transition-all duration-200' : '';

    return (
        <div className={cn(
            'bg-white rounded-xl shadow-lg border border-gray-100',
            paddings[padding],
            hoverClass,
            className
        )}>
            {children}
        </div>
    );
};


export const Section = ({
    children,
    title,
    description,
    action,
    className = ''
}) => {
    return (
        <section className={cn('py-6 sm:py-8 lg:py-12', className)}>
            {(title || description || action) && (
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            {title && (
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="text-sm sm:text-base text-gray-600">
                                    {description}
                                </p>
                            )}
                        </div>
                        {action && (
                            <div className="flex-shrink-0">
                                {action}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {children}
        </section>
    );
};


export const ResponsiveTable = ({ children, className = '' }) => {
    return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className={cn('overflow-hidden shadow-lg rounded-xl border border-gray-200', className)}>
                    {children}
                </div>
            </div>
        </div>
    );
};


export const MobileMenuButton = ({ isOpen, onClick, className = '' }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                'p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors lg:hidden',
                className
            )}
            aria-label="Toggle menu"
        >
            <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                {isOpen ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                    />
                ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                    />
                )}
            </svg>
        </button>
    );
};


export const ResponsiveModal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'default',
    className = ''
}) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className={cn(
                    'relative bg-white rounded-xl shadow-2xl w-full',
                    sizes[size],
                    'transform transition-all',
                    className
                )}>
                    {}
                    {title && (
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {}
                    <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                        {children}
                    </div>

                    {}
                    {footer && (
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export const ResponsiveTabs = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={cn('border-b border-gray-200', className)}>
            {}
            <div className="sm:hidden">
                <select
                    value={activeTab}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {tabs.map((tab) => (
                        <option key={tab.value} value={tab.value}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>

            {}
            <div className="hidden sm:flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.value}
                        onClick={() => onChange(tab.value)}
                        className={cn(
                            'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                            activeTab === tab.value
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>
    );
};


export const ResponsiveButtonGroup = ({ children, className = '' }) => {
    return (
        <div className={cn(
            'flex flex-col sm:flex-row gap-3 sm:gap-4',
            className
        )}>
            {children}
        </div>
    );
};


export const ShowOn = ({ breakpoint = 'sm', children }) => {
    const breakpoints = {
        sm: 'hidden sm:block',
        md: 'hidden md:block',
        lg: 'hidden lg:block',
        xl: 'hidden xl:block'
    };

    return <div className={breakpoints[breakpoint]}>{children}</div>;
};

export const HideOn = ({ breakpoint = 'sm', children }) => {
    const breakpoints = {
        sm: 'block sm:hidden',
        md: 'block md:hidden',
        lg: 'block lg:hidden',
        xl: 'block xl:hidden'
    };

    return <div className={breakpoints[breakpoint]}>{children}</div>;
};


export const ResponsiveImage = ({
    src,
    alt,
    aspectRatio = '16/9',
    objectFit = 'cover',
    className = ''
}) => {
    return (
        <div
            className={cn('relative w-full overflow-hidden rounded-lg', className)}
            style={{ aspectRatio }}
        >
            <img
                src={src}
                alt={alt}
                className={`absolute inset-0 w-full h-full object-${objectFit}`}
                loading="lazy"
            />
        </div>
    );
};
