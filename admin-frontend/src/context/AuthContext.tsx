import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthenticatedUser, LoginRequest, LoginResponse } from '../types/auth';
import type { ApiSuccess } from '../types/shared';
import { apiFetch, setAccessToken, clearTokens, getAccessToken } from '../utils/api';

interface AuthContextType {
    user: AuthenticatedUser | null;
    isLoading: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = getAccessToken();
        const storedUser = localStorage.getItem('user_data');
        if (token && storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                clearTokens();
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        const response = await apiFetch<ApiSuccess<LoginResponse>>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        const { tokens, user: userData } = response.data;
        
        // Admins and Super Admins only
        if (userData.role !== 'admin' && userData.role !== 'super_admin' && userData.role !== 'sub_admin') {
            throw new Error("Unauthorized: Insufficient permissions for admin panel.");
        }
        
        setAccessToken(tokens.accessToken);
        localStorage.setItem('user_data', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        clearTokens();
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
