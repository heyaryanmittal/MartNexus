import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';


export const LoadingSpinner = ({ size = 'default', text = 'Loading...', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        default: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const containerClasses = fullScreen
        ? 'fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50'
        : 'flex items-center justify-center p-8';

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
                {text && (
                    <p className="text-sm text-gray-600 font-medium animate-pulse">{text}</p>
                )}
            </div>
        </div>
    );
};


export const LoadingSkeleton = ({ count = 1, height = 'h-4', className = '' }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse bg-[length:200%_100%]`}
                    style={{
                        animation: 'shimmer 1.5s infinite',
                        backgroundSize: '200% 100%'
                    }}
                />
            ))}
        </div>
    );
};


export const CardSkeleton = () => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse" />
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
            </div>
        </div>
    );
};


export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="h-4 bg-gray-300 rounded animate-pulse" />
                    ))}
                </div>
            </div>
            {}
            <div className="divide-y divide-gray-200">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="p-4">
                        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    className = ''
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
            {Icon && (
                <div className="mb-6 p-4 bg-gray-100 rounded-full">
                    <Icon className="w-16 h-16 text-gray-400" />
                </div>
            )}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-600 mb-6 max-w-md">{description}</p>
            )}
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};


export const ErrorMessage = ({
    title = 'Error',
    message,
    onRetry,
    retryLabel = 'Try Again',
    className = ''
}) => {
    return (
        <div className={`bg-red-50 border border-red-200 rounded-xl p-6 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-1">{title}</h3>
                    <p className="text-red-700 text-sm mb-4">{message}</p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            {retryLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};


export const SuccessMessage = ({ title = 'Success', message, className = '' }) => {
    return (
        <div className={`bg-green-50 border border-green-200 rounded-xl p-6 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-1">{title}</h3>
                    <p className="text-green-700 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
};


export const WarningMessage = ({ title = 'Warning', message, className = '' }) => {
    return (
        <div className={`bg-yellow-50 border border-yellow-200 rounded-xl p-6 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">{title}</h3>
                    <p className="text-yellow-700 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
};


export const InfoMessage = ({ title = 'Info', message, className = '' }) => {
    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-xl p-6 ${className}`}>
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-1">{title}</h3>
                    <p className="text-blue-700 text-sm">{message}</p>
                </div>
            </div>
        </div>
    );
};


export const LargeActionButton = ({
    icon: Icon,
    label,
    onClick,
    variant = 'primary',
    disabled = false,
    loading = false,
    className = ''
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white',
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white',
        danger: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white',
        warning: 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`
        w-full p-6 rounded-xl font-semibold text-lg
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-xl hover:scale-105
        active:scale-95
        flex items-center justify-center gap-3
        ${variants[variant]}
        ${className}
      `}
        >
            {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
                Icon && <Icon className="w-6 h-6" />
            )}
            <span>{label}</span>
        </button>
    );
};


export const ProgressBar = ({ value = 0, max = 100, label, showPercentage = true, className = '' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
        <div className={className}>
            {(label || showPercentage) && (
                <div className="flex items-center justify-between mb-2">
                    {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
                    {showPercentage && <span className="text-sm font-medium text-gray-600">{percentage.toFixed(0)}%</span>}
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};


export const Badge = ({ children, variant = 'default', size = 'default', className = '' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        primary: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-cyan-100 text-cyan-800'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
};


export const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    trend = 'neutral',
    loading = false,
    className = ''
}) => {
    const trendColors = {
        up: 'text-green-600',
        down: 'text-red-600',
        neutral: 'text-gray-600'
    };

    if (loading) {
        return <CardSkeleton />;
    }

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow ${className}`}>
            <div className="flex items-center justify-between mb-4">
                {Icon && (
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                )}
                {change !== undefined && (
                    <span className={`text-sm font-medium ${trendColors[trend]}`}>
                        {change > 0 ? '+' : ''}{change}%
                    </span>
                )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    );
};


if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
    document.head.appendChild(style);
}
