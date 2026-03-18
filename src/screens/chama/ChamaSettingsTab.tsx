import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert, Image, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, radii, shadows } from '../../theme';
import api, { getBaseUrl } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useCustomAlert } from '../../components/ui/CustomAlert';

const THEME_PRESETS = [
    // Reds & Oranges
    '#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#F97316', '#EA580C', '#C2410C', '#9A3412',
    // Ambers & Yellows
    '#F59E0B', '#D97706', '#B45309', '#92400E', '#EAB308', '#CA8A04', '#A16207', '#854D0E',
    // Greens & Limes
    '#84CC16', '#65A30D', '#4D7C0F', '#3F6212', '#22C55E', '#16A34A', '#15803D', '#166534',
    // Emeralds & Teals
    '#10B981', '#059669', '#047857', '#065F46', '#14B8A6', '#0D9488', '#0F766E', '#115E59',
    // Cyans & Skys
    '#06B6D4', '#0891B2', '#0E7490', '#164E63', '#0EA5E9', '#0284C7', '#0369A1', '#075985',
    // Blues & Indigos
    '#3B82F6', '#2563EB', '#1D4ED8', '#1E3A8A', '#6366F1', '#4F46E5', '#4338CA', '#3730A3',
    // Violets & Purples
    '#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#A855F7', '#9333EA', '#7E22CE', '#6B21A8',
    // Fuchsias & Pinks
    '#D946EF', '#C026D3', '#A21CAF', '#86198F', '#EC4899', '#DB2777', '#BE185D', '#9D174D',
    // Roses & Slates
    '#F43F5E', '#E11D48', '#BE123C', '#9F1239', '#64748B', '#475569', '#334155', '#1E293B',
    // Grays & Zincs
    '#6B7280', '#4B5563', '#374151', '#1F2937', '#71717A', '#52525B', '#3F3F46', '#27272A',
    // Neutrals & Stones
    '#737373', '#525252', '#404040', '#262626', '#78716C', '#57534E', '#44403C', '#292524'
];

