import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';

const PRIMARY_GREEN = '#2A5C3F';
const PRIMARY_GREEN_LIGHT = '#3A7D54';
const BG_WHITE = '#FFFFFF';

export default function BrowseChamaScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const [query, setQuery] = useState('');
    const [chamas, setChamas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChamas = async () => {
            try {
                const res = await api.get('/chamas');
                setChamas(res.data);
            } catch (error) {
                console.error('Failed to fetch chamas for browsing', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChamas();
    }, []);

    // Filter local results based on query & public status
    const filtered = chamas.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) &&
        c.visibility === 'public'
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={20} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Browse Chamas</Text>
                <TouchableOpacity style={styles.createBtn} onPress={() => navigation.navigate('CreateChama')}>
                    <Ionicons name="add" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={18} color={colors.text.placeholder} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search public chamas..."
                    placeholderTextColor={colors.text.placeholder}
                    value={query}
                    onChangeText={setQuery}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.text.muted} />
                    </TouchableOpacity>
                )}
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i._id}
                    numColumns={1}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="search-circle-outline" size={48} color={colors.border} />
                            <Text style={styles.emptyText}>No chamas found</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={() => navigation.navigate('ChamaDetails', { chama: item })}>
                            <Image source={{ uri: item.logo || 'https://i.pravatar.cc/150' }} style={styles.logo} />
                            <View style={styles.cardBody}>
                                <Text style={styles.chamaName}>{item.name}</Text>
                                <Text style={styles.desc} numberOfLines={1}>{item.description}</Text>
                                <View style={styles.metaRow}>
                                    <Ionicons name="people-outline" size={13} color={colors.text.muted} />
                                    <Text style={styles.metaText}>{item.settings?.maxMembers || 20} max</Text>
                                    <Text style={styles.dot}>•</Text>
                                    <Ionicons name="cash-outline" size={13} color={colors.primary} />
                                    <Text style={styles.contribution}>Ksh {item.settings?.weeklyContribution || 0}/{item.settings?.payoutFrequency || 'weekly'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.joinSmallBtnWrap} activeOpacity={0.8} onPress={() => navigation.navigate('ChamaDetails', { chama: item })}>
                                <LinearGradient
                                    colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[styles.joinSmallBtn, { borderRadius: 999 }]}
                                >
                                    <Text style={styles.joinSmallBtnText}>View</Text>
                                    <Ionicons name="chevron-forward" size={14} color={BG_WHITE} style={{ marginLeft: 2 }} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F8FA' },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
    backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h4, color: colors.text.dark, flex: 1 },
    createBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 999,
        marginHorizontal: 16,
        marginTop: 14,
        marginBottom: 4,
        paddingHorizontal: 16,
        height: 46,
        borderWidth: 1,
        borderColor: '#EBEBEB'
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', paddingVertical: 0 },
    list: { padding: 16, paddingBottom: 80 },
    card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, ...shadows.card },
    logo: { width: 50, height: 50, borderRadius: 25 },
    cardBody: { flex: 1, gap: 3 },
    chamaName: { ...typography.bodyMedium, color: colors.text.dark },
    desc: { ...typography.small, color: colors.text.muted },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    metaText: { ...typography.caption, color: colors.text.muted },
    dot: { ...typography.caption, color: colors.text.light },
    contribution: { ...typography.caption, color: colors.primary, fontWeight: '600' },
    joinSmallBtnWrap: {
        borderRadius: 999,
    },
    joinSmallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    joinSmallBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: BG_WHITE,
    },
    empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyText: { ...typography.body, color: colors.text.muted },
});
