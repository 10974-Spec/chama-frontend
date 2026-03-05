import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

export default function PrivacySecurityScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const [biometrics, setBiometrics] = useState(true);
    const [publicProfile, setPublicProfile] = useState(false);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Security Settings</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContent}>
                        <Text style={styles.settingTitle}>Face ID / Touch ID</Text>
                        <Text style={styles.settingDesc}>Use biometrics to securely log in</Text>
                    </View>
                    <Switch value={biometrics} onValueChange={setBiometrics} trackColor={{ false: '#E0E0E0', true: colors.primary }} thumbColor={colors.white} />
                </View>

                <TouchableOpacity style={styles.linkItem}>
                    <View style={styles.settingTextContent}>
                        <Text style={styles.settingTitle}>Change Password</Text>
                        <Text style={styles.settingDesc}>Update your account password</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                </TouchableOpacity>

                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Privacy Controls</Text>

                <View style={styles.settingItem}>
                    <View style={styles.settingTextContent}>
                        <Text style={styles.settingTitle}>Public Profile</Text>
                        <Text style={styles.settingDesc}>Allow other Chamas to find your profile</Text>
                    </View>
                    <Switch value={publicProfile} onValueChange={setPublicProfile} trackColor={{ false: '#E0E0E0', true: colors.primary }} thumbColor={colors.white} />
                </View>

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
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    linkItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
    settingTextContent: { flex: 1, paddingRight: 20 },
    settingTitle: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 4 },
    settingDesc: { ...typography.caption, color: colors.text.muted },
});
