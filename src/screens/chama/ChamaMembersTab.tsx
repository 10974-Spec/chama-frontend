import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
    ActivityIndicator, RefreshControl, Share, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, radii } from '../../theme';
import { StatusDot, Badge } from '../../components/ui/Badge';
import { useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import PendingRequestsModal from '../../components/ui/PendingRequestsModal';
import AddExternalMemberModal from '../../components/ui/AddExternalMemberModal';
import { useCustomAlert } from '../../components/ui/CustomAlert';

const roleColors: Record<string, string> = {
    admin: colors.primary,
    treasurer: '#F59F00',
    secretary: '#4DABF7',
    member: colors.text.muted,
};

export default function ChamaMembersTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const { chamaId, adminId, inviteCode, chama } = route.params || {};
    const themeColor = '#2A5C3F';
    const { user } = useAppContext();
    const { showAlert, AlertComponent } = useCustomAlert();

    const [members, setMembers] = useState<any[]>([]);
    const [externalMembers, setExternalMembers] = useState<any[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showAddExternal, setShowAddExternal] = useState(false);
    const [promptingId, setPromptingId] = useState<string | null>(null);

    const isAdmin = user?._id === adminId;
    const weeklyAmount = chama?.settings?.weeklyContribution || 0;

    const handleInvite = async () => {
        try {
            const link = `https://chama.app/invite?code=${inviteCode}`;
            await Share.share({
                message: `Join my Chama on the Chama App! Click this link to join or use my invite code: ${inviteCode}\n\n${link}`,
                title: 'Join my Chama'
            });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchData = async () => {
        if (!chamaId || chamaId.startsWith('mock-')) return setLoading(false);

        // Members — critical
        try {
            const res = await api.get(`/chamas/${chamaId}/members`);
            setMembers(res.data);
        } catch (error) {
            console.error('Failed to fetch members', error);
        }

        // External members — non-critical (new route)
        try {
            const res = await api.get(`/chamas/${chamaId}/external-members`);
            setExternalMembers(res.data);
        } catch {
            // Silently ignore — route may not be available in older server builds
        }

        // Pending requests — admin only
        if (isAdmin) {
            try {
                const reqRes = await api.get(`/chamas/${chamaId}/requests`);
                setPendingCount(reqRes.data.length);
            } catch {
                // Non-critical
            }
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => { fetchData(); }, [chamaId]);

    const handlePrompt = async (member: any) => {
        setPromptingId(member._id);
        try {
            const res = await api.post(`/chamas/${chamaId}/external-members/${member._id}/prompt`);
            showAlert('success', 'STK Push Sent!', res.data.message || `Payment prompt sent to ${member.name}.`);
        } catch (err: any) {
            showAlert('error', 'Prompt Failed', err?.response?.data?.message || 'Could not send STK push.');
        } finally {
            setPromptingId(null);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }

    const paidCount = members.filter(m => m.paymentStatus === 'paid').length;

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />}
            >
                {/* Header / Admin controls */}
                <View style={styles.headerContainer}>
                    {members.length > 0 && (
                        <View style={styles.summary}>
                            <Text style={styles.summaryText}>{members.length} members  •  {paidCount} paid this week</Text>
                        </View>
                    )}

                    {isAdmin && (
                        <View style={{ gap: 10 }}>
                            {/* Join Requests button */}
                            {pendingCount > 0 && (
                                <TouchableOpacity
                                    style={[styles.adminBtn, { backgroundColor: '#FFF3E0', borderColor: '#FFB300', borderWidth: 1.5 }]}
                                    onPress={() => setShowRequests(true)}
                                >
                                    <Ionicons name="time-outline" size={18} color="#F57C00" />
                                    <Text style={[styles.adminBtnText, { color: '#F57C00' }]}>
                                        {pendingCount} Pending Join Request{pendingCount !== 1 ? 's' : ''}
                                    </Text>
                                    <View style={styles.pendingBadge}>
                                        <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}

                            {/* Invite member */}
                            <TouchableOpacity style={[styles.adminBtn, { backgroundColor: themeColor }]} onPress={handleInvite}>
                                <Ionicons name="person-add" size={18} color={colors.white} />
                                <Text style={[styles.adminBtnText, { color: colors.white }]}>Invite Member (Code)</Text>
                            </TouchableOpacity>

                            {/* Add external */}
                            <TouchableOpacity
                                style={[styles.adminBtn, { backgroundColor: '#E8F5E9', borderColor: themeColor, borderWidth: 1.5 }]}
                                onPress={() => setShowAddExternal(true)}
                            >
                                <Ionicons name="phone-portrait-outline" size={18} color={themeColor} />
                                <Text style={[styles.adminBtnText, { color: themeColor }]}>+ Add External Member</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Regular Members */}
                <Text style={styles.sectionTitle}>Members ({members.length})</Text>
                {members.map(item => {
                    const name = item.userId?.profile?.name || 'Unknown User';
                    const role = item.role || 'member';
                    let roleColor = roleColors[role.toLowerCase()] || colors.text.muted;
                    if (role.toLowerCase() === 'admin') roleColor = themeColor;

                    return (
                        <View key={item._id} style={styles.row}>
                            {item.userId?.profile?.avatar ? (
                                <Image source={{ uri: item.userId.profile.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatar, { backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Text style={{ color: '#555', fontSize: 18, fontWeight: 'bold' }}>
                                        {name[0]?.toUpperCase() || '?'}
                                    </Text>
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <View style={styles.nameRow}>
                                    <Text style={styles.name}>{name}</Text>
                                    <Badge label={role} color={roleColor + '20'} textColor={roleColor} />
                                </View>
                                <View style={styles.metaRow}>
                                    <Ionicons name="shield-outline" size={12} color={themeColor} />
                                    <Text style={styles.trust}>{item.userId?.trustScore || 0} trust</Text>
                                    <StatusDot status={item.paymentStatus as any} showLabel />
                                </View>
                            </View>
                            <TouchableOpacity style={styles.menuBtn}>
                                <Ionicons name="ellipsis-vertical" size={18} color={colors.text.muted} />
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {/* External Members Section */}
                {(externalMembers.length > 0 || isAdmin) && (
                    <>
                        <View style={styles.externalHeader}>
                            <Ionicons name="phone-portrait-outline" size={16} color="#888" />
                            <Text style={styles.sectionTitle}>External Members ({externalMembers.length})</Text>
                        </View>
                        <Text style={styles.externalSubtitle}>Non-smartphone members — pay via STK push</Text>

                        {externalMembers.length === 0 ? (
                            <Text style={styles.emptyExternal}>No external members yet.</Text>
                        ) : (
                            externalMembers.map(ext => {
                                const isPrompting = promptingId === ext._id;
                                const lastPaid = ext.lastPaidAt ? new Date(ext.lastPaidAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : 'Never';

                                return (
                                    <View key={ext._id} style={styles.externalRow}>
                                        <View style={[styles.avatar, styles.extAvatar]}>
                                            <Ionicons name="person-outline" size={20} color="#2A5C3F" />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.name}>{ext.name}</Text>
                                            <Text style={styles.trust}>{ext.phone}  •  Last paid: {lastPaid}</Text>
                                        </View>
                                        {isAdmin && (
                                            <TouchableOpacity
                                                onPress={() => handlePrompt(ext)}
                                                disabled={isPrompting}
                                                style={styles.promptBtn}
                                            >
                                                {isPrompting ? (
                                                    <ActivityIndicator size="small" color="#fff" />
                                                ) : (
                                                    <>
                                                        <Ionicons name="send-outline" size={14} color="#fff" />
                                                        <Text style={styles.promptBtnText}>Prompt</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modals */}
            <PendingRequestsModal
                visible={showRequests}
                chamaId={chamaId}
                onClose={() => setShowRequests(false)}
                onChanged={fetchData}
            />
            <AddExternalMemberModal
                visible={showAddExternal}
                chamaId={chamaId}
                chamaName={chama?.name || 'this Chama'}
                weeklyAmount={weeklyAmount}
                onClose={() => setShowAddExternal(false)}
                onAdded={member => setExternalMembers(prev => [member, ...prev])}
            />
            <AlertComponent />
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    headerContainer: { padding: 14, gap: 12 },
    summary: { backgroundColor: colors.primaryBg, borderRadius: 12, padding: 12 },
    summaryText: { ...typography.smallMedium, color: colors.primary, textAlign: 'center' },

    adminBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
    adminBtnText: { ...typography.button, flex: 1 },
    pendingBadge: { backgroundColor: '#F57C00', minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
    pendingBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },

    sectionTitle: { ...typography.bodyMedium, color: colors.text.dark, fontWeight: '700', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4 },
    externalHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingTop: 20 },
    externalSubtitle: { ...typography.caption, color: colors.text.muted, paddingHorizontal: 14, marginBottom: 8 },
    emptyExternal: { ...typography.small, color: '#aaa', textAlign: 'center', paddingVertical: 12, fontStyle: 'italic' },

    row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radii.md, padding: 12, marginBottom: 8, marginHorizontal: 14, ...shadows.card },
    externalRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FAFFF8', borderRadius: radii.md, padding: 12, marginBottom: 8, marginHorizontal: 14, borderWidth: 1, borderColor: '#C8E6C9' },

    avatar: { width: 46, height: 46, borderRadius: 23 },
    extAvatar: { backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    name: { ...typography.bodyMedium, color: colors.text.dark, flex: 1 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trust: { ...typography.caption, color: colors.text.muted, flex: 1 },
    menuBtn: { padding: 4 },

    promptBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#2A5C3F', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
    promptBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
