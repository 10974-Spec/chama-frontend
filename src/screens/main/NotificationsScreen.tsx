import React, { useEffect, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handlePress = async (item: any) => {
        if (!item.read) {
            try {
                await api.put(`/notifications/${item._id}/read`);
                setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, read: true } : n));
            } catch (error) {
                console.error('Failed to mark read', error);
            }
        }
        // TODO: Navigation to specific screen based on item.type (e.g. chat, payment)
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'chat': return { name: 'chatbubbles', color: '#4A90E2' };
            case 'payment': return { name: 'cash', color: '#27AE60' };
            case 'feed': return { name: 'newspaper', color: '#F2994A' };
            default: return { name: 'notifications', color: colors.primary };
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

            {/* ── Watermark background ── */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.13 }}
            />

            <View style={styles.header}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text style={styles.markAll}>Mark read</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={i => i._id || Math.random().toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                    }
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No notifications yet.</Text>
                    }
                    renderItem={({ item }) => {
                        const iconData = getIcon(item.type);
                        const timeString = new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                        return (
                            <TouchableOpacity
                                style={[styles.card, !item.read && styles.cardUnread]}
                                activeOpacity={0.85}
                                onPress={() => handlePress(item)}
                            >
                                <View style={[styles.iconWrap, { backgroundColor: iconData.color + '18' }]}>
                                    <Ionicons name={iconData.name as any} size={22} color={iconData.color} />
                                </View>
                                <View style={styles.textWrap}>
                                    <View style={styles.titleRow}>
                                        <Text style={styles.notifTitle}>{item.title}</Text>
                                        {!item.read && <View style={styles.unreadDot} />}
                                    </View>
                                    <Text style={styles.notifDesc}>{item.body}</Text>
                                    <Text style={styles.notifTime}>{timeString}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20 },
    iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    markAll: { fontSize: 13, fontWeight: '600', color: colors.primary },
    list: { padding: 16, paddingBottom: 100 },
    card: { flexDirection: 'row', backgroundColor: colors.white, borderRadius: radii.lg, padding: 14, marginBottom: 10, gap: 12, ...shadows.card },
    cardUnread: { backgroundColor: '#F0FDF4', borderLeftWidth: 3, borderLeftColor: colors.primary },
    iconWrap: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
    textWrap: { flex: 1, gap: 3 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    notifTitle: { ...typography.bodyMedium, color: colors.text.dark, flex: 1 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935', marginLeft: 6 },
    notifDesc: { ...typography.small, color: colors.text.muted, lineHeight: 18 },
    notifTime: { ...typography.caption, color: colors.text.light, marginTop: 2 },
});
