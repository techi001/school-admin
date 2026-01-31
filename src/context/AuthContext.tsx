import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    tempPassword: string | null;
    login: (mobileNumber: string, password: string) => Promise<AuthResponse>;
    logout: () => void;
    resetPassword: (newPassword: string) => Promise<void>;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedTempPassword = localStorage.getItem('tempPassword');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        if (storedTempPassword) {
            setTempPassword(storedTempPassword);
        }
        setIsLoading(false);
    }, []);

    const login = async (mobileNumber: string, password: string): Promise<AuthResponse> => {
        const response = await authService.login({ mobileNumber, password });

        setToken(response.token);
        setUser(response.user);

        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        // Store password temporarily for first login reset
        if (response.user.isFirstLogin) {
            setTempPassword(password);
            localStorage.setItem('tempPassword', password);
        }

        return response;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setTempPassword(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tempPassword');
    };

    const resetPassword = async (newPassword: string): Promise<void> => {
        // Use the stored current password for the change-password API
        const currentPassword = tempPassword || '';

        await authService.resetPassword({ newPassword }, currentPassword);

        // Update user's isFirstLogin to false
        if (user) {
            const updatedUser = { ...user, isFirstLogin: false };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        // Clear temporary password
        setTempPassword(null);
        localStorage.removeItem('tempPassword');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        tempPassword,
        login,
        logout,
        resetPassword,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
