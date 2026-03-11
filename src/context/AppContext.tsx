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
                    try {
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
                        registerPushToken();
                    } catch (apiError: any) {
                        console.log('API call fetch profile failed:', apiError?.message);
                        // If it's a 401 or 403, the token is actively rejected/expired
                        if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
                            console.log('Token expired/invalid, logging out');
                            await AsyncStorage.removeItem('userToken');
                            setIsAuthenticated(false);
                        } else {
                            // If it's a timeout (cold start) or 500, KEEP them logged in!
                            console.log('Network error or cold start, retaining auth state');
                            setIsAuthenticated(true);
                        }
                    }
                }
            } catch (error) {
                console.log('AsyncStorage read error:', error);
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
