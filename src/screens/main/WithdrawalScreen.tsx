import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, StatusBar, ActivityIndicator, Modal, Image,
    FlatList, Animated, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

const GREEN = '#2A5C3F';
const GREEN_LIGHT = '#3A7D54';
const WHITE = '#FFFFFF';

// ── Fee table ──────────────────────────────────────────────────────────────
const MPESA_FEES: { max: number; fee: number }[] = [
    { max: 100, fee: 0 },
    { max: 2500, fee: 25 },
    { max: 5000, fee: 40 },
    { max: 10000, fee: 60 },
    { max: 35000, fee: 100 },
    { max: 150000, fee: 200 },
    { max: 250000, fee: 300 },
    { max: 500000, fee: 400 },
];
const getFee = (amount: number, method: string) => {
    if (method === 'bank') return 0; // Bank fees handled by Safaricom internally
    const band = MPESA_FEES.find(b => amount <= b.max);
    return band ? band.fee : 400;
};

// ── Flow step component ────────────────────────────────────────────────────
function FlowDiagram({ method }: { method: 'mpesa' | 'bank' }) {


    const steps = method === 'mpesa'
        ? [
            { icon: 'wallet-outline', label: 'Chama Wallet', sub: 'Funds reserved' },
            { icon: 'cloud-outline', label: 'Your Backend', sub: 'Validates & routes' },
            { icon: 'logo-usd', label: 'Safaricom B2C', sub: 'Instant transfer' },
            { icon: 'phone-portrait-outline', label: 'M-Pesa', sub: 'Recipient gets cash' },
        ]
        : [
            { icon: 'wallet-outline', label: 'Chama Wallet', sub: 'Funds reserved' },
            { icon: 'cloud-outline', label: 'Your Backend', sub: 'Validates & schedules' },
            { icon: 'logo-usd', label: 'Safaricom B2C', sub: 'Bank routing enabled' },
            { icon: 'business-outline', label: 'Bank Account', sub: 'Credited within 24h' },
        ];

    return (
        <View style={styles.flowWrap}>
            <Text style={styles.flowTitle}>How this works</Text>
            <View style={styles.flowRow}>
                {steps.map((s, i) => (
                    <View key={i} style={styles.flowStepWrap}>
                        <View style={[styles.flowStepCircle, i === steps.length - 1 && styles.flowStepCircleFinal]}>
                            <Ionicons name={s.icon as any} size={18} color={WHITE} />
                        </View>
                        <Text style={styles.flowStepLabel}>{s.label}</Text>
                        <Text style={styles.flowStepSub}>{s.sub}</Text>
                        {i < steps.length - 1 && (
                            <View style={styles.flowArrow}>
                                <Ionicons name="chevron-forward" size={14} color={GREEN} />
                            </View>
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
}

// ── Security badge strip ───────────────────────────────────────────────────
function SecurityBadges({ method }: { method: 'mpesa' | 'bank' }) {


    const badges = [
        { icon: 'shield-checkmark-outline', text: '2FA Required' },
        { icon: 'time-outline', text: method === 'bank' ? '24h Processing' : 'Instant' },
        { icon: 'trending-up-outline', text: 'KSh 500k /day limit' },
        { icon: 'document-text-outline', text: 'Audit Logged' },
    ];
    return (
        <View style={styles.badgesRow}>
            {badges.map((b, i) => (
                <View key={i} style={styles.badge}>
                    <Ionicons name={b.icon as any} size={13} color={GREEN} />
                    <Text style={styles.badgeText}>{b.text}</Text>
                </View>
            ))}
        </View>
    );
}

// ── Bank Logo with initials fallback ────────────────────────────────────────
function BankLogo({ uri, name, size = 36 }: { uri: string; name: string; size?: number }) {


    const [failed, setFailed] = useState(false);
    const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    if (failed) {
        return (
            <View style={[styles.bankInitials, { width: size, height: size, borderRadius: size / 2 }]}>
                <Text style={styles.bankInitialsText}>{initials}</Text>
            </View>
        );
    }
    return (
        <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F0F0F0' }}
            onError={() => setFailed(true)}
            resizeMode="contain"
        />
    );
}

// ── OTP Modal ──────────────────────────────────────────────────────────────
function OtpModal({
    visible, onClose, onConfirm, loading, sandboxOtp,
}: {
    visible: boolean;
    onClose: () => void;
    onConfirm: (otp: string) => void;
    loading: boolean;
    sandboxOtp?: string;
}) {
    const [otp, setOtp] = useState('');
    const inputs = useRef<(TextInput | null)[]>([]);

    const handleChange = (val: string, idx: number) => {
        const digits = val.replace(/\D/g, '');
        const newOtp = otp.split('');
        newOtp[idx] = digits.slice(-1);
        setOtp(newOtp.join(''));
        if (digits && idx < 5) inputs.current[idx + 1]?.focus();
        if (!digits && idx > 0) inputs.current[idx - 1]?.focus();
    };

    useEffect(() => {
        if (!visible) setOtp('');
    }, [visible]);

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <TouchableOpacity style={styles.otpOverlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.otpSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.otpIconWrap}>
                        <Ionicons name="lock-closed" size={32} color={GREEN} />
                    </View>
                    <Text style={styles.otpTitle}>Confirm Withdrawal</Text>
                    <Text style={styles.otpSub}>
                        Enter the 6-digit OTP sent to your phone to authorise this withdrawal.
                    </Text>
                    {sandboxOtp && (
                        <View style={styles.sandboxBanner}>
                            <Ionicons name="bug-outline" size={14} color="#7c5c00" />
                            <Text style={styles.sandboxBannerText}>Sandbox OTP: {sandboxOtp}</Text>
                        </View>
                    )}
                    <View style={styles.otpInputRow}>
                        {[0, 1, 2, 3, 4, 5].map(i => (
                            <TextInput
                                key={i}
                                ref={r => { inputs.current[i] = r; }}
                                style={[styles.otpBox, otp[i] ? styles.otpBoxFilled : null]}
                                keyboardType="number-pad"
                                maxLength={1}
                                value={otp[i] || ''}
                                onChangeText={v => handleChange(v, i)}
                                selectTextOnFocus
                            />
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[styles.confirmBtn, (otp.length < 6 || loading) && styles.confirmBtnDisabled]}
                        disabled={otp.length < 6 || loading}
                        onPress={() => onConfirm(otp)}
                    >
                        {loading ? (
                            <ActivityIndicator color={WHITE} size="small" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={18} color={WHITE} />
                                <Text style={styles.confirmBtnText}>Confirm Withdrawal</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}

// ── Bank selector modal ────────────────────────────────────────────────────
function BankSelectorModal({
    visible, banks, onSelect, onClose,
}: {
    visible: boolean;
    banks: any[];
    onSelect: (bank: any) => void;
    onClose: () => void;
}) {
    const [query, setQuery] = useState('');
    const filtered = banks.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.code.includes(query) ||
        b.swift?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.bankModalOverlay}>
                <View style={styles.bankModalSheet}>
                    <View style={styles.sheetHandle} />
                    <View style={styles.bankModalHeader}>
                        <Text style={styles.bankModalTitle}>Select Bank</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={22} color="#555" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bankSearch}>
                        <Ionicons name="search-outline" size={16} color="#BDBDBD" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.bankSearchInput}
                            placeholder="Search bank name, code, SWIFT..."
                            placeholderTextColor="#BDBDBD"
                            value={query}
                            onChangeText={setQuery}
                            autoFocus
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <Ionicons name="close-circle" size={16} color="#BDBDBD" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item.code}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.bankRow} onPress={() => { onSelect(item); onClose(); setQuery(''); }}>
                                <BankLogo uri={item.logoUrl} name={item.name} size={40} />
                                <View style={styles.bankRowInfo}>
                                    <Text style={styles.bankRowName}>{item.name}</Text>
                                    <Text style={styles.bankRowMeta}>
                                        Code: {item.code}  ·  SWIFT: {item.swift || '—'}
                                    </Text>
                                    <Text style={styles.bankRowFormat}>{item.accountDigits}</Text>
                                </View>
                                <View style={[styles.b2cTag, { backgroundColor: item.b2cEnabled ? '#E8F5E9' : '#FFF3E0' }]}>
                                    <Text style={[styles.b2cTagText, { color: item.b2cEnabled ? GREEN : '#E65100' }]}>
                                        {item.b2cEnabled ? 'B2C ✓' : 'Limited'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={{ textAlign: 'center', color: '#BDBDBD', marginTop: 40 }}>No banks found</Text>
                        }
                    />
                </View>
            </View>
        </Modal>
    );
}

// ─── Success overlay ────────────────────────────────────────────────────────
function SuccessOverlay({ visible, data, onDone }: { visible: boolean; data: any; onDone: () => void }) {
    const scale = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        if (visible) {
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();
        }
    }, [visible]);

    if (!visible) return null;
    return (
        <View style={styles.successOverlay}>
            <Animated.View style={[styles.successCard, { transform: [{ scale }] }]}>
                <LinearGradient colors={[GREEN_LIGHT, GREEN, '#1B3D28']} style={styles.successIconWrap}>
                    <Ionicons name="checkmark-circle" size={56} color={WHITE} />
                </LinearGradient>
                <Text style={styles.successTitle}>
                    {data?.method === 'bank' ? 'Transfer Scheduled!' : 'Withdrawal Initiated!'}
                </Text>
                <Text style={styles.successSub}>{data?.message}</Text>

                <View style={styles.successDetailBox}>
                    <View style={styles.successRow}>
                        <Text style={styles.successRowLabel}>Reference</Text>
                        <Text style={styles.successRowVal}>{data?.referenceId}</Text>
                    </View>
                    {data?.scheduledAt && (
                        <View style={styles.successRow}>
                            <Text style={styles.successRowLabel}>Expected by</Text>
                            <Text style={styles.successRowVal}>{new Date(data.scheduledAt).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                        </View>
                    )}
                    <View style={styles.successRow}>
                        <Text style={styles.successRowLabel}>Remaining pot</Text>
                        <Text style={[styles.successRowVal, { color: GREEN, fontWeight: '700' }]}>
                            KSh {(data?.remainingPot || 0).toLocaleString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.doneBtn} onPress={onDone}>
                    <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ══════════════════════════════════════════════════════════════════════════════
export default function WithdrawalScreen({ navigation, route }: any) {


    const { chama } = route.params || {};

    const [method, setMethod] = useState<'mpesa' | 'bank'>('mpesa');

    // M-Pesa fields
    const [phone, setPhone] = useState('');

    // Bank fields
    const [banks, setBanks] = useState<any[]>([]);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [showBankModal, setShowBankModal] = useState(false);
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    // Common
    const [amount, setAmount] = useState('');
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [recentWithdrawals, setRecentWithdrawals] = useState<any[]>([]);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

    // OTP
    const [showOtp, setShowOtp] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [sandboxOtp, setSandboxOtp] = useState<string | undefined>();
    const [submitting, setSubmitting] = useState(false);

    // Result
    const [result, setResult] = useState<any>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const numAmount = parseFloat(amount.replace(/,/g, '')) || 0;
    const fee = getFee(numAmount, method);
    const total = numAmount - fee;

    // Load banks and withdrawals once
    useEffect(() => {
        const load = async () => {
            setLoadingBanks(true);
            try {
                const res = await api.get('/payments/banks');
                setBanks(res.data);
            } catch {
                setBanks([]);
            } finally {
                setLoadingBanks(false);
            }
        };
        const loadWithdrawals = async () => {
            if (!chama?._id) return;
            setLoadingWithdrawals(true);
            try {
                const res = await api.get(`/transactions/chama/${chama._id}`);
                const txs = (res.data || []).filter((tx: any) => tx.type === 'withdrawal');
                setRecentWithdrawals(txs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5));
            } catch {
                setRecentWithdrawals([]);
            } finally {
                setLoadingWithdrawals(false);
            }
        };
        load();
        loadWithdrawals();
    }, [chama?._id]);

    const handleRequestOtp = async () => {
        // Validate first
        if (numAmount <= 0) return Alert.alert('Error', 'Please enter a valid amount');
        if (method === 'mpesa' && !phone) return Alert.alert('Error', 'Enter recipient phone number');
        if (method === 'bank' && !selectedBank) return Alert.alert('Error', 'Select a bank');
        if (method === 'bank' && !accountNumber) return Alert.alert('Error', 'Enter account number');
        if (!chama?._id) return Alert.alert('Error', 'Chama not found');

        setSendingOtp(true);
        try {
            const r = await api.post('/payments/withdrawal-otp');
            setSandboxOtp(r.data?.sandboxOtp);
            setShowOtp(true);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally {
            setSendingOtp(false);
        }
    };

    const handleConfirm = async (otp: string) => {
        setSubmitting(true);
        try {
            const payload: any = {
                chamaId: chama._id,
                amount: numAmount,
                method,
                otp,
            };
            if (method === 'mpesa') payload.phone = phone;
            if (method === 'bank') {
                payload.bankCode = selectedBank?.code;
                payload.bankName = selectedBank?.name;
                payload.accountNumber = accountNumber;
                payload.accountHolder = accountHolder;
            }
            const res = await api.post('/payments/withdraw', payload);
            setResult(res.data);
            setShowOtp(false);
            setShowSuccess(true);
        } catch (e: any) {
            Alert.alert('Withdrawal Failed', e.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isValid = numAmount > 0 && (
        method === 'mpesa' ? !!phone :
            (!!selectedBank && !!accountNumber)
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={GREEN} />

            {/* Header gradient */}
            <LinearGradient colors={[GREEN_LIGHT, GREEN, '#1B3D28']} style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={WHITE} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.headerTitle}>Withdraw Funds</Text>
                    <Text style={styles.headerSub}>{chama?.name || 'Chama Wallet'}</Text>
                </View>
                <View style={styles.balancePill}>
                    <Text style={styles.balancePillLabel}>Balance</Text>
                    <Text style={styles.balancePillAmount}>KSh {(chama?.totalPot || 0).toLocaleString()}</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Method selector ── */}
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, method === 'mpesa' && styles.tabActive]}
                        onPress={() => setMethod('mpesa')}
                    >
                        <Ionicons name="phone-portrait-outline" size={16} color={method === 'mpesa' ? WHITE : GREEN} />
                        <Text style={[styles.tabText, method === 'mpesa' && styles.tabTextActive]}>M-Pesa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, method === 'bank' && styles.tabActive]}
                        onPress={() => setMethod('bank')}
                    >
                        <Ionicons name="business-outline" size={16} color={method === 'bank' ? WHITE : GREEN} />
                        <Text style={[styles.tabText, method === 'bank' && styles.tabTextActive]}>Bank Account</Text>
                    </TouchableOpacity>
                </View>

                {/* ── Flow diagram ── */}
                <FlowDiagram method={method} />

                {/* ── Security badges ── */}
                <SecurityBadges method={method} />

                {/* ── Amount ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Amount to Withdraw</Text>
                    <View style={styles.amountRow}>
                        <Text style={styles.currencyLabel}>KSh</Text>
                        <TextInput
                            style={styles.amountInput}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#BDBDBD"
                            value={amount}
                            onChangeText={setAmount}
                        />
                    </View>
                    {numAmount > 0 && (
                        <View style={styles.feeBox}>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>Withdrawal amount</Text>
                                <Text style={styles.feeVal}>KSh {numAmount.toLocaleString()}</Text>
                            </View>
                            <View style={styles.feeRow}>
                                <Text style={styles.feeLabel}>
                                    {method === 'mpesa' ? 'M-Pesa transaction fee' : 'Bank routing fee'}
                                </Text>
                                <Text style={styles.feeVal}>
                                    {method === 'mpesa' ? `– KSh ${fee}` : 'Included by Safaricom'}
                                </Text>
                            </View>
                            <View style={[styles.feeRow, styles.feeRowTotal]}>
                                <Text style={styles.feeTotalLabel}>Recipient receives</Text>
                                <Text style={styles.feeTotalVal}>KSh {method === 'mpesa' ? total.toLocaleString() : numAmount.toLocaleString()}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ── M-Pesa fields ── */}
                {method === 'mpesa' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Recipient Phone (M-Pesa)</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons name="call-outline" size={18} color="#BDBDBD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="07XX XXX XXX"
                                placeholderTextColor="#BDBDBD"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>
                        <Text style={styles.inputHint}>Safaricom B2C — funds arrive instantly</Text>
                    </View>
                )}

                {/* ── Bank fields ── */}
                {method === 'bank' && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Bank Details</Text>

                        {/* Bank selector */}
                        <TouchableOpacity style={styles.bankSelector} onPress={() => setShowBankModal(true)}>
                            {selectedBank ? (
                                <>
                                    <BankLogo uri={selectedBank.logoUrl} name={selectedBank.name} size={36} />
                                    <View style={styles.bankSelectorInfo}>
                                        <Text style={styles.bankSelectorName}>{selectedBank.name}</Text>
                                        <Text style={styles.bankSelectorMeta}>
                                            CBK Code: {selectedBank.code}  ·  SWIFT: {selectedBank.swift || '—'}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.bankSelectorPlaceholderIcon}>
                                        <Ionicons name="business-outline" size={20} color={GREEN} />
                                    </View>
                                    <Text style={styles.bankSelectorPlaceholder}>
                                        {loadingBanks ? 'Loading banks...' : 'Select Bank'}
                                    </Text>
                                </>
                            )}
                            <Ionicons name="chevron-down" size={18} color="#BDBDBD" style={{ marginLeft: 'auto' }} />
                        </TouchableOpacity>

                        {/* Account Number */}
                        <View style={[styles.inputWrap, { marginTop: 12 }]}>
                            <Ionicons name="card-outline" size={18} color="#BDBDBD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder={selectedBank ? `Account No. (${selectedBank.accountDigits})` : 'Account Number'}
                                placeholderTextColor="#BDBDBD"
                                keyboardType="number-pad"
                                value={accountNumber}
                                onChangeText={setAccountNumber}
                            />
                        </View>

                        {/* Account Holder */}
                        <View style={[styles.inputWrap, { marginTop: 10 }]}>
                            <Ionicons name="person-outline" size={18} color="#BDBDBD" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Account Holder Name (optional)"
                                placeholderTextColor="#BDBDBD"
                                value={accountHolder}
                                onChangeText={setAccountHolder}
                            />
                        </View>

                        <View style={styles.bankNoticeBox}>
                            <Ionicons name="information-circle-outline" size={16} color="#1565C0" />
                            <Text style={styles.bankNoticeText}>
                                Bank transfers are processed via Safaricom B2C to Bank routing. Funds arrive within{' '}
                                <Text style={{ fontWeight: '700' }}>24 hours</Text>. Your Chama balance is reserved immediately.
                            </Text>
                        </View>

                        {/* Daraja B2C requirement note */}
                        <View style={styles.warningBox}>
                            <Ionicons name="warning-outline" size={15} color="#E65100" />
                            <Text style={styles.warningText}>
                                B2C-to-Bank requires Safaricom to enable <Text style={{ fontWeight: '700' }}>bank routing</Text> on your shortcode.
                                Contact Safaricom Daraja support to activate this feature before using in production.
                            </Text>
                        </View>
                    </View>
                )}

                {/* ── Recent Withdrawals ── */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.feeTableToggle}
                        disabled={true}
                    >
                        <Ionicons name="time-outline" size={15} color={GREEN} />
                        <Text style={styles.feeTableToggleText}>Recent Withdrawals</Text>
                    </TouchableOpacity>

                    {loadingWithdrawals ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator color={GREEN} />
                        </View>
                    ) : recentWithdrawals.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Ionicons name="wallet-outline" size={32} color="#E0E0E0" style={{ marginBottom: 8 }} />
                            <Text style={{ textAlign: 'center', color: '#9E9E9E' }}>No recent withdrawals found.</Text>
                        </View>
                    ) : (
                        <View style={styles.feeTable}>
                            <View style={styles.feeTableHeader}>
                                <Text style={styles.feeTableHead}>Date</Text>
                                <Text style={styles.feeTableHead}>Amount (KSh)</Text>
                            </View>
                            {recentWithdrawals.map((tx, i) => (
                                <View key={tx._id || i} style={[styles.feeTableRow, i % 2 === 0 && styles.feeTableRowAlt]}>
                                    <Text style={styles.feeTableCell}>
                                        {new Date(tx.timestamp).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                                    </Text>
                                    <Text style={[styles.feeTableCell, { fontWeight: '700' }]}>
                                        {tx.amount.toLocaleString()}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* ── Sticky bottom button ── */}
            <View style={styles.bottomBar}>
                <View style={styles.btnShadow}>
                    <TouchableOpacity
                        style={[styles.submitBtnWrap, !isValid && styles.submitBtnDisabled]}
                        disabled={!isValid || sendingOtp}
                        onPress={handleRequestOtp}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={isValid ? [GREEN_LIGHT, GREEN, '#1B3D28'] : ['#BDBDBD', '#9E9E9E']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.submitBtn}
                        >
                            {sendingOtp ? (
                                <ActivityIndicator color={WHITE} size="small" />
                            ) : (
                                <>
                                    <Ionicons name="lock-closed-outline" size={18} color={WHITE} />
                                    <Text style={styles.submitBtnText}>
                                        Confirm Withdrawal · KSh {numAmount.toLocaleString() || '0'}
                                    </Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Modals ── */}
            <BankSelectorModal
                visible={showBankModal}
                banks={banks}
                onSelect={b => { setSelectedBank(b); setAccountNumber(''); }}
                onClose={() => setShowBankModal(false)}
            />

            <OtpModal
                visible={showOtp}
                onClose={() => setShowOtp(false)}
                onConfirm={handleConfirm}
                loading={submitting}
                sandboxOtp={sandboxOtp}
            />

            <SuccessOverlay
                visible={showSuccess}
                data={result}
                onDone={() => { setShowSuccess(false); navigation.goBack(); }}
            />
        </View>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },

    // Header
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingTop: 56, paddingBottom: 20, paddingHorizontal: 20,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: WHITE },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
    balancePill: {
        alignItems: 'flex-end',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    },
    balancePillLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5 },
    balancePillAmount: { fontSize: 15, fontWeight: '800', color: WHITE },

    // Scroll
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 20 },

    // Method tabs
    tabRow: {
        flexDirection: 'row', backgroundColor: WHITE, borderRadius: 16,
        padding: 4, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
    },
    tabActive: { backgroundColor: GREEN },
    tabText: { fontSize: 14, fontWeight: '700', color: GREEN },
    tabTextActive: { color: WHITE },

    // Flow diagram
    flowWrap: {
        backgroundColor: WHITE, borderRadius: 18, padding: 16, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    flowTitle: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
    flowRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    flowStepWrap: { alignItems: 'center', flex: 1, position: 'relative' },
    flowStepCircle: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN,
        alignItems: 'center', justifyContent: 'center', marginBottom: 8,
    },
    flowStepCircleFinal: { backgroundColor: '#1B3D28' },
    flowStepLabel: { fontSize: 10, fontWeight: '700', color: '#333', textAlign: 'center' },
    flowStepSub: { fontSize: 9, color: '#9E9E9E', textAlign: 'center', marginTop: 2 },
    flowArrow: {
        position: 'absolute', top: 13, right: -6, zIndex: 1,
    },

    // Security badges
    badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#E8F5E9', borderRadius: 999,
        paddingHorizontal: 10, paddingVertical: 5,
    },
    badgeText: { fontSize: 11, fontWeight: '600', color: GREEN },

    // Section
    section: {
        backgroundColor: WHITE, borderRadius: 18, padding: 18, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },

    // Amount
    amountRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: GREEN, paddingBottom: 8, marginBottom: 4 },
    currencyLabel: { fontSize: 22, fontWeight: '800', color: '#333', marginRight: 8 },
    amountInput: { flex: 1, fontSize: 32, fontWeight: '800', color: '#1A1A1A', padding: 0 },

    // Fee box
    feeBox: { backgroundColor: '#F7F9F7', borderRadius: 12, padding: 14, marginTop: 12, gap: 8 },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    feeLabel: { fontSize: 13, color: '#666' },
    feeVal: { fontSize: 13, color: '#333', fontWeight: '600' },
    feeRowTotal: { borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 8, marginTop: 4 },
    feeTotalLabel: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    feeTotalVal: { fontSize: 15, fontWeight: '800', color: GREEN },

    // Inputs
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 12,
        paddingHorizontal: 14, height: 50,
        borderWidth: 1, borderColor: '#EBEBEB',
    },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, fontSize: 15, color: '#1A1A1A', padding: 0 },
    inputHint: { fontSize: 11, color: '#9E9E9E', marginTop: 6 },

    // Bank selector
    bankSelector: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#F5F5F5', borderRadius: 14,
        padding: 14, borderWidth: 1, borderColor: '#EBEBEB',
    },
    bankSelectorPlaceholderIcon: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    },
    bankSelectorPlaceholder: { fontSize: 15, color: '#BDBDBD' },
    bankSelectorInfo: { flex: 1 },
    bankSelectorName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    bankSelectorMeta: { fontSize: 11, color: '#9E9E9E', marginTop: 2 },

    // Bank initials fallback
    bankInitials: {
        backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center',
    },
    bankInitialsText: { fontSize: 13, fontWeight: '800', color: WHITE },

    // Bank notice
    bankNoticeBox: {
        flexDirection: 'row', gap: 8, backgroundColor: '#E3F2FD',
        borderRadius: 10, padding: 12, marginTop: 14,
    },
    bankNoticeText: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18 },

    warningBox: {
        flexDirection: 'row', gap: 8, backgroundColor: '#FFF3E0',
        borderRadius: 10, padding: 12, marginTop: 10,
    },
    warningText: { flex: 1, fontSize: 12, color: '#E65100', lineHeight: 18 },

    // Fee table
    feeTableToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    feeTableToggleText: { fontSize: 13, fontWeight: '700', color: GREEN },
    feeTable: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
    feeTableHeader: { flexDirection: 'row', backgroundColor: GREEN, paddingVertical: 8, paddingHorizontal: 14 },
    feeTableHead: { flex: 1, fontSize: 12, fontWeight: '700', color: WHITE },
    feeTableRow: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 14 },
    feeTableRowAlt: { backgroundColor: '#F8FCF8' },
    feeTableCell: { flex: 1, fontSize: 12, color: '#444' },

    // Bottom bar
    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: 24, paddingBottom: 38, paddingTop: 14,
        backgroundColor: 'rgba(248,249,250,0.97)',
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    btnShadow: {
        borderRadius: 999, shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
        backgroundColor: GREEN,
    },
    submitBtnWrap: { borderRadius: 999, overflow: 'hidden' },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16, borderRadius: 999,
    },
    submitBtnText: { fontSize: 15, fontWeight: '800', color: WHITE },

    // OTP Modal
    otpOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    otpSheet: {
        backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 24, paddingBottom: 44, paddingTop: 14,
    },
    sheetHandle: {
        width: 40, height: 5, backgroundColor: '#E0E0E0',
        borderRadius: 3, alignSelf: 'center', marginBottom: 20,
    },
    otpIconWrap: {
        width: 68, height: 68, borderRadius: 34, backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
    },
    otpTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
    otpSub: { fontSize: 13, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
    sandboxBanner: {
        flexDirection: 'row', gap: 6, alignItems: 'center',
        backgroundColor: '#FFF8E1', borderRadius: 10, padding: 10, marginBottom: 16,
    },
    sandboxBannerText: { fontSize: 13, color: '#7c5c00', fontWeight: '600' },
    otpInputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    otpBox: {
        width: 46, height: 56, borderRadius: 14,
        borderWidth: 2, borderColor: '#E0E0E0',
        backgroundColor: '#F5F5F5',
        fontSize: 22, fontWeight: '800', color: '#1A1A1A',
        textAlign: 'center',
    },
    otpBoxFilled: { borderColor: GREEN, backgroundColor: '#E8F5E9' },
    confirmBtn: {
        flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
        backgroundColor: GREEN, borderRadius: 999, paddingVertical: 16,
    },
    confirmBtnDisabled: { backgroundColor: '#BDBDBD' },
    confirmBtnText: { fontSize: 15, fontWeight: '800', color: WHITE },

    // Bank modal
    bankModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    bankModalSheet: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: WHITE, borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingTop: 14, paddingBottom: 0, height: '85%',
    },
    bankModalHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 12,
    },
    bankModalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    bankSearch: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', marginHorizontal: 20, margin: 10,
        borderRadius: 12, paddingHorizontal: 14, height: 46,
        borderWidth: 1, borderColor: '#EBEBEB',
    },
    bankSearchInput: { flex: 1, fontSize: 14, color: '#1A1A1A', padding: 0 },
    bankRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
        paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5', gap: 12,
    },
    bankRowInfo: { flex: 1 },
    bankRowName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    bankRowMeta: { fontSize: 11, color: '#9E9E9E', marginTop: 2 },
    bankRowFormat: { fontSize: 11, color: '#BDBDBD', marginTop: 1 },
    b2cTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    b2cTagText: { fontSize: 11, fontWeight: '700' },

    // Success overlay
    successOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center', justifyContent: 'center', zIndex: 999,
    },
    successCard: {
        width: '88%', backgroundColor: WHITE, borderRadius: 28,
        padding: 28, alignItems: 'center',
    },
    successIconWrap: {
        width: 90, height: 90, borderRadius: 45,
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    successTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    successSub: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 21, marginBottom: 20 },
    successDetailBox: { width: '100%', backgroundColor: '#F7FAF7', borderRadius: 14, padding: 16, gap: 10, marginBottom: 20 },
    successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    successRowLabel: { fontSize: 13, color: '#777' },
    successRowVal: { fontSize: 13, color: '#1A1A1A', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: 8 },
    doneBtn: {
        width: '100%', backgroundColor: GREEN, borderRadius: 999,
        paddingVertical: 15, alignItems: 'center',
    },
    doneBtnText: { fontSize: 16, fontWeight: '800', color: WHITE },
});
