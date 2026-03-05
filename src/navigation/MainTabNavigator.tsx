import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import HomeFeedScreen from '../screens/main/HomeFeedScreen';
import MyChamasScreen from '../screens/main/MyChamasScreen';
import BrowseChamaScreen from '../screens/main/BrowseChamaScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();

const tabIcons: Record<string, { active: string; inactive: string }> = {
    Home: { active: 'home', inactive: 'home-outline' },
    MyChamas: { active: 'people', inactive: 'people-outline' },
    Browse: { active: 'search', inactive: 'search-outline' },
    Notifications: { active: 'notifications', inactive: 'notifications-outline' },
    Profile: { active: 'person', inactive: 'person-outline' },
};

const tabLabels: Record<string, string> = {
    Home: 'Home',
    MyChamas: 'My Chamas',
    Browse: 'Browse',
    Notifications: 'Alerts',
    Profile: 'Profile',
};

export default function MainTabNavigator() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text.muted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color, size }) => {
                    const icons = tabIcons[route.name];
                    return <Ionicons name={(focused ? icons.active : icons.inactive) as any} size={22} color={color} />;
                },
                tabBarLabel: tabLabels[route.name],
            })}
        >
            <Tab.Screen name="Home" component={HomeFeedScreen} />
            <Tab.Screen name="MyChamas" component={MyChamasScreen} />
            <Tab.Screen name="Browse" component={BrowseChamaScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    tabBar: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        height: 68,
        paddingBottom: 10,
        paddingTop: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 10,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '500',
    },
});
