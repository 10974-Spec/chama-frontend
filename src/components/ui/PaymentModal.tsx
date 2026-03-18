import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    amount: number;
    chamaId: string;
    type?: 'contribution' | 'registration' | 'subscription';
    onSuccess?: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ visible, onClose, amount, chamaId, type = 'contribution', onSuccess }) => {
    const { user } = useAppContext();
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [loading, setLoading] = useState(false);

    let fee = 0;
    if (type === 'registration' || type === 'subscription') {
        fee = 0;
    } else {
        if (amount <= 500) fee = 10;
        else if (amount <= 5000) fee = 20;
        else fee = 30;
    }

    const totalAmount = amount + fee;

    const handlePayment = async () => {
        if (!phone) {
            Alert.alert("Missing Phone", "Please provide your M-Pesa phone number.");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/payments/stkpush', {
                amount,
                phone,
                chamaId,
                type
            });
            Alert.alert(
                "M-Pesa Prompt Sent",
                "Please check your phone and enter your M-Pesa PIN to complete the transaction.",
                [{ text: "OK", onPress: () => { onClose(); onSuccess?.(); } }]
            );
        } catch (error: any) {
            console.error('STK Push Error:', error.response?.data || error.message);
            Alert.alert("Payment Failed", error.response?.data?.message || "Could not initiate M-Pesa push.");
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    const content = (
        <View style={Platform.OS === 'web' ? [styles.overlay, { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }] as any : styles.overlay}>
            <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose} disabled={loading}>
                    <Ionicons name="close" size={24} color={colors.text.dark} />
                </TouchableOpacity>

                <View style={styles.headerIcon}>
                    <Ionicons name="phone-portrait-outline" size={32} color={colors.primary} />
                </View>

                <Text style={styles.title}>{type === 'registration' ? 'Registration Fee' : 'Make Contribution'}</Text>
                <Text style={styles.subtitle}>Pay via M-Pesa</Text>

                <View style={styles.amountBox}>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={styles.amountLabel}>{type === 'registration' ? 'Onboarding Fee' : 'Contribution Amount'}</Text>
                        <Text style={[styles.amountLabel, { color: colors.text.dark }]}>Ksh {amount}</Text>
                    </View>
                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12 }}>
                        <Text style={styles.amountLabel}>Platform Fee</Text>
                        <Text style={[styles.amountLabel, { color: colors.text.dark }]}>Ksh {fee}</Text>
                    </View>
                    <Text style={styles.amountLabel}>Total to Pay</Text>
                    <Text style={styles.amountValue}>Ksh {totalAmount}</Text>
                </View>

                <Text style={styles.inputLabel}>M-Pesa Phone Number</Text>
                <View style={styles.inputWrap}>
                    <Ionicons name="call-outline" size={18} color={colors.text.placeholder} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="e.g. 254712345678"
                        placeholderTextColor={colors.text.placeholder}
                        keyboardType="phone-pad"
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.payBtn, loading && { opacity: 0.7 }]}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.payBtnText}>Pay Now</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    if (Platform.OS === 'web') return content;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {content}
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        ...shadows.card
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 10,
        padding: 4
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16
    },
    title: {
        ...typography.h3,
        color: colors.text.dark,
        textAlign: 'center',
        marginBottom: 4
    },
    subtitle: {
        ...typography.body,
        color: colors.text.medium,
        textAlign: 'center',
        marginBottom: 24
    },
    amountBox: {
        backgroundColor: '#FAFAFA',
        borderRadius: radii.md,
        padding: 16,
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: colors.border
    },
    amountLabel: {
        ...typography.smallMedium,
        color: colors.text.muted,
        marginBottom: 4
    },
    amountValue: {
        ...typography.h2,
        color: colors.primary
    },
    inputLabel: {
        ...typography.smallMedium,
        color: colors.text.muted,
        marginBottom: 8
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: radii.md,
        paddingHorizontal: 12,
        marginBottom: 24,
        backgroundColor: '#FAFAFA'
    },
    inputIcon: {
        marginRight: 8
    },
    input: {
        flex: 1,
        ...typography.body,
        color: colors.text.dark,
        paddingVertical: 14,
    },
    payBtn: {
        backgroundColor: colors.primary,
        borderRadius: radii.lg,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button
    },
    payBtnText: {
        ...typography.button,
        color: colors.white
    }
});
