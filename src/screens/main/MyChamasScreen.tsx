import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, Image, ActivityIndicator, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';
import { ProgressBar } from '../../components/ui/ProgressBar';

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
                <Text style={styles.metaText}>
                    <Ionicons name="people-outline" size={12} color={colors.text.muted} /> {item.settings?.maxMembers || 20} max  •  Ksh {item.settings?.weeklyContribution || 0}/{item.settings?.payoutFrequency || 'weekly'}
                </Text>

                {/* Optional progress, default to 0% for now */}
                <View style={styles.progressRow}>
                    <ProgressBar progress={0} height={5} />
                    <Text style={styles.progressText}>0% collected</Text>
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.potBadge}>
                        <Text style={styles.potLabel}>Total Pot</Text>
                        <Text style={styles.potAmount}>Ksh {(item.totalPot || 0).toLocaleString()}</Text>
                    </View>
                    <Text style={styles.payoutDate}>
                        <Ionicons name="calendar-outline" size={11} color={colors.text.muted} /> Payout Pending
                    </Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.light} style={{ alignSelf: 'center' }} />
        </TouchableOpacity>
    );
}

export default function MyChamasScreen({ navigation }: any) {
    
    
    const [chamas, setChamas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyChamas = async () => {
            try {
                const res = await api.get('/chamas/my');
                setChamas(res.data);
            } catch (err) {
                console.error("Failed to fetch my chamas", err);
            } finally {
                setLoading(false);
            }
        };
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
            <View style={styles.statsRow}>
                {[
                    { label: 'Chamas', value: loading ? '-' : chamas.length.toString(), icon: 'people' },
                    { label: 'Contributed', value: 'Ksh 0', icon: 'cash' },
                    { label: 'Received', value: 'Ksh 0', icon: 'trophy' },
                ].map(s => (
                    <View key={s.label} style={styles.statCard}>
                        <Ionicons name={s.icon as any} size={18} color={colors.primary} />
                        <Text style={styles.statValue}>{s.value}</Text>
                        <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                ))}
            </View>

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
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<Text style={styles.sectionLabel}>Active Chamas</Text>}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>You are not in any chamas yet.</Text>
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
    addBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 14, gap: 8 },
    statCard: { flex: 1, backgroundColor: colors.primaryBg, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
    statValue: { ...typography.h4, color: colors.text.dark },
    statLabel: { ...typography.caption, color: colors.text.muted },
    list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
    sectionLabel: { ...typography.smallMedium, color: colors.text.muted, marginBottom: 8 },
    card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 12, flexDirection: 'row', gap: 12, ...shadows.card },
    cardLeft: {},
    chamaLogo: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryBg },
    cardBody: { flex: 1, gap: 5 },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    chamaName: { ...typography.bodyMedium, color: colors.text.dark, flex: 1 },
    metaText: { ...typography.small, color: colors.text.muted },
    progressRow: { gap: 4 },
    progressText: { ...typography.caption, color: colors.text.muted },
    bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    potBadge: {},
    potLabel: { ...typography.caption, color: colors.text.muted },
    potAmount: { ...typography.smallMedium, color: colors.primary },
    payoutDate: { ...typography.caption, color: colors.text.muted },
});
