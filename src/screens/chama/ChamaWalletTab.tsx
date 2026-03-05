import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator, FlatList, Modal, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radii, shadows } from '../../theme';
import api from '../../services/api';
import { useRoute } from '@react-navigation/native';
import { useAppContext } from '../../context/AppContext';
import { useCustomAlert } from '../../components/ui/CustomAlert';

export default function ChamaWalletTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const { chamaId, adminId, chama } = route.params || {};
    const themeColor = '#2A5C3F';
    const isActive = chama?.isActive ?? true; // default true to avoid false-blocking
    const { user } = useAppContext();
    const { showAlert, AlertComponent } = useCustomAlert();

    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [totalPot, setTotalPot] = useState(0);

    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawPhone, setWithdrawPhone] = useState((user?.profile as any)?.phone || '');
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [chamasRes, txRes] = await Promise.all([
                api.get('/chamas/my'),
                api.get(`/transactions/chama/${chamaId}`)
            ]);

            const thisChama = chamasRes.data.find((c: any) => c._id === chamaId);
            if (thisChama) {
                setTotalPot(thisChama.totalPot || 0);
            }

            if (txRes.data) {
                // Sort transactions to show recent first
                const sortedTx = txRes.data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setTransactions(sortedTx);
            }
        } catch (error) {
            console.error('Failed to fetch wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chamaId) {
            fetchData();
        }
    }, [chamaId]);

    const handleWithdraw = async () => {
        if (!isActive) {
            showAlert('warning', 'Chama Not Activated', 'Withdrawals are locked until this Chama is activated by the platform.');
            return;
        }
        const amountNum = Number(withdrawAmount);
        if (isNaN(amountNum) || amountNum <= 0) {
            showAlert('warning', 'Invalid Amount', 'Please enter a valid withdrawal amount.');
            return;
        }
        if (amountNum > totalPot) {
            showAlert('error', 'Insufficient Funds', 'The total pot does not have enough funds to cover this withdrawal.');
            return;
        }
        if (!withdrawPhone) {
            showAlert('warning', 'Missing Phone', 'Please provide an M-Pesa number for the withdrawal.');
            return;
        }

        setIsWithdrawing(true);
        try {
            const res = await api.post('/payments/payout', {
                chamaId,
                amount: amountNum,
                phone: withdrawPhone
            });
            showAlert('success', 'Withdrawal Successful', res.data.message || 'Funds have been sent to M-Pesa.');
            setWithdrawModalVisible(false);
            setWithdrawAmount('');
            fetchData();
        } catch (error: any) {
            console.error('Withdraw error', error.response?.data || error.message);
            showAlert('error', 'Withdrawal Failed', error.response?.data?.message || 'Could not process withdrawal.');
        } finally {
            setIsWithdrawing(false);
        }
    };

    const isAdmin = adminId === user?._id;

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Balance Card */}
                <View style={[styles.balanceCard, { backgroundColor: themeColor }]}>
                    <Text style={styles.balanceLabel}>Total Chama Pot</Text>
                    <Text style={styles.balanceAmount}>
                        {isAdmin ? `KSh ${totalPot.toLocaleString()}` : 'KSh ****'}
                    </Text>

                    {isAdmin ? (
                        isActive ? (
                            <TouchableOpacity
                                style={styles.withdrawBtn}
                                onPress={() => setWithdrawModalVisible(true)}
                            >
                                <Ionicons name="cash-outline" size={20} color={themeColor} />
                                <Text style={[styles.withdrawBtnText, { color: themeColor }]}>Withdraw Funds</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={[styles.withdrawBtn, { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.25)' }]}>
                                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.7)" />
                                <Text style={[styles.withdrawBtnText, { color: 'rgba(255,255,255,0.7)' }]}>Withdrawals Locked — Chama Not Active</Text>
                            </View>
                        )
                    ) : (
                        <View style={styles.adminNoteBadge}>
                            <Ionicons name="lock-closed-outline" size={16} color="rgba(255,255,255,0.8)" />
                            <Text style={styles.adminNoteText}>Balance restricted to Admin</Text>
                        </View>
                    )}
                </View>

                {/* Transactions */}
                <Text style={styles.sectionTitle}>Chama Transactions</Text>

                {transactions.length === 0 ? (
                    <Text style={styles.emptyText}>No transactions found for this Chama.</Text>
                ) : (
                    transactions.map((tx, index) => {
                        const isWithdrawal = tx.type === 'withdrawal';
                        const icon = isWithdrawal ? 'arrow-up-circle' : 'arrow-down-circle';
                        const iconColor = isWithdrawal ? '#FA5252' : '#2FB543'; // Red for withdraw, Green for deposit
                        const sign = isWithdrawal ? '-' : '+';
                        const timeStr = tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Recent';

                        return (
                            <View key={tx._id || index} style={styles.txRow}>
                                <View style={styles.txLeft}>
                                    <View style={[styles.txIconWrap, { backgroundColor: iconColor + '15' }]}>
                                        <Ionicons name={icon} size={24} color={iconColor} />
                                    </View>
                                    <View>
                                        <Text style={styles.txTitle}>{isWithdrawal ? 'Withdrawal' : 'Member Contribution'}</Text>
                                        <Text style={styles.txTime}>{timeStr}</Text>
                                    </View>
                                </View>
                                <View style={styles.txRight}>
                                    <Text style={[styles.txAmount, { color: isWithdrawal ? '#1A1A1A' : iconColor }]}>
                                        {sign}KSh {tx.amount?.toLocaleString()}
                                    </Text>
                                    <Text style={styles.txStatus}>{tx.status}</Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Withdraw Modal */}
            <Modal visible={withdrawModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Withdraw to M-Pesa</Text>
                            <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalDesc}>
                            Enter the amount you wish to withdraw and the receiving M-Pesa phone number. This action is B2C instantaneous.
                        </Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Withdraw Amount (KSh)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g 1000"
                                keyboardType="numeric"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>M-Pesa Number</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="07xx xxx xxx"
                                keyboardType="phone-pad"
                                value={withdrawPhone}
                                onChangeText={setWithdrawPhone}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: themeColor, opacity: isWithdrawing ? 0.7 : 1 }]}
                            onPress={handleWithdraw}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Confirm Withdrawal</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <AlertComponent />
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    balanceCard: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        ...shadows.card,
        elevation: 6,
    },
    balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginBottom: 4 },
    balanceAmount: { color: colors.white, fontSize: 32, fontWeight: '800', marginBottom: 20 },
    withdrawBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: colors.white,
        paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
        ...shadows.button
    },
    withdrawBtnText: { fontSize: 15, fontWeight: '700' },
    adminNoteBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    adminNoteText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '500' },

    sectionTitle: { ...typography.h4, color: colors.text.dark, marginBottom: 12, marginLeft: 4 },
    emptyText: { textAlign: 'center', color: colors.text.muted, marginTop: 40 },

    txRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: colors.white, padding: 16, borderRadius: radii.lg, marginBottom: 10,
        ...shadows.card
    },
    txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    txIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    txTitle: { fontSize: 15, fontWeight: '600', color: colors.text.dark },
    txTime: { fontSize: 13, color: colors.text.muted, marginTop: 2 },
    txRight: { alignItems: 'flex-end' },
    txAmount: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    txStatus: { fontSize: 12, color: colors.text.muted, textTransform: 'capitalize' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    modalTitle: { ...typography.h3, color: colors.text.dark },
    modalDesc: { ...typography.body, color: colors.text.muted, marginBottom: 24 },
    inputGroup: { marginBottom: 16 },
    inputLabel: { ...typography.smallMedium, color: colors.text.dark, marginBottom: 8 },
    input: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, color: colors.text.dark },
    submitBtn: { height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    submitBtnText: { ...typography.button, color: colors.white },
});
