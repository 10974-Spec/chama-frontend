import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { registerForPushNotificationsAsync } from '../services/pushNotifications';

interface User {
    _id: string;
    phoneNumber: string;
    name?: string;
    avatar?: string;
    bio?: string;
    trustScore?: number;
    verified?: boolean;
    contributions?: number;
    payouts?: number;
    chamasJoined?: number;
    onboardingCompleted?: boolean;
    profile?: {
        name?: string;
        avatar?: string;
        bio?: string;
    };
}

interface AppContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => Promise<void>;
    activeChama: string | null;
    setActiveChama: (id: string | null) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeChama, setActiveChama] = useState<string | null>(null);

    const registerPushToken = async () => {
        try {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                await api.post('/notifications/register-token', { pushToken: token });
                console.log('Push token sent to backend');
            }
        } catch (error) {
            console.error('Failed to register push token', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                if (token) {
                    const res = await api.get('/auth/profile');
                    setUser({
                        _id: res.data._id,
                        phoneNumber: res.data.phoneNumber,
                        name: res.data.profile?.name,
                        avatar: res.data.profile?.avatar,
                        trustScore: res.data.trustScore,
                        onboardingCompleted: res.data.onboardingCompleted ?? false,
                    });
                    setIsAuthenticated(true);

                    // Register for push notifications after successful auth recovery
                    registerPushToken();
                }
            } catch (error) {
                console.log('Auth check failed:', error);
                await AsyncStorage.removeItem('userToken');
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (token: string, userData: User) => {
        await AsyncStorage.setItem('userToken', token);
        setUser(userData);
        setIsAuthenticated(true);

        // Register for push notifications after new login
        registerPushToken();
    };

    const logout = async () => {
        await AsyncStorage.removeItem('userToken');
        setUser(null);
        setIsAuthenticated(false);
        setActiveChama(null);
    };

    return (
        <AppContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, activeChama, setActiveChama }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);

export const useApp = () => useContext(AppContext);
