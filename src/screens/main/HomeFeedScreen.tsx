import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, StyleSheet, TouchableOpacity,
    StatusBar, ImageBackground, TextInput, ScrollView,
    ActivityIndicator, Image, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppContext } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const PRIMARY_GREEN_LIGHT = '#3A7D54';
const BG_WHITE = '#FFFFFF';

function UnreadBubble({ item }: any) {


    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    return (
        <TouchableOpacity style={styles.storyWrap} onPress={() => navigation.navigate('ChamaDashboard', { chama: item })}>
            <View style={styles.storyAvatarContainer}>
                <View style={styles.storyAvatarRing}>
                    <Image source={{ uri: item.logo || `https://i.pravatar.cc/150?img=${item._id?.charCodeAt(0) % 20 || 5}` }} style={styles.storyAvatar} />
                </View>
                {item.unread > 0 && (
                    <View style={styles.bubbleBadge}>
                        <Text style={styles.bubbleBadgeText}>{item.unread > 9 ? '9+' : item.unread}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.storyLabel} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
    );
}

function ChamaRow({ item, isLast, isMember }: any) {


    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const unread = item.unread || 0;

    const handlePress = () => {


        if (isMember) {
            navigation.navigate('ChamaDashboard', { chama: item });
        } else {
            navigation.navigate('ChamaDetails', { chama: item });
        }
    };

    return (
        <TouchableOpacity
            style={[styles.chamaRow, !isLast && styles.chamaRowBorder]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={styles.chamaRowInner}>
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                    <Image
                        source={{ uri: item.logo || `https://i.pravatar.cc/150?img=${item._id?.charCodeAt(0) % 20 || 5}` }}
                        style={styles.avatar}
                    />
                    {item.online && <View style={styles.onlineDot} />}
                </View>

                {/* Info */}
                <View style={styles.rowInfo}>
                    <View style={styles.rowTop}>
                        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.rowTime}>{item.lastActive || '5 min'}</Text>
                    </View>
                    <View style={styles.rowBottom}>
                        <Text style={styles.rowPreview} numberOfLines={2}>
                            Ksh <Text style={styles.rowAmount}>{item.settings?.weeklyContribution || item.contributionAmount || 500}</Text>
                            {' · '}{item.memberCount || 0} members · {item.settings?.payoutFrequency || 'Weekly'}
                        </Text>
                        {unread > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{unread}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.rowActionContainer}>
                {isMember ? (
                    <TouchableOpacity style={styles.dashboardBtn} onPress={handlePress}>
                        <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
                        <Ionicons name="arrow-forward" size={14} color={PRIMARY_GREEN} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.joinSmallBtnWrap} onPress={handlePress} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.joinSmallBtn}
                        >
                            <Text style={styles.joinSmallBtnText}>Join Chama</Text>
                            <Ionicons name="chevron-forward" size={14} color={BG_WHITE} style={{ marginLeft: 2 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function HomeFeedScreen({ navigation }: any) {


    const [search, setSearch] = useState('');
    const [chamas, setChamas] = useState<any[]>([]);
    const [myChamaIds, setMyChamaIds] = useState<Set<string>>(new Set());
    const [unreadChamas, setUnreadChamas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { user } = useAppContext();

    const handleCreateChama = () => {


        if (!user?.name) {
            setShowProfileModal(true);
        } else {
            navigation.navigate('CreateChama');
        }
    };

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const [allRes, myRes] = await Promise.all([
                    api.get('/chamas'),
                    api.get('/chamas/my')
                ]);

                const myIds = new Set<string>(myRes.data.map((c: any) => c._id));
                setMyChamaIds(myIds);

                const withMeta = allRes.data.map((c: any, i: number) => ({
                    ...c,
                    unread: myIds.has(c._id) ? (i % 3 === 0 ? (i % 5) + 1 : 0) : 0,
                    online: i % 2 === 0,
                    lastActive: ['5 min', '32 min', '1 hour', '5 hour', 'Mon', 'Tue', 'Wed'][i % 7],
                }));
                setChamas(withMeta);

                const myWithUnread = myRes.data.map((c: any, i: number) => ({
                    ...c,
                    unread: i % 2 === 0 ? (i % 3) + 1 : 0
                })).filter((c: any) => c.unread > 0);
                setUnreadChamas(myWithUnread);
            } catch (err) {
                console.error('Failed to fetch chamas feed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    const filteredChamas = chamas.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) && c.visibility === 'public'
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} />

            {/* ── Watermark background ── */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.13 }}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                </View>
            ) : (
                <>
                    {/* ── Fixed top header ── */}
                    <View style={styles.topHeader}>
                        <View style={styles.logoRow}>
                            <View style={styles.logoCircle}>
                                <Ionicons name="people" size={18} color="#fff" />
                            </View>
                            <Text style={styles.logoText}>CHAMA</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.searchIconBtn}
                            onPress={() => navigation.navigate('Browse')}
                        >
                            <Ionicons name="search-outline" size={20} color={PRIMARY_GREEN} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Search bar + camera ── */}
                        <View style={styles.searchBarWrap}>
                            <View style={styles.searchBar}>
                                <Ionicons name="search-outline" size={17} color="#BDBDBD" style={{ marginRight: 8 }} />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search"
                                    placeholderTextColor="#BDBDBD"
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                {search.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearch('')}>
                                        <Ionicons name="close-circle" size={18} color="#BDBDBD" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <TouchableOpacity style={styles.cameraBtn}>
                                <Ionicons name="camera-outline" size={20} color="#9E9E9E" />
                            </TouchableOpacity>
                        </View>

                        {/* ── Unread Notifications ── */}
                        <Text style={[styles.sectionTitle, { marginTop: 8, marginBottom: 12 }]}>Unread Updates</Text>
                        {unreadChamas.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.storiesRow}
                                style={styles.storiesScroll}
                            >
                                {unreadChamas.map(s => <UnreadBubble key={s._id} item={s} />)}
                            </ScrollView>
                        ) : (
                            <View style={styles.emptyUnreadContainer}>
                                <Ionicons name="notifications-off-outline" size={32} color="#D0D0D0" />
                                <Text style={styles.emptyUnreadText}>No unread notifications</Text>
                            </View>
                        )}

                        {/* ── Section label ── */}
                        <Text style={styles.sectionTitle}>Chamas near you</Text>

                        {/* ── Chama message-style list ── */}
                        <View style={styles.chamaList}>
                            {filteredChamas.length > 0 ? (
                                filteredChamas.map((item, index) => (
                                    <ChamaRow
                                        key={item._id}
                                        item={item}
                                        isLast={index === filteredChamas.length - 1}
                                        isMember={myChamaIds.has(item._id)}
                                    />
                                ))
                            ) : (
                                <Text style={styles.emptyText}>No Chamas found.</Text>
                            )}
                        </View>

                        <View style={{ height: 24 }} />

                        {/* ── Terms ── */}
                        <TouchableOpacity
                            style={styles.termsLink}
                            onPress={() => navigation.navigate('TermsPrivacy')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.termsLinkText}>Terms of Service  ·  Privacy Policy</Text>
                        </TouchableOpacity>

                        <View style={{ height: 110 }} />
                    </ScrollView>

                    {/* ── Pinned bottom button — gradient, shorter, wider margins ── */}
                    <View style={styles.bottomBar}>
                        <View style={styles.createBtnShadow}>
                            <TouchableOpacity
                                style={styles.createBtnWrap}
                                onPress={handleCreateChama}
                                activeOpacity={0.88}
                            >
                                <LinearGradient
                                    colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.createBtn}
                                >
                                    <Ionicons name="add-circle-outline" size={19} color={BG_WHITE} />
                                    <Text style={styles.createBtnText}>Create New Chama</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}

            {/* ── Profile Completion Modal ── */}
            <Modal
                transparent
                visible={showProfileModal}
                animationType="slide"
                onRequestClose={() => setShowProfileModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowProfileModal(false)}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="person-circle" size={56} color={PRIMARY_GREEN} />
                        </View>
                        <Text style={styles.modalTitle}>Finish Setting Up First</Text>
                        <Text style={styles.modalSubtitle}>
                            To create a Chama, complete your profile. This builds trust with future members.
                        </Text>
                        <View style={styles.stepsList}>
                            {[
                                { icon: 'person-outline', label: 'Add your full name & photo' },
                                { icon: 'id-card-outline', label: 'Verify your identity (ID card)' },
                                { icon: 'shield-checkmark-outline', label: 'Unlock Chama creation' },
                            ].map((s, i) => (
                                <View key={i} style={styles.stepItem}>
                                    <View style={styles.stepIconWrap}>
                                        <Ionicons name={s.icon as any} size={18} color={PRIMARY_GREEN} />
                                    </View>
                                    <Text style={styles.stepLabel}>{s.label}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.modalCtaShadow}>
                            <TouchableOpacity
                                style={styles.modalCtaWrap}
                                activeOpacity={0.88}
                                onPress={() => { setShowProfileModal(false); navigation.navigate('Profile'); }}
                            >
                                <LinearGradient
                                    colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                                    style={styles.modalCtaGradient}
                                >
                                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                                    <Text style={styles.modalCtaText}>Complete My Profile</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowProfileModal(false)}>
                            <Text style={styles.modalDismissText}>Maybe later</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_WHITE },

    /* ── Top header ── */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 52,
        paddingBottom: 10,
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    logoCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
    },
    logoText: {
        fontSize: 13, fontWeight: '800',
        letterSpacing: 3, color: '#1A1A1A',
    },
    searchIconBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#F0F0F0',
        alignItems: 'center', justifyContent: 'center',
    },

    /* ── Scroll ── */
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 20 },

    /* ── Search bar ── */
    searchBarWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 4,
        paddingBottom: 16,
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 999,
        paddingHorizontal: 16,
        height: 46,
        borderWidth: 1,
        borderColor: '#EBEBEB',
    },
    searchInput: {
        flex: 1, fontSize: 15,
        color: '#1A1A1A', paddingVertical: 0,
    },
    cameraBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#EBEBEB',
    },

    /* ── Stories ── */
    storiesScroll: { marginBottom: 20 },
    storiesRow: { paddingHorizontal: 20, gap: 14 },
    storyWrap: { alignItems: 'center', width: 62, gap: 6 },
    storyAvatarContainer: {
        position: 'relative',
        width: 58,
        height: 58,
    },
    storyAvatarRing: {
        width: '100%', height: '100%', borderRadius: 29,
        borderWidth: 2.5, borderColor: PRIMARY_GREEN,
        padding: 2, overflow: 'hidden',
    },
    storyAvatar: { width: '100%', height: '100%', borderRadius: 999 },
    storyLabel: { fontSize: 11, color: '#555', textAlign: 'center', fontWeight: '500' },

    /* ── Unread Bubble Badge ── */
    bubbleBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#E53935',
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: BG_WHITE,
    },
    bubbleBadgeText: {
        color: BG_WHITE,
        fontSize: 10,
        fontWeight: 'bold',
    },

    /* ── Empty Unread Updates ── */
    emptyUnreadContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 24,
        marginBottom: 20,
        backgroundColor: '#F9F9F9',
        marginHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        borderStyle: 'dashed',
    },
    emptyUnreadText: {
        marginTop: 8,
        fontSize: 14,
        color: '#9E9E9E',
        fontWeight: '500',
    },

    /* ── Chama Row Elements ── */
    chamaRowInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowActionContainer: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    dashboardBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: '#E8F5E9',
    },
    dashboardBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: PRIMARY_GREEN,
    },
    joinSmallBtnWrap: {
        borderRadius: 999,
        overflow: 'hidden',
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 2,
    },
    joinSmallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    joinSmallBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: BG_WHITE,
    },

    /* ── Section title ── */
    sectionTitle: {
        fontSize: 16, fontWeight: '700',
        color: '#1A1A1A',
        paddingHorizontal: 20, marginBottom: 10,
    },

    /* ── Chama list ── */
    chamaList: {
        marginHorizontal: 20,
        backgroundColor: BG_WHITE,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    chamaRow: {
        flexDirection: 'column',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    chamaRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    avatarWrap: { position: 'relative', marginRight: 13 },
    avatar: {
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: '#E8F5E9',
    },
    onlineDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2, borderColor: BG_WHITE,
    },
    rowInfo: { flex: 1 },
    rowTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    rowName: {
        fontSize: 15, fontWeight: '700',
        color: '#1A1A1A', flex: 1, marginRight: 8,
    },
    rowTime: { fontSize: 12, color: '#BDBDBD' },
    rowBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowPreview: {
        fontSize: 13, color: '#9E9E9E',
        flex: 1, marginRight: 8, lineHeight: 18,
    },
    rowAmount: { fontWeight: '700', color: PRIMARY_GREEN },
    badge: {
        minWidth: 20, height: 20, borderRadius: 10,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: BG_WHITE },
    emptyText: {
        textAlign: 'center', color: '#BDBDBD',
        padding: 24, fontSize: 14,
    },

    /* ── Bottom bar ── */
    bottomBar: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        paddingHorizontal: 44,       // wider margins = shorter-feeling button
        paddingBottom: 36,
        paddingTop: 12,
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    createBtnShadow: {
        width: '100%', borderRadius: 999,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4, shadowRadius: 12,
        elevation: 8,
        backgroundColor: PRIMARY_GREEN,
    },
    createBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    createBtn: {
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 999,
    },
    createBtnText: {
        fontSize: 16, fontWeight: '700',
        color: BG_WHITE, letterSpacing: 0.2,
    },
    termsLink: {
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 8,
    },
    termsLinkText: {
        fontSize: 12,
        color: '#AAAAAA',
        textDecorationLine: 'underline',
    },

    /* ── Modal ── */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: BG_WHITE,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
    },
    modalHandle: {
        width: 40, height: 5, backgroundColor: '#E0E0E0',
        borderRadius: 3, alignSelf: 'center', marginBottom: 20,
    },
    modalIconWrap: {
        alignSelf: 'center', marginBottom: 12,
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 22, fontWeight: '800',
        color: '#1A1A1A', textAlign: 'center', marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14, color: '#666',
        textAlign: 'center', lineHeight: 21, marginBottom: 24,
    },
    stepsList: { gap: 12, marginBottom: 28 },
    stepItem: {
        flexDirection: 'row', alignItems: 'center', gap: 14,
        backgroundColor: '#F8FBF8', borderRadius: 14,
        paddingVertical: 12, paddingHorizontal: 14,
        borderWidth: 1, borderColor: '#E6F0E7',
    },
    stepIconWrap: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center',
    },
    stepLabel: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    modalCtaShadow: {
        width: '100%', borderRadius: 999,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35, shadowRadius: 10,
        elevation: 7, marginBottom: 12,
        backgroundColor: PRIMARY_GREEN,
    },
    modalCtaWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    modalCtaGradient: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8,
        paddingVertical: 17, borderRadius: 999,
    },
    modalCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    modalDismiss: { alignItems: 'center', paddingVertical: 10 },
    modalDismissText: { fontSize: 14, color: '#AAAAAA' },
});