import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

export default function SettingsScreen({ navigation }: any) {
    const { colors, isDark, toggleTheme } = useTheme();
    const styles = makeStyles(colors);
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const renderSettingItem = (icon: string, title: string, description: string, value: boolean, onValueChange: (v: boolean) => void) => (
        <View style={styles.settingItem}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={icon as any} size={20} color={colors.primary} />
            </View>
            <View style={styles.settingText}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDesc}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#E0E0E0', true: colors.primary }}
                thumbColor={colors.white}
            />
        </View>
    );

    return (
        <View style={makeStyles(colors).container}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.white} />
            <View style={makeStyles(colors).header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={makeStyles(colors).content}>
                <Text style={makeStyles(colors).sectionTitle}>Notifications</Text>
                {renderSettingItem('notifications-outline', 'Push Notifications', 'Receive alerts on your device', pushEnabled, setPushEnabled)}
                {renderSettingItem('mail-outline', 'Email Alerts', 'Receive weekly summaries via email', emailEnabled, setEmailEnabled)}

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Preferences</Text>
                {renderSettingItem('moon-outline', 'Dark Mode', 'Switch to a darker theme', isDark, toggleTheme)}

                <TouchableOpacity style={styles.linkItem}>
                    <View style={styles.linkContent}>
                        <Ionicons name="language-outline" size={20} color={colors.text.medium} />
                        <Text style={styles.linkText}>Language</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ color: colors.text.muted }}>English</Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkItem}>
                    <View style={styles.linkContent}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.text.medium} />
                        <Text style={styles.linkText}>About this app</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Legal</Text>
                <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('TermsPrivacy', { tab: 'terms' })}>
                    <View style={styles.linkContent}>
                        <Ionicons name="document-text-outline" size={20} color={colors.text.medium} />
                        <Text style={styles.linkText}>Terms of Service</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('TermsPrivacy', { tab: 'privacy' })}>
                    <View style={styles.linkContent}>
                        <Ionicons name="shield-checkmark-outline" size={20} color={colors.text.medium} />
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h5, color: colors.text.dark },
    content: { flex: 1, padding: 20 },
    sectionTitle: { ...typography.bodyMedium, color: colors.text.muted, marginBottom: 12, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 },
    settingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
    iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    settingText: { flex: 1 },
    settingTitle: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 2 },
    settingDesc: { ...typography.caption, color: colors.text.muted },
    linkItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    linkContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    linkText: { ...typography.bodyMedium, color: colors.text.dark },
});
