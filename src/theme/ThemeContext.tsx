import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as defaultColors } from './colors';

export const lightTheme = { ...defaultColors };

export const darkTheme = {
  ...defaultColors,
  primaryBg: '#121212',
  white: '#1E1E1E',
  black: '#FFFFFF',
  text: {
    dark: '#FFFFFF',
    medium: '#E0E0E0',
    muted: '#AAAAAA',
    light: '#777777',
    placeholder: '#555555',
  },
  border: '#333333',
  card: '#1E1E1E',
  inputBg: '#2A2A2A',
  received: '#2C2C2C',
  sent: '#1A3320',
  gradient: { start: '#1E1E1E', end: '#122518' },
};

const ThemeContext = createContext<{ isDark: boolean; colors: typeof defaultColors; toggleTheme: (val: boolean) => void }>({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(v => { if (v === 'true') setIsDark(true); });
  }, []);

  const toggleTheme = async (v: boolean) => {
    setIsDark(v);
    await AsyncStorage.setItem('darkMode', String(v));
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkTheme : lightTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
export const useTheme = () => useContext(ThemeContext);
