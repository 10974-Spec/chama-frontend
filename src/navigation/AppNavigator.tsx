import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginSignupScreen from '../screens/auth/LoginSignupScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import IDVerificationScreen from '../screens/auth/IDVerificationScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';
import OnboardingNavigator from './OnboardingNavigator';
import MainTabNavigator from './MainTabNavigator';
import ChamaDashboard from './ChamaDashboard';
import CreateChamaScreen from '../screens/main/CreateChamaScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import ContributionHistoryScreen from '../screens/main/ContributionHistoryScreen';
import PaymentMethodsScreen from '../screens/main/PaymentMethodsScreen';
import PrivacySecurityScreen from '../screens/main/PrivacySecurityScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import ChamaDetailsScreen from '../screens/main/ChamaDetailsScreen';
import TermsPrivacyScreen from '../screens/main/TermsPrivacyScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import WithdrawalScreen from '../screens/main/WithdrawalScreen';
import { useTheme } from '../theme/ThemeContext';

const Stack = createStackNavigator();

export default function AppNavigator() {
    const { colors, isDark } = useTheme();
    const { isAuthenticated, isLoading, user } = useApp();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    const navigationTheme = isDark ? {
        ...DarkTheme,
        colors: { ...DarkTheme.colors, background: colors.primaryBg, card: colors.card, text: colors.text.dark, border: colors.border }
    } : {
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.white, card: colors.white, text: colors.text.dark, border: colors.border }
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    // Auth Stack
                    <>
                        <Stack.Screen name="Splash" component={SplashScreen} />
                        <Stack.Screen name="LoginSignup" component={LoginSignupScreen} options={{ animationTypeForReplace: 'pop' }} />
                        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
                        <Stack.Screen name="IDVerification" component={IDVerificationScreen} />
                        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                    </>
                ) : user && !user.onboardingCompleted ? (
                    // Onboarding Stack
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                    </>
                ) : (
                    // Main App Stack
                    <>
                        <Stack.Screen name="MainApp" component={MainTabNavigator} />
                        <Stack.Screen name="ChamaDashboard" component={ChamaDashboard} />
                        <Stack.Screen name="ChamaDetails" component={ChamaDetailsScreen} />
                        <Stack.Screen name="CreateChama" component={CreateChamaScreen} />
                        <Stack.Screen name="Settings" component={SettingsScreen} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} />
                        <Stack.Screen name="ContributionHistory" component={ContributionHistoryScreen} />
                        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
                        <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
                        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                        <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />
                        <Stack.Screen name="Withdrawal" component={WithdrawalScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
