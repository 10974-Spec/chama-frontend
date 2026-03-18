import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, StatusBar, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, radii } from '../../theme';
import { useApp } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function ProfileScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { user, logout } = useApp();
    const [unreadNotifications, setUnreadNotifications] = React.useState(0);

    // Mock unread notifications count, in real life this would be from context or API
    React.useEffect(() => {
        setUnreadNotifications(3);
    }, []);

    if (!user) return null;

    const name = user?.profile?.name || user?.name || 'User';
    const avatar = user?.profile?.avatar || user?.avatar || 'https://i.pravatar.cc/150';
    const bio = user?.profile?.bio || 'Chama member';

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

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── Top header row ── */}
                <View style={styles.topHeader}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.logoRow}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="people" size={18} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>CHAMA</Text>
                    </View>
                    <View style={styles.headerRightActions}>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
                            <Ionicons name="notifications-outline" size={20} color="#1A1A1A" />
                            {unreadNotifications > 0 && (
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationBadgeText}>
                                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Settings')}>
                            <Ionicons name="settings-outline" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Avatar + name block ── */}
                <View style={styles.profileSection}>
                    <TouchableOpacity
                        style={styles.avatarWrap}
                        onPress={() => navigation.navigate('EditProfile')}
                        activeOpacity={0.9}
                    >
                        <Image source={{ uri: avatar }} style={styles.avatarImg} />
                    </TouchableOpacity>

                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{name}</Text>
                        {user?.verified && (
                            <Ionicons name="checkmark-circle" size={18} color="#4DABF7" style={{ marginLeft: 6 }} />
                        )}
                    </View>
                    <Text style={styles.bio}>{bio}</Text>

                    {/* Trust score pill */}
                    <View style={styles.trustPill}>
                        <Ionicons name="shield-checkmark-outline" size={14} color={PRIMARY_GREEN} />
                        <Text style={styles.trustScore}>{user?.trustScore || '98'}%</Text>
                        <Text style={styles.trustLabel}>Trust Score</Text>
                    </View>
                </View>

                {/* ── Stats ── */}
                <View style={styles.statsRow}>
                    {[
                        { label: 'Contributions', value: user?.contributions || 0, icon: 'cash-outline' },
                        { label: 'Payouts', value: user?.payouts || 0, icon: 'trophy-outline' },
                        { label: 'Chamas', value: user?.chamasJoined || 0, icon: 'people-outline' },
                    ].map(stat => (
                        <View key={stat.label} style={styles.statCard}>
                            <Ionicons name={stat.icon as any} size={20} color={PRIMARY_GREEN} />
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Edit Profile button ── */}
                <View style={styles.editBtnShadow}>
                    <TouchableOpacity style={styles.editBtnWrap} onPress={() => navigation.navigate('EditProfile')} activeOpacity={0.88}>
                        <LinearGradient
                            colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.editBtn}
                        >
                            <Ionicons name="create-outline" size={17} color={BG_WHITE} />
                            <Text style={styles.editBtnText}>Edit Profile</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── Menu items ── */}
                <View style={styles.menuCard}>
                    {[
                        { icon: 'time-outline', label: 'Contribution History', color: PRIMARY_GREEN, route: 'ContributionHistory' },
                        { icon: 'card-outline', label: 'Payment Methods', color: PRIMARY_GREEN, route: 'PaymentMethods' },
                        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: PRIMARY_GREEN, route: 'PrivacySecurity' },
                        { icon: 'help-circle-outline', label: 'Help & Support', color: PRIMARY_GREEN, route: 'HelpSupport' },
                        { icon: 'star-outline', label: 'Rate the App', color: '#F59F00', route: undefined },
                    ].map((item, i) => (
                        <TouchableOpacity
                            key={item.label}
                            style={[styles.menuItem, i > 0 && styles.menuItemBorder]}
                            onPress={() => item.route ? navigation.navigate(item.route) : null}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                                <Ionicons name={item.icon as any} size={18} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Logout ── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={19} color="#FA5252" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={styles.version}>Chama v1.0.0  •  Made with 💚 in Kenya</Text>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_WHITE,
    },
    scroll: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 44,
        paddingBottom: 20,
    },

    /* ── Header ── */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 20,
    },
    iconBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F2F2F2',
        alignItems: 'center', justifyContent: 'center',
    },
    headerLogoImage: { width: 180, height: 50, transform: [{ scale: 1.6 }] },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    logoCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
    },
    logoText: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 3,
        color: '#1A1A1A',
    },
    headerRightActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    notificationBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#E53935',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: BG_WHITE,
    },
    notificationBadgeText: {
        color: BG_WHITE,
        fontSize: 9,
        fontWeight: 'bold',
    },

    /* ── Profile section ── */
    profileSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarWrap: {
        width: 116, height: 116,
        borderRadius: 58,
        overflow: 'hidden',
        backgroundColor: '#E8F5E9',
        borderWidth: 3,
        borderColor: BG_WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
        marginBottom: 14,
    },
    avatarImg: { width: '100%', height: '100%' },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        letterSpacing: -0.3,
    },
    bio: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
        marginBottom: 14,
    },
    trustPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EEF4EF',
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: '#C8DFC9',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    trustScore: {
        fontSize: 15,
        fontWeight: '800',
        color: PRIMARY_GREEN,
    },
    trustLabel: {
        fontSize: 13,
        color: '#777777',
        fontWeight: '500',
    },

    /* ── Stats ── */
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        padding: 14,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    statLabel: {
        fontSize: 11,
        color: '#888888',
        textAlign: 'center',
        fontWeight: '500',
    },

    /* ── Edit button ── */
    editBtnShadow: {
        width: '100%',
        borderRadius: 999,
        marginBottom: 26,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: PRIMARY_GREEN,
    },
    editBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    editBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: BG_WHITE,
    },

    /* ── Menu ── */
    menuCard: {
        backgroundColor: BG_WHITE,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        marginBottom: 14,
        overflow: 'hidden',

    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    menuItemBorder: {
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    menuIcon: {
        width: 36, height: 36, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center',
    },
    menuLabel: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '500',
    },

    /* ── Logout ── */
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFF0F0',
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: '#FFCDD2',
        paddingVertical: 13,
        marginBottom: 20,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FA5252',
    },

    /* ── Version ── */
    version: {
        fontSize: 12,
        color: '#BBBBBB',
        textAlign: 'center',
    },
});