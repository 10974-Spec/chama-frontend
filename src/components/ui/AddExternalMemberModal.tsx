import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useCustomAlert } from './CustomAlert';

interface AddExternalMemberModalProps {
    visible: boolean;
    chamaId: string;
    chamaName: string;
    weeklyAmount: number;
    onClose: () => void;
    onAdded: (member: any) => void;
}

const PRIMARY = '#2A5C3F';

export default function AddExternalMemberModal({ visible, chamaId, chamaName, weeklyAmount, onClose, onAdded }: AddExternalMemberModalProps) {
    const { showAlert, AlertComponent } = useCustomAlert();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [addedMember, setAddedMember] = useState<any>(null);

    const handleAdd = async () => {
        if (!name.trim() || !phone.trim()) {
            showAlert('warning', 'Missing Info', 'Please enter the member\'s name and M-Pesa phone number.');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/chamas/${chamaId}/external-members`, { name, phone, note });
            setAddedMember(res.data.member);
            setSuccess(true);
            onAdded(res.data.member);
        } catch (err: any) {
            showAlert('error', 'Failed to Add', err?.response?.data?.message || 'Could not add the external member.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setAddedMember(null);
        setName(''); setPhone(''); setNote('');
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                            <Ionicons name="close" size={22} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Add External Member</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {success ? (
                        <View style={styles.successWrap}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                            </View>
                            <Text style={styles.successTitle}>STK Push Sent!</Text>
                            <Text style={styles.successText}>
                                <Text style={{ fontWeight: '800' }}>{addedMember?.name}</Text>
                                {' '}has been added to {chamaName}. An M-Pesa prompt of{' '}
                                <Text style={{ fontWeight: '800', color: PRIMARY }}>Ksh {weeklyAmount}</Text>
                                {' '}has been sent to{' '}
                                <Text style={{ fontWeight: '800' }}>{addedMember?.phone}</Text>.
                            </Text>
                            <Text style={styles.promptHint}>
                                On future fee days, find them in the External Members list and tap "Prompt" to send again without re-entering details.
                            </Text>
                            <TouchableOpacity style={styles.submitBtnWrap} onPress={handleClose}>
                                <LinearGradient colors={['#4CAF50', PRIMARY, '#1B3D28']} style={styles.submitBtn}>
                                    <Text style={styles.submitBtnText}>Done</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
                            {/* Amount chip */}
                            <View style={styles.amountChip}>
                                <Ionicons name="cash-outline" size={18} color={PRIMARY} />
                                <Text style={styles.amountChipText}>
                                    Fee: <Text style={{ fontWeight: '800', color: PRIMARY }}>Ksh {weeklyAmount}</Text> per week
                                </Text>
                            </View>

                            <Text style={styles.sectionLabel}>Member Details</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor="#BDBDBD"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="M-Pesa Phone Number (e.g. 0712345678)"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholderTextColor="#BDBDBD"
                            />
                            <TextInput
                                style={[styles.input, { height: 90, paddingTop: 14 }]}
                                placeholder="Notes (optional, e.g. location, relationship...)"
                                value={note}
                                onChangeText={setNote}
                                multiline
                                textAlignVertical="top"
                                placeholderTextColor="#BDBDBD"
                            />

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle-outline" size={20} color="#F5A623" />
                                <Text style={styles.infoText}>
                                    After adding, an M-Pesa STK push of Ksh {weeklyAmount} will immediately be sent to the member's phone.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.submitBtnWrap, { marginTop: 24 }]}
                                onPress={handleAdd}
                                disabled={submitting}
                            >
                                <LinearGradient colors={['#4CAF50', PRIMARY, '#1B3D28']} style={styles.submitBtn}>
                                    {submitting ? <ActivityIndicator color="#fff" /> : (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <Ionicons name="person-add" size={20} color="#fff" />
                                            <Text style={styles.submitBtnText}>Add & Prompt</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    )}
                </View>
            </KeyboardAvoidingView>
            <AlertComponent />
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },

    form: { padding: 24, paddingBottom: 60 },
    amountChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 20 },
    amountChipText: { fontSize: 14, color: '#333' },

    sectionLabel: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    input: { backgroundColor: '#F7F8FA', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1A1A1A', marginBottom: 12, borderWidth: 1, borderColor: '#EBEBEB' },

    infoBox: { flexDirection: 'row', backgroundColor: '#FFF9E6', borderRadius: 12, padding: 14, gap: 10, marginTop: 4, borderWidth: 1, borderColor: '#FFE082', alignItems: 'flex-start' },
    infoText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },

    submitBtnWrap: { borderRadius: 999, overflow: 'hidden' },
    submitBtn: { height: 58, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

    successWrap: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 16 },
    successIcon: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A' },
    successText: { fontSize: 15, color: '#444', lineHeight: 24, textAlign: 'center' },
    promptHint: { fontSize: 13, color: '#888', lineHeight: 20, textAlign: 'center', backgroundColor: '#F7F8FA', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#EBEBEB' },
});
