import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';
import { useCustomAlert } from './CustomAlert';

interface JoinApplicationSheetProps {
    visible: boolean;
    chamaId: string;
    chamaName: string;
    onClose: () => void;
    onSubmitted: () => void;
    /** If true, this join bypasses the approval flow (invite code path) */
    inviteCode?: string;
}

const PRIMARY = '#2A5C3F';

export default function JoinApplicationSheet({ visible, chamaId, chamaName, onClose, onSubmitted, inviteCode }: JoinApplicationSheetProps) {
    const { showAlert, AlertComponent } = useCustomAlert();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [note, setNote] = useState('');
    const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const pickIdPhoto = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
            showAlert('warning', 'Permission Required', 'Please allow photo library access to upload your ID.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
        if (result.canceled || !result.assets[0]) return;

        const asset = result.assets[0];
        setIdPhotoUri(asset.uri);
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', { uri: asset.uri, type: asset.mimeType || 'image/jpeg', name: 'id_photo.jpg' } as any);
            const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setIdPhotoUrl(res.data.url || res.data.fileUrl);
        } catch {
            showAlert('error', 'Upload Failed', 'Could not upload the ID photo. Try again.');
            setIdPhotoUri(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !phone.trim()) {
            showAlert('warning', 'Missing Info', 'Please fill in your name and phone number.');
            return;
        }
        if (!note.trim()) {
            showAlert('warning', 'Missing Reason', 'Please explain why you want to join this Chama.');
            return;
        }

        setSubmitting(true);
        try {
            const target = inviteCode || chamaId;
            await api.post(`/chamas/${target}/join`, {
                note,
                idPhotoUrl,
                nationalId,
            });
            setSubmitted(true);
        } catch (err: any) {
            showAlert('error', 'Submission Failed', err?.response?.data?.message || 'Could not submit your application.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitted) onSubmitted();
        else onClose();
        // reset
        setSubmitted(false);
        setName(''); setPhone(''); setNationalId(''); setNote('');
        setIdPhotoUri(null); setIdPhotoUrl(null);
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                            <Ionicons name="close" size={22} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{inviteCode ? 'Join via Code' : 'Apply to Join'}</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {submitted ? (
                        /* ── Success state ────────────────────────────── */
                        <View style={styles.successWrap}>
                            <View style={styles.successIcon}>
                                <Ionicons name="time-outline" size={56} color="#F5A623" />
                            </View>
                            <Text style={styles.successTitle}>Application Submitted!</Text>
                            <Text style={styles.successText}>
                                Your request to join{' '}
                                <Text style={{ fontWeight: '800', color: PRIMARY }}>{chamaName}</Text>
                                {' '}has been sent to the admin. You'll be notified once it's reviewed.
                            </Text>
                            <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                                <LinearGradient colors={['#4CAF50', PRIMARY, '#1B3D28']} style={styles.doneBtnGrad}>
                                    <Text style={styles.doneBtnText}>Got it</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* ── Form ─────────────────────────────────────── */
                        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                            <Text style={styles.sectionLabel}>Your Details</Text>

                            <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} placeholderTextColor="#BDBDBD" />
                            <TextInput style={styles.input} placeholder="Phone Number (M-Pesa)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor="#BDBDBD" />
                            <TextInput style={styles.input} placeholder="National ID Number" value={nationalId} onChangeText={setNationalId} keyboardType="numeric" placeholderTextColor="#BDBDBD" />

                            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Why do you want to join?</Text>
                            <TextInput
                                style={[styles.input, styles.textarea]}
                                placeholder="Explain your reason for joining this Chama..."
                                value={note}
                                onChangeText={setNote}
                                multiline
                                numberOfLines={4}
                                placeholderTextColor="#BDBDBD"
                                textAlignVertical="top"
                            />

                            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>ID Photo (front)</Text>
                            <TouchableOpacity style={styles.photoPicker} onPress={pickIdPhoto}>
                                {idPhotoUri ? (
                                    <Image source={{ uri: idPhotoUri }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        {uploading ? <ActivityIndicator color={PRIMARY} /> : (
                                            <>
                                                <Ionicons name="id-card-outline" size={36} color={PRIMARY} />
                                                <Text style={styles.photoPlaceholderText}>Tap to upload ID photo</Text>
                                            </>
                                        )}
                                    </View>
                                )}
                            </TouchableOpacity>
                            {idPhotoUri && !uploading && (
                                <TouchableOpacity onPress={pickIdPhoto} style={styles.changePhoto}>
                                    <Ionicons name="refresh-outline" size={16} color={PRIMARY} />
                                    <Text style={styles.changePhotoText}>Change photo</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                style={styles.submitBtnWrap}
                                onPress={handleSubmit}
                                disabled={submitting || uploading}
                            >
                                <LinearGradient colors={['#4CAF50', PRIMARY, '#1B3D28']} style={styles.submitBtn}>
                                    {submitting
                                        ? <ActivityIndicator color="#fff" />
                                        : <Text style={styles.submitBtnText}>Submit Application</Text>
                                    }
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
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 10, letterSpacing: 0.4, textTransform: 'uppercase' },

    input: {
        backgroundColor: '#F7F8FA', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: '#1A1A1A', marginBottom: 12, borderWidth: 1, borderColor: '#EBEBEB',
    },
    textarea: { height: 100, paddingTop: 14 },

    photoPicker: { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
    photoPlaceholder: { height: 160, backgroundColor: '#F0FDF4', borderRadius: 16, borderWidth: 2, borderColor: '#C8E6C9', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 8 },
    photoPlaceholderText: { fontSize: 14, color: '#2A5C3F', fontWeight: '600' },
    photoPreview: { width: '100%', height: 200, borderRadius: 16 },
    changePhoto: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, alignSelf: 'flex-start' },
    changePhotoText: { fontSize: 13, color: '#2A5C3F', fontWeight: '600' },

    submitBtnWrap: { marginTop: 24, borderRadius: 999, overflow: 'hidden' },
    submitBtn: { height: 58, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

    successWrap: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center' },
    successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF9E6', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
    successText: { fontSize: 15, color: '#666', lineHeight: 24, textAlign: 'center', marginBottom: 32 },
    doneBtn: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    doneBtnGrad: { height: 58, alignItems: 'center', justifyContent: 'center' },
    doneBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },
});
