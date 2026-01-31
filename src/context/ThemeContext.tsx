import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem('school_admin_theme');
        return (stored as Theme) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('school_admin_theme', theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}

// Theme color definitions matching the admin design
export const themeColors = {
    dark: {
        bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        bgSolid: '#0f172a',
        card: 'rgba(255, 255, 255, 0.08)',
        cardBorder: 'rgba(255, 255, 255, 0.1)',
        text: '#ffffff',
        textSecondary: '#94a3b8',
        textMuted: '#64748b',
        input: 'rgba(255, 255, 255, 0.05)',
        inputBorder: 'rgba(255, 255, 255, 0.1)',
        tableBg: 'rgba(255, 255, 255, 0.03)',
        tableHover: 'rgba(255, 255, 255, 0.05)',
    },
    light: {
        bg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        bgSolid: '#f8fafc',
        card: 'rgba(255, 255, 255, 0.9)',
        cardBorder: 'rgba(0, 0, 0, 0.08)',
        text: '#1e293b',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        input: 'rgba(0, 0, 0, 0.03)',
        inputBorder: 'rgba(0, 0, 0, 0.1)',
        tableBg: 'rgba(0, 0, 0, 0.02)',
        tableHover: 'rgba(0, 0, 0, 0.04)',
    }
};

export const getTheme = (isDark: boolean) => isDark ? themeColors.dark : themeColors.light;
