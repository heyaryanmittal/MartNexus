import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
    setTheme: () => { }
});

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
    const [theme, setThemeState] = useState(() => {
        
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('martnexus-theme');
            if (stored) return stored;

            
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        
        root.classList.remove('light', 'dark');

        
        root.classList.add(theme);

        
        localStorage.setItem('martnexus-theme', theme);
    }, [theme]);

    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        setTheme,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};


export const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${className}`}
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg className="w-5 h-5 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};


export const ThemedCard = ({ children, className = '' }) => {
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 ${className}`}>
            {children}
        </div>
    );
};


export const ThemedText = ({ children, variant = 'body', className = '' }) => {
    const variants = {
        h1: 'text-4xl font-bold text-gray-900 dark:text-white',
        h2: 'text-3xl font-bold text-gray-900 dark:text-white',
        h3: 'text-2xl font-semibold text-gray-900 dark:text-white',
        h4: 'text-xl font-semibold text-gray-900 dark:text-white',
        body: 'text-base text-gray-700 dark:text-gray-300',
        small: 'text-sm text-gray-600 dark:text-gray-400',
        muted: 'text-sm text-gray-500 dark:text-gray-500'
    };

    const Component = variant.startsWith('h') ? variant : 'p';

    return (
        <Component className={`${variants[variant]} ${className}`}>
            {children}
        </Component>
    );
};


export const ThemedButton = ({
    children,
    variant = 'primary',
    size = 'default',
    disabled = false,
    onClick,
    className = ''
}) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
        outline: 'border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white',
        ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        default: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        rounded-lg font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </button>
    );
};
