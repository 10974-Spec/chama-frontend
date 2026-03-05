import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, FlatList,
    Image, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useCustomAlert } from './CustomAlert';

interface PendingRequestsModalProps {
    visible: boolean;
    chamaId: string;
    onClose: () => void;
    onChanged: () => void;
}

const PRIMARY = '#2A5C3F';

export default function PendingRequestsModal({ visible, chamaId, onClose, onChanged }: PendingRequestsModalProps) {
    const { showAlert, AlertComponent } = useCustomAlert();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/chamas/${chamaId}/requests`);
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) fetchRequests();
    }, [visible]);

    const handleAction = async (membershipId: string, action: 'approve' | 'reject', name: string) => {
        setActing(membershipId);
        try {
            await api.put(`/chamas/${chamaId}/members/${membershipId}/approve`, { action });
            setRequests(prev => prev.filter(r => r._id !== membershipId));
            showAlert(
                action === 'approve' ? 'success' : 'info',
                action === 'approve' ? 'Request Approved' : 'Request Rejected',
                `${name} has been ${action === 'approve' ? 'added as a member' : 'removed from the waiting list'}.`
            );
            onChanged();
        } catch (err: any) {
            showAlert('error', 'Error', err?.response?.data?.message || 'Failed to process request.');
        } finally {
            setActing(null);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Join Requests</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{requests.length}</Text>
                    </View>
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={PRIMARY} />
                    </View>
                ) : requests.length === 0 ? (
                    <View style={styles.empty}>
                        <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptyText}>No pending join requests at this time.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        keyExtractor={i => i._id}
                        contentContainerStyle={styles.list}
                        renderItem={({ item }) => {
                            const name = item.userId?.profile?.name || 'Unknown';
                            const avatar = item.userId?.profile?.avatar;
                            const isActing = acting === item._id;

                            return (
                                <View style={styles.card}>
                                    <View style={styles.cardTop}>
                                        {avatar ? (
                                            <Image source={{ uri: avatar }} style={styles.avatar} />
                                        ) : (
                                            <View style={[styles.avatar, styles.avatarFallback]}>
                                                <Text style={styles.avatarLetter}>{name[0]?.toUpperCase()}</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.name}>{name}</Text>
                                            {item.applicationNationalId ? (
                                                <Text style={styles.meta}>ID: {item.applicationNationalId}</Text>
                                            ) : null}
                                        </View>
                                    </View>

                                    {item.applicationNote ? (
                                        <View style={styles.noteBox}>
                                            <Text style={styles.noteLabel}>Reason to join</Text>
                                            <Text style={styles.noteText}>{item.applicationNote}</Text>
                                        </View>
                                    ) : null}

                                    {item.applicationIdPhotoUrl ? (
                                        <TouchableOpacity onPress={() => setSelectedPhoto(item.applicationIdPhotoUrl)}>
                                            <Image source={{ uri: item.applicationIdPhotoUrl }} style={styles.idThumb} />
                                            <Text style={styles.viewIdText}>Tap to view ID photo</Text>
                                        </TouchableOpacity>
                                    ) : null}

                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.rejectBtn}
                                            onPress={() => handleAction(item._id, 'reject', name)}
                                            disabled={isActing}
                                        >
                                            {isActing ? <ActivityIndicator size="small" color="#E53935" /> : (
                                                <>
                                                    <Ionicons name="close-circle-outline" size={18} color="#E53935" />
                                                    <Text style={styles.rejectBtnText}>Reject</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.approveBtn}
                                            onPress={() => handleAction(item._id, 'approve', name)}
                                            disabled={isActing}
                                        >
                                            <LinearGradient colors={['#4CAF50', PRIMARY]} style={styles.approveBtnGrad}>
                                                {isActing ? <ActivityIndicator size="small" color="#fff" /> : (
                                                    <>
                                                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                                        <Text style={styles.approveBtnText}>Approve</Text>
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                    />
                )}

                {/* ID Photo full screen viewer */}
                <Modal visible={!!selectedPhoto} transparent animationType="fade" onRequestClose={() => setSelectedPhoto(null)}>
                    <TouchableOpacity style={styles.photoViewer} activeOpacity={1} onPress={() => setSelectedPhoto(null)}>
                        {selectedPhoto && <Image source={{ uri: selectedPhoto }} style={styles.photoFull} resizeMode="contain" />}
                        <TouchableOpacity style={styles.photoCloseBtn} onPress={() => setSelectedPhoto(null)}>
                            <Ionicons name="close-circle" size={36} color="#fff" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </View>
            <AlertComponent />
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
    badge: { backgroundColor: '#E53935', minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
    badgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },

    list: { padding: 16, paddingBottom: 40 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
    cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarFallback: { backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
    avatarLetter: { fontSize: 20, fontWeight: '800', color: '#2A5C3F' },
    name: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginBottom: 2 },
    meta: { fontSize: 13, color: '#888' },

    noteBox: { backgroundColor: '#F7F8FA', borderRadius: 12, padding: 12, marginBottom: 12 },
    noteLabel: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    noteText: { fontSize: 14, color: '#333', lineHeight: 20 },

    idThumb: { width: '100%', height: 130, borderRadius: 12, marginBottom: 4 },
    viewIdText: { fontSize: 12, color: '#2A5C3F', fontWeight: '600', marginBottom: 12, textAlign: 'center' },

    actions: { flexDirection: 'row', gap: 10 },
    rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, borderRadius: 12, borderWidth: 2, borderColor: '#E53935' },
    rejectBtnText: { fontSize: 14, fontWeight: '700', color: '#E53935' },
    approveBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    approveBtnGrad: { height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    approveBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
    emptyText: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },

    photoViewer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', alignItems: 'center', justifyContent: 'center' },
    photoFull: { width: '90%', height: '70%' },
    photoCloseBtn: { position: 'absolute', top: 56, right: 24 },
});
