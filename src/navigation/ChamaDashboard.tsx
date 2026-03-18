import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, StatusBar, TextInput, Alert, DeviceEventEmitter } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { typography } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';
import { PaymentModal } from '../components/ui/PaymentModal';

import ChamaFeedTab from '../screens/chama/ChamaFeedTab';
import ChamaChatTab from '../screens/chama/ChamaChatTab';
import ChamaWalletTab from '../screens/chama/ChamaWalletTab';
import ChamaMembersTab from '../screens/chama/ChamaMembersTab';
import ChamaContributionsTab from '../screens/chama/ChamaContributionsTab';
import ChamaMeetingsTab from '../screens/chama/ChamaMeetingsTab';
import ChamaVotesTab from '../screens/chama/ChamaVotesTab';
import ChamaCalendarTab from '../screens/chama/ChamaCalendarTab';
import ChamaSettingsTab from '../screens/chama/ChamaSettingsTab';

const Tab = createMaterialTopTabNavigator();

const WHITE = '#FFFFFF';
const PRIMARY_GREEN = '#2A5C3F';

export default function ChamaDashboard({ route, navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const initialChama = route.params?.chama || { name: 'Mazingira Sacco', logo: 'https://i.pravatar.cc/80?img=11', members: 12, amount: 100, frequency: 'Weekly', isActive: true };
    const [liveChama, setLiveChama] = useState<any>(initialChama);
    const { user } = useAppContext();
    const [payVisible, setPayVisible] = useState(false);

    const themeColor = liveChama.settings?.themeColor || PRIMARY_GREEN;

    const isLocked = liveChama.subscriptionStatus === 'locked';
    const isTrial = liveChama.subscriptionStatus === 'trial' || !liveChama.subscriptionStatus;

    // Calculate trial days left
    let trialDaysLeft = 0;
    if (isTrial) {
        const endDate = liveChama.trialEndsAt ? new Date(liveChama.trialEndsAt) : new Date(new Date(liveChama.createdAt || Date.now()).getTime() + 7 * 24 * 60 * 60 * 1000);
        const diff = endDate.getTime() - new Date().getTime();
        trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    const isPendingDeletion = !!liveChama.deletionScheduledAt;
    const [cancelName, setCancelName] = useState('');
    const [canceling, setCanceling] = useState(false);

    const handleCancelDeletion = async () => {
        if (cancelName.trim().toLowerCase() !== liveChama.name.trim().toLowerCase()) {
            Alert.alert('Name Mismatch', 'Please type the exact Chama name to confirm restoration.');
            return;
        }
        setCanceling(true);
        try {
            await api.patch(`/chamas/${liveChama._id}/cancel-deletion`, { name: cancelName });
            setLiveChama({ ...liveChama, deletionScheduledAt: null });
            setCancelName('');
            Alert.alert('Restored', 'The Chama has been successfully restored and the deletion was canceled.');
        } catch (error: any) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel deletion.');
        } finally {
            setCanceling(false);
        }
    };

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('CHAMA_UPDATED', (updatedChama) => {
            if (updatedChama._id === liveChama._id) {
                setLiveChama(updatedChama);
            }
        });
        return () => sub.remove();
    }, [liveChama._id]);

    useFocusEffect(
        useCallback(() => {
            const fetchChama = async () => {
                if (!liveChama._id) return;
                try {
                    const res = await api.get('/chamas/my');
                    const found = res.data.find((c: any) => c._id === liveChama._id);
                    if (found) {
                        setLiveChama(found);
                    }
                } catch (e) {
                    console.error("Error fetching live chama data for theming", e);
                }
            };
            fetchChama();
        }, [liveChama._id])
    );

    return (
        <View style={{ flex: 1, backgroundColor: WHITE }}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {/* Top Navigation Bar */}
            <View style={styles.topNav}>
                <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.navIconBtn}>
                    <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    {isTrial && (
                        <TouchableOpacity
                            style={styles.topTrialBadge}
                            onPress={() => { if (user?._id === liveChama.adminId) setPayVisible(true); }}
                        >
                            <Ionicons name="time-outline" size={14} color="#F57F17" />
                            <Text style={styles.topTrialText}>{trialDaysLeft}d Trial</Text>
                        </TouchableOpacity>
                    )}
                    {user?._id === liveChama.adminId && (
                        <TouchableOpacity
                            style={styles.withdrawNavBtn}
                            onPress={() => navigation?.navigate('Withdrawal', { chama: liveChama })}
                        >
                            <Ionicons name="arrow-up-circle-outline" size={15} color={WHITE} />
                            <Text style={styles.withdrawNavBtnText}>Withdraw</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.navIconBtn}>
                        <Ionicons name="ellipsis-vertical" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Profile Info Section */}
            <View style={styles.profileSection}>
                <Image source={{ uri: liveChama.logo }} style={[styles.profileAvatar, { borderColor: themeColor }]} />
                <Text style={styles.profileTitle}>{liveChama.name}</Text>
                <Text style={styles.profileSubtitle}>Ksh {liveChama.settings?.weeklyContribution || liveChama.amount || 0} · {liveChama.settings?.payoutFrequency || liveChama.frequency || 'Weekly'}</Text>


            </View>

            {isPendingDeletion ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FEF2F2' }}>
                    <Ionicons name="warning" size={64} color="#DC2626" style={{ marginBottom: 16 }} />
                    <Text style={{ ...typography.h3, color: '#DC2626', textAlign: 'center', marginBottom: 8 }}>Pending Deletion</Text>

                    {user?._id === liveChama.adminId ? (
                        <>
                            <Text style={{ ...typography.body, color: '#7F1D1D', textAlign: 'center', marginBottom: 24 }}>
                                This account has been scheduled for permanent deletion and takes 24 hours to be wiped completely.
                            </Text>
                            <View style={{ width: '100%', backgroundColor: WHITE, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FCA5A5' }}>
                                <Text style={{ ...typography.bodyMedium, color: '#450a0a', marginBottom: 8 }}>To restore, type Chama name:</Text>
                                <TextInput
                                    style={{ borderWidth: 1, borderColor: '#FCA5A5', padding: 12, borderRadius: 8, marginBottom: 16, backgroundColor: '#FEF2F2', color: '#450a0a' }}
                                    placeholder={liveChama.name}
                                    placeholderTextColor="#f87171"
                                    value={cancelName}
                                    onChangeText={setCancelName}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={{ backgroundColor: '#DC2626', padding: 14, borderRadius: 8, alignItems: 'center', opacity: canceling ? 0.7 : 1 }}
                                    onPress={handleCancelDeletion}
                                    disabled={canceling}
                                >
                                    <Text style={{ color: WHITE, fontWeight: '700' }}>
                                        {canceling ? 'Restoring...' : 'Cancel Deletion'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <Text style={{ ...typography.body, color: '#7F1D1D', textAlign: 'center', marginBottom: 24 }}>
                            This Chama is currently unavailable because it has been scheduled for deletion by the administrator.
                        </Text>
                    )}
                </View>
            ) : isLocked ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FAFAFA' }}>
                    <Ionicons name="lock-closed" size={64} color={colors.text.placeholder} style={{ marginBottom: 16 }} />
                    <Text style={{ ...typography.h3, color: colors.text.dark, textAlign: 'center', marginBottom: 8 }}>Chama Locked</Text>
                    {user?._id === liveChama.adminId ? (
                        <>
                            <Text style={{ ...typography.body, color: colors.text.medium, textAlign: 'center', marginBottom: 24 }}>
                                Your 7-day free trial has expired. Please pay Ksh 500 to continue using the chama and unlock access for your members.
                            </Text>
                            <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColor }]} onPress={() => setPayVisible(true)}>
                                <Text style={styles.payBtnText}>Pay Ksh 500 to Unlock</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <Text style={{ ...typography.body, color: colors.text.medium, textAlign: 'center', marginBottom: 24 }}>
                            This Chama is currently locked. Please contact your admin to renew the subscription.
                        </Text>
                    )}
                </View>
            ) : (
                <Tab.Navigator
                    screenOptions={{
                        tabBarScrollEnabled: true,
                        tabBarActiveTintColor: themeColor,
                        tabBarInactiveTintColor: '#9E9E9E',
                        tabBarIndicatorStyle: { backgroundColor: themeColor, height: 2.5, borderRadius: 2 },
                        tabBarStyle: { backgroundColor: WHITE, elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
                        tabBarLabelStyle: { fontSize: 14, fontWeight: '500', textTransform: 'none' },
                        tabBarItemStyle: { width: 'auto', paddingHorizontal: 16 },
                    }}
                >
                    <Tab.Screen name="Feed" component={ChamaFeedTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Wallet" component={ChamaWalletTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId, chama: liveChama }} />
                    <Tab.Screen name="Members" component={ChamaMembersTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId, inviteCode: liveChama.inviteCode, chama: liveChama }} />
                    <Tab.Screen name="Chat" component={ChamaChatTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Contributions" component={ChamaContributionsTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Meetings" component={ChamaMeetingsTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Calendar" component={ChamaCalendarTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Votes" component={ChamaVotesTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                    <Tab.Screen name="Settings" component={ChamaSettingsTab} initialParams={{ chamaId: liveChama._id, themeColor, adminId: liveChama.adminId }} />
                </Tab.Navigator>
            )}

            <PaymentModal
                visible={payVisible}
                onClose={() => setPayVisible(false)}
                amount={500}
                chamaId={liveChama._id}
                type="subscription"
                onSuccess={() => {
                    setPayVisible(false);
                    setLiveChama({ ...liveChama, subscriptionStatus: 'active', isActive: true });
                }}
            />
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    /* Top Nav */
    topNav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, paddingTop: 52, paddingBottom: 12,
        backgroundColor: WHITE,
    },
    navIconBtn: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5',
    },

    /* Main Profile Section */
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 24,
        backgroundColor: WHITE,
    },
    profileAvatar: {
        width: 72, height: 72, borderRadius: 36, borderWidth: 3,
        marginBottom: 12, backgroundColor: '#F5F5F5',
    },
    profileTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 6 },
    profileSubtitle: { fontSize: 13, color: '#757575', fontWeight: '500' },
    payBtn: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 12
    },
    payBtnText: {
        ...typography.button,
        color: WHITE
    },
    withdrawNavBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#2A5C3F', borderRadius: 999,
        paddingHorizontal: 12, paddingVertical: 7,
    },
    withdrawNavBtnText: { fontSize: 12, fontWeight: '700', color: WHITE },
    topTrialBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#FFF8E1', borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 6,
        borderWidth: 1, borderColor: '#FFECB3'
    },
    topTrialText: { fontSize: 11, fontWeight: '700', color: '#F57F17' },
});