export default function ChamaSettingsTab({ route }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { chamaId } = route.params || {};
    const { user } = useAppContext();
    const [chama, setChama] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { showAlert, AlertComponent } = useCustomAlert();

    // Basic Details
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Financial Form fields
    const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);
    const [weeklyContribution, setWeeklyContribution] = useState('');
    const [payoutFrequency, setPayoutFrequency] = useState('weekly');
    const [themeColor, setThemeColor] = useState('#2A5C3F');

    // Broadcast
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');
    const [sendingBroadcast, setSendingBroadcast] = useState(false);

    useEffect(() => {
        const fetchChama = async () => {
            if (!chamaId || chamaId.startsWith('mock')) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/chamas/my');
                const found = res.data.find((c: any) => c._id === chamaId);
                if (found) {
                    setChama(found);
                    setName(found.name || '');
                    setDescription(found.description || '');
                    setLogoUrl(found.logo || '');
                    setAutoPayoutEnabled(found.settings?.autoPayoutEnabled || false);
                    setWeeklyContribution(found.settings?.weeklyContribution?.toString() || '');
                    setPayoutFrequency(found.settings?.payoutFrequency || 'weekly');
                    setThemeColor(found.settings?.themeColor || '#2A5C3F');
                }
            } catch (err) {
                console.error("Failed to load settings data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchChama();
    }, [chamaId]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                type: 'image/jpeg',
                name: `chama-logo-${Date.now()}.jpg`
            } as any);

            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const returnedUrl = res.data.url;
            const fullUrl = returnedUrl.startsWith('http')
                ? returnedUrl
                : getBaseUrl().replace('/api', '') + returnedUrl;

            setLogoUrl(fullUrl);
        } catch (error) {
            console.error('Failed to upload logo', error);
            showAlert('error', 'Upload Failed', 'Could not upload the logo image.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.patch(`/chamas/${chamaId}/settings`, {
                name,
                description,
                logo: logoUrl,
                autoPayoutEnabled,
                themeColor,
                weeklyContribution: Number(weeklyContribution),
                payoutFrequency
            });
            DeviceEventEmitter.emit('CHAMA_UPDATED', res.data);
            showAlert('success', 'Settings Saved', 'Settings updated successfully.');
        } catch (error: any) {
            console.error(error);
            showAlert('error', 'Error', error.response?.data?.message || 'Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMessage.trim()) {
            showAlert('warning', 'Empty Message', 'Please enter a message to broadcast.');
            return;
        }
        setSendingBroadcast(true);
        try {
            const res = await api.post(`/chamas/${chamaId}/broadcast`, {
                title: broadcastTitle,
                message: broadcastMessage
            });
            showAlert('success', 'Broadcast Sent', res.data.message || 'Notification delivered to members.');
            setBroadcastTitle('');
            setBroadcastMessage('');
        } catch (error: any) {
            console.error(error);
            showAlert('error', 'Broadcast Failed', error.response?.data?.message || 'Could not send notification.');
        } finally {
            setSendingBroadcast(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Chama',
            'Are you absolutely sure you want to permanently delete this Chama? This action cannot be undone and will destroy all messages, memberships, and records.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/chamas/${chamaId}`);
                            Alert.alert(
                                'Scheduled for Deletion',
                                'This Chama has been locked and will be permanently deleted in 24 hours. You can restore it from the dashboard before then.',
                                [{ text: 'OK', onPress: () => route.params.navigation?.navigate('MainTabs', { screen: 'My Chamas' }) }]
                            );
                        } catch (err: any) {
                            console.error(err);
                            setLoading(false);
                            showAlert('error', 'Delete Failed', err.response?.data?.message || 'Could not delete Chama.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!chama || chama.adminId !== user?._id) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
                <Ionicons name="lock-closed-outline" size={48} color="#ccc" />
                <Text style={{ marginTop: 12, ...typography.bodyMedium, color: colors.text.muted }}>
                    Only the Chama Admin can view or edit settings.
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                {/* ── Basic Details ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Chama Details</Text>

                    <View style={styles.logoSection}>
                        <TouchableOpacity style={styles.logoWrap} onPress={pickImage} disabled={uploadingLogo} activeOpacity={0.8}>
                            {logoUrl ? (
                                <Image source={{ uri: logoUrl }} style={styles.logoImg} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Ionicons name="camera" size={36} color="#A5D6A7" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage} disabled={uploadingLogo}>
                            {uploadingLogo ? <ActivityIndicator color={themeColor} size="small" /> : <Text style={[styles.uploadText, { color: themeColor }]}>Change Logo</Text>}
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.settingLabel, { marginLeft: 16, marginTop: 4 }]}>Chama Name</Text>
                    <View style={styles.inputWrap}>
                        <TextInput style={styles.input} value={name} onChangeText={setName} />
                    </View>

                    <Text style={[styles.settingLabel, { marginLeft: 16 }]}>Description</Text>
                    <View style={[styles.inputWrap, { height: 80, alignItems: 'flex-start' }]}>
                        <TextInput style={[styles.input, { flex: 1, paddingTop: 12, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} multiline />
                    </View>
                </View>

                {/* ── Financial Toggles ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Toggles</Text>

                    <Text style={[styles.settingLabel, { marginLeft: 16, marginTop: 4 }]}>Contribution Amount (KSh)</Text>
                    <View style={styles.inputWrap}>
                        <TextInput style={styles.input} value={weeklyContribution} onChangeText={setWeeklyContribution} keyboardType="numeric" />
                    </View>

                    <Text style={[styles.settingLabel, { marginLeft: 16 }]}>Frequency</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            value={payoutFrequency}
                            onChangeText={setPayoutFrequency}
                            placeholder="e.g. weekly, biweekly, monthly"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={[styles.settingRow, { borderBottomWidth: 0, marginTop: 8 }]}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Automatic Payouts</Text>
                            <Text style={styles.settingDesc}>
                                Automatically disburse funds via M-Pesa to members whose turn it is when a cycle ends.
                            </Text>
                        </View>
                        <Switch
                            value={autoPayoutEnabled}
                            onValueChange={setAutoPayoutEnabled}
                            trackColor={{ false: '#d1d1d1', true: themeColor }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Branding</Text>

                    <Text style={[styles.settingLabel, { marginTop: 12, marginLeft: 16 }]}>Theme Color</Text>
                    <Text style={[styles.settingDesc, { marginLeft: 16, marginBottom: 12 }]}>
                        Select a core accent color for your Chama dashboard.
                    </Text>

                    <View style={styles.colorsGrid}>
                        {THEME_PRESETS.map(hex => (
                            <TouchableOpacity
                                key={hex}
                                style={[
                                    styles.colorOption,
                                    { backgroundColor: hex },
                                    themeColor === hex && styles.colorSelected,
                                    themeColor === hex && { borderColor: hex }
                                ]}
                                onPress={() => setThemeColor(hex)}
                            >
                                {themeColor === hex && <Ionicons name="checkmark" size={24} color={colors.white} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: themeColor }, saving && { opacity: 0.7 }]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.saveBtnText}>Save Settings</Text>
                    )}
                </TouchableOpacity>

                <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={styles.sectionTitle}>Manual Broadcast</Text>
                    <Text style={[styles.settingDesc, { marginLeft: 16, marginBottom: 16, marginRight: 16 }]}>
                        Send an urgent push notification directly to all members of your Chama.
                    </Text>

                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Broadcast Title (Optional)"
                            value={broadcastTitle}
                            onChangeText={setBroadcastTitle}
                        />
                    </View>
                    <View style={[styles.inputWrap, { height: 80, alignItems: 'flex-start' }]}>
                        <TextInput
                            style={[styles.input, { flex: 1, paddingTop: 12, textAlignVertical: 'top' }]}
                            placeholder="Write your message here..."
                            multiline
                            value={broadcastMessage}
                            onChangeText={setBroadcastMessage}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.broadcastBtn, { backgroundColor: themeColor, borderColor: themeColor }, sendingBroadcast && { opacity: 0.7 }]}
                        onPress={handleBroadcast}
                        disabled={sendingBroadcast}
                    >
                        {sendingBroadcast ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={[styles.broadcastText, { color: colors.white }]}>Send Notification</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Danger Zone ── */}
                <View style={[styles.section, { marginTop: 24, borderColor: '#FEE2E2', borderWidth: 1 }]}>
                    <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
                    <Text style={[styles.settingDesc, { marginLeft: 16, marginBottom: 16, marginRight: 16 }]}>
                        Permanently delete this Chama and all its data. This cannot be undone.
                    </Text>

                    <TouchableOpacity
                        style={[styles.broadcastBtn, { backgroundColor: '#FEF2F2', borderColor: '#DC2626' }]}
                        onPress={handleDelete}
                    >
                        <Text style={[styles.broadcastText, { color: '#DC2626' }]}>Delete Chama</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
            <AlertComponent />
        </KeyboardAvoidingView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    content: { padding: 16, paddingBottom: 150 },
    section: {
        backgroundColor: colors.white,
        borderRadius: radii.md,
        paddingVertical: 8,
        marginBottom: 24,
        ...shadows.card
    },
    sectionTitle: {
        ...typography.bodyMedium,
        color: colors.text.dark,
        marginLeft: 16,
        marginTop: 8,
        marginBottom: 8
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
    },
    settingInfo: { flex: 1, paddingRight: 16 },
    settingLabel: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 4 },
    settingDesc: { ...typography.caption, color: colors.text.muted },
    colorsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: '#000',
        transform: [{ scale: 1.1 }]
    },
    saveBtn: {
        paddingVertical: 16,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8
    },
    saveBtnText: { ...typography.button, color: colors.white },
    inputWrap: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.md,
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#FAFAFA'
    },
    input: {
        ...typography.body,
        color: colors.text.dark,
        paddingHorizontal: 12,
        paddingVertical: 12
    },
    broadcastBtn: {
        marginHorizontal: 16,
        marginVertical: 8,
        paddingVertical: 14,
        borderRadius: radii.md,
        borderWidth: 1.5,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center'
    },
    broadcastText: { ...typography.button, color: colors.primary },
    logoSection: {
        alignItems: 'center',
        marginVertical: 16,
    },
    logoWrap: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E8F5E9',
        overflow: 'hidden',
        ...shadows.card
    },
    logoImg: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadBtn: {
        marginTop: 12,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: radii.sm,
        backgroundColor: '#F7F8FA'
    },
    uploadText: {
        ...typography.bodyMedium,
    }
});
