import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image, ActivityIndicator, ImageBackground, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';
import { ProgressBar } from '../../components/ui/ProgressBar';

const PRIMARY_GREEN = '#2A5C3F';

function ChamaCard({ item, onPress }: any) {


    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
            <View style={styles.cardLeft}>
                <Image source={{ uri: item.logo || 'https://i.pravatar.cc/150' }} style={styles.chamaLogo} />
            </View>
            <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                    <Text style={styles.chamaName}>{item.name}</Text>
                    {item.visibility === 'private' && (
                        <Ionicons name="lock-closed" size={13} color={colors.text.muted} />
                    )}
                </View>
                {/* Meta text removed */}

                {/* Optional progress, default to 0% for now */}

                <View style={styles.bottomRow}>
                    <View style={styles.potBadge}>
                        <Text style={styles.potLabel}>Total Pot</Text>
                        <Text style={styles.potAmount}>Ksh {(item.totalPot || 0).toLocaleString()}</Text>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.light} style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
    );
}

export default function MyChamasScreen({ navigation }: any) {


    const [chamas, setChamas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [joining, setJoining] = useState(false);

    const fetchMyChamas = async () => {
        setLoading(true);
        try {
            const res = await api.get('/chamas/my');
            setChamas(res.data);
        } catch (err) {
            console.error("Failed to fetch my chamas", err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinCode = async () => {
        if (!joinCode.trim()) {
            Alert.alert('Error', 'Please enter a valid Chama code.');
            return;
        }
        setJoining(true);
        try {
            await api.post('/chamas/join-code', { inviteCode: joinCode.trim() });
            Alert.alert('Success!', 'You have successfully joined the Chama.');
            setJoinCode('');
            // refresh list
            fetchMyChamas();
        } catch (error: any) {
            Alert.alert('Join Failed', error.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setJoining(false);
        }
    };

    useEffect(() => {
        fetchMyChamas();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
            />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Chamas</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateChama')}>
                    <Ionicons name="add" size={22} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Summary stats */}
            {(chamas.length > 0 || loading) && (
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="people" size={18} color={PRIMARY_GREEN} />
                        <Text style={styles.statValue}>{loading ? '-' : chamas.length.toString()}</Text>
                        <Text style={styles.statLabel}>Active Chamas</Text>
                    </View>
                </View>
            )}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={chamas}
                    keyExtractor={i => i._id || Math.random().toString()}
                    renderItem={({ item }) => (
                        <ChamaCard item={item} onPress={() => navigation.navigate('ChamaDashboard', { chama: item })} />
                    )}
                    contentContainerStyle={[styles.list, chamas.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={chamas.length > 0 ? <Text style={styles.sectionLabel}>Active Chamas</Text> : null}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconBg}>
                                <Ionicons name="people-circle-outline" size={64} color={PRIMARY_GREEN} />
                            </View>
                            <Text style={styles.emptyText}>You have not joined any chama yet.</Text>

                            <View style={styles.joinBox}>
                                <Text style={styles.joinTitle}>Have an invite code?</Text>
                                <View style={styles.joinInputRow}>
                                    <TextInput
                                        style={styles.joinInput}
                                        placeholder="Enter Chama Code"
                                        placeholderTextColor="#A0A0A0"
                                        value={joinCode}
                                        onChangeText={setJoinCode}
                                        autoCapitalize="characters"
                                    />
                                    <TouchableOpacity
                                        style={[styles.joinBtn, joining && { opacity: 0.7 }]}
                                        onPress={handleJoinCode}
                                        disabled={joining}
                                    >
                                        {joining ? (
                                            <ActivityIndicator color={colors.white} size="small" />
                                        ) : (
                                            <Text style={styles.joinBtnText}>Join</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    headerTitle: { ...typography.h3, color: colors.text.dark },
    addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: PRIMARY_GREEN, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 14, gap: 8 },
    statCard: { flex: 1, backgroundColor: '#E8F5E9', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
    statValue: { ...typography.h4, color: colors.text.dark },
    statLabel: { ...typography.caption, color: colors.text.muted },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
    sectionLabel: { ...typography.smallMedium, color: colors.text.muted, marginBottom: 8 },
    card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 12, flexDirection: 'row', gap: 12, ...shadows.card, borderWidth: 1, borderColor: '#E6F4EA' },
    cardLeft: {},
    chamaLogo: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#E8F5E9' },
    cardBody: { flex: 1, gap: 5 },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    chamaName: { ...typography.bodyMedium, color: colors.text.dark, flex: 1 },
    metaText: { ...typography.small, color: colors.text.muted },
    progressRow: { gap: 4 },
    progressText: { ...typography.caption, color: colors.text.muted },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    potBadge: {},
    potLabel: { ...typography.caption, color: colors.text.muted },
    potAmount: { ...typography.smallMedium, color: PRIMARY_GREEN },
    payoutDate: { ...typography.caption, color: colors.text.muted },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
    emptyIconBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
    emptyText: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginBottom: 30 },
    joinBox: { width: '100%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 0, shadowOpacity: 0 },
    joinTitle: { ...typography.smallMedium, color: colors.text.dark, marginBottom: 12, textAlign: 'center' },
    joinInputRow: { flexDirection: 'row', gap: 8 },
    joinInput: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 12, paddingHorizontal: 14, height: 48, fontSize: 15, color: colors.text.dark },
    joinBtn: { backgroundColor: PRIMARY_GREEN, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', height: 48 },
    joinBtnText: { ...typography.button, color: colors.white },
});
