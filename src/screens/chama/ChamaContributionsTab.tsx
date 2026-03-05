import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, typography, shadows, radii } from '../../theme';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatusDot } from '../../components/ui/Badge';
import { useRoute } from '@react-navigation/native';
import api from '../../services/api';

import { PaymentModal } from '../../components/ui/PaymentModal';
import { useAppContext } from '../../context/AppContext';

export default function ChamaContributionsTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const chamaId = route.params?.chamaId;
    const themeColor = '#2A5C3F';
    const { user } = useAppContext();

    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [payVisible, setPayVisible] = useState(false);

    const fetchMembers = async () => {
        if (!chamaId || chamaId.startsWith('mock-')) return setLoading(false);
        try {
            const res = await api.get(`/chamas/${chamaId}/members`);
            setMembers(res.data);
        } catch (error) {
            console.error('Failed to fetch members for contributions', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [chamaId]);

    const paidCount = members.filter(m => m.paymentStatus === 'paid').length;
    const total = members.length;
    const progress = total > 0 ? paidCount / total : 0;

    const weeklyAmount = 500;
    const currentUserMember = members.find(m => m.userId?._id === user?._id);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
            <ScrollView
                contentContainerStyle={[styles.scroll, currentUserMember?.paymentStatus !== 'paid' && { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMembers(); }} />}
            >
                {/* Total pot */}
                <View style={[styles.potCard, { backgroundColor: themeColor }]}>
                    <Text style={styles.potLabel}>Total Pot This Round (Est)</Text>
                    <Text style={styles.potAmount}>Ksh {total * weeklyAmount}</Text>
                    <Text style={styles.potSub}>Weekly contribution: Ksh {weeklyAmount}/member</Text>

                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Collection Progress</Text>
                            <Text style={styles.progressPct}>{paidCount}/{total} paid</Text>
                        </View>
                        <ProgressBar progress={progress} height={8} />
                    </View>

                    <View style={styles.statRow}>
                        {[
                            { label: 'Collected', value: `Ksh ${paidCount * weeklyAmount}`, color: themeColor },
                            { label: 'Pending', value: `Ksh ${(total - paidCount) * weeklyAmount}`, color: '#F59F00' },
                        ].map(s => (
                            <View key={s.label} style={styles.statBlock}>
                                <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
                                <Text style={styles.statLbl}>{s.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Member Payments</Text>
                {members.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No members found.</Text>
                ) : null}

                {members.map(m => (
                    <View key={m._id} style={styles.memberRow}>
                        {m.userId?.profile?.avatar ? (
                            <Image source={{ uri: m.userId.profile.avatar }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, { backgroundColor: '#DDD', justifyContent: 'center', alignItems: 'center' }]}>
                                <Text style={{ color: '#555', fontSize: 18, fontWeight: 'bold' }}>
                                    {m.userId?.profile?.name?.[0] || '?'}
                                </Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.memberName}>{m.userId?.profile?.name || 'Unknown'}</Text>
                            <Text style={styles.memberAmount}>Ksh {weeklyAmount}</Text>
                        </View>
                        <StatusDot status={m.paymentStatus || 'pending'} showLabel />
                    </View>
                ))}
            </ScrollView>

            {currentUserMember && currentUserMember.paymentStatus !== 'paid' && (
                <View style={styles.stickyFooter}>
                    <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColor }]} activeOpacity={0.9} onPress={() => setPayVisible(true)}>
                        <Text style={styles.payBtnText}>Pay Ksh {weeklyAmount} Now</Text>
                    </TouchableOpacity>
                </View>
            )}

            <PaymentModal
                visible={payVisible}
                onClose={() => setPayVisible(false)}
                amount={weeklyAmount}
                chamaId={chamaId}
                onSuccess={() => { setPayVisible(false); fetchMembers(); }}
            />
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    stickyFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.white,
        padding: 16,
        paddingBottom: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        ...shadows.card
    },
    payBtn: {
        paddingVertical: 16,
        borderRadius: radii.md,
        alignItems: 'center'
    },
    payBtnText: {
        ...typography.button,
        color: colors.white
    },
    scroll: { padding: 14, paddingBottom: 24 },
    potCard: { borderRadius: 20, padding: 20, marginBottom: 18 },
    potLabel: { ...typography.small, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    potAmount: { ...typography.amount, color: colors.white, fontSize: 36, marginBottom: 4 },
    potSub: { ...typography.small, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
    progressSection: { gap: 6, marginBottom: 16 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { ...typography.smallMedium, color: 'rgba(255,255,255,0.8)' },
    progressPct: { ...typography.smallMedium, color: colors.white },
    statRow: { flexDirection: 'row', gap: 12 },
    statBlock: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10, alignItems: 'center' },
    statVal: { ...typography.h4, color: colors.white },
    statLbl: { ...typography.caption, color: 'rgba(255,255,255,0.7)' },
    sectionTitle: { ...typography.bodyMedium, color: colors.text.medium, marginBottom: 10 },
    memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.white, borderRadius: radii.md, padding: 12, marginBottom: 8, ...shadows.card },
    avatar: { width: 42, height: 42, borderRadius: 21 },
    memberName: { ...typography.bodyMedium, color: colors.text.dark },
    memberAmount: { ...typography.small, color: colors.text.muted },
});
