import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import api from '../../services/api';
import { useRoute } from '@react-navigation/native';
import { useApp } from '../../context/AppContext';

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
    upcoming: { bg: colors.primaryBg, text: colors.primary, label: 'Upcoming' },
    past: { bg: '#F5F5F5', text: colors.text.muted, label: 'Past' },
    missed: { bg: '#FFF0F0', text: '#FA5252', label: 'Missed' },
};

const getRsvpColors = (themeColor: string) => ({
    attending: themeColor,
    declined: '#FA5252',
    tentative: '#F59F00'
});

export default function ChamaMeetingsTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const { chamaId } = route.params || {};
    const themeColor = '#2A5C3F';
    const { user } = useApp();

    const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
        upcoming: { bg: themeColor + '20', text: themeColor, label: 'Upcoming' },
        past: { bg: '#F5F5F5', text: colors.text.muted, label: 'Past' },
        missed: { bg: '#FFF0F0', text: '#FA5252', label: 'Missed' },
    };

    const rsvpColors: Record<string, string> = getRsvpColors(themeColor);

    const [meetings, setMeetings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMeetings = async () => {
        if (!chamaId || chamaId.startsWith('mock-')) return setLoading(false);
        try {
            const res = await api.get(`/chamas/${chamaId}/meetings`);
            setMeetings(res.data);
        } catch (error) {
            console.error('Failed to fetch meetings', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, [chamaId]);

    const handleRsvp = async (meetingId: string, status: string) => {
        if (!chamaId || chamaId.startsWith('mock-')) return;
        try {
            // Optimistically update UI
            setMeetings(prev => prev.map(m => {
                if (m._id !== meetingId) return m;
                const existing = m.rsvps.findIndex((r: any) => r.userId._id === user?._id);
                const updatedRsvps = [...m.rsvps];
                if (existing !== -1) updatedRsvps[existing].status = status;
                else updatedRsvps.push({ userId: { _id: user?._id }, status });
                return { ...m, rsvps: updatedRsvps };
            }));

            await api.post(`/chamas/${chamaId}/meetings/${meetingId}/rsvp`, { status });
        } catch (error) {
            console.error('Failed to RSVP', error);
            fetchMeetings(); // Revert on failure
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={themeColor} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMeetings(); }} />}
            >
                {meetings.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No meetings scheduled yet.</Text>
                ) : null}

                {meetings.map(meeting => {
                    const st = statusStyle[meeting.status] || statusStyle.upcoming;
                    const myRsvpObj = meeting.rsvps.find((r: any) => r.userId._id === user?._id);
                    const currentRsvp = myRsvpObj ? myRsvpObj.status : null;

                    return (
                        <View key={meeting._id} style={[styles.card, { borderLeftColor: st.text, borderLeftWidth: 3 }]}>
                            <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                                <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                            </View>
                            <Text style={styles.meetTitle}>{meeting.title}</Text>
                            <View style={styles.metaRow}>
                                <Ionicons name="calendar-outline" size={14} color={colors.text.muted} />
                                <Text style={styles.metaText}>{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Ionicons name="location-outline" size={14} color={colors.text.muted} />
                                <Text style={styles.metaText}>{meeting.location}</Text>
                            </View>
                            {meeting.status !== 'past' && (
                                <View style={styles.rsvpRow}>
                                    <Text style={styles.rsvpLabel}>RSVP:</Text>
                                    {(['attending', 'declined', 'tentative'] as const).map(opt => (
                                        <TouchableOpacity
                                            key={opt}
                                            style={[
                                                styles.rsvpBtn,
                                                currentRsvp === opt && { backgroundColor: rsvpColors[opt] + '20', borderColor: rsvpColors[opt] },
                                            ]}
                                            onPress={() => handleRsvp(meeting._id, opt)}
                                        >
                                            <Text style={[styles.rsvpText, currentRsvp === opt && styles.rsvpTextActive]}>
                                                {opt === 'tentative' ? 'Maybe' : opt === 'attending' ? 'Yes' : 'No'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
            <TouchableOpacity style={[styles.fab, { backgroundColor: themeColor }]}>
                <Ionicons name="add" size={26} color={colors.white} />
            </TouchableOpacity>
        </View>
    );
}


const makeStyles = (colors: any) => StyleSheet.create({
    scroll: { padding: 14, paddingBottom: 90 },
    card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.card },
    statusBadge: { alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10 },
    statusText: { ...typography.smallMedium },
    meetTitle: { ...typography.h4, color: colors.text.dark, marginBottom: 8 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    metaText: { ...typography.small, color: colors.text.muted, flex: 1 },
    rsvpRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' },
    rsvpLabel: { ...typography.smallMedium, color: colors.text.muted },
    rsvpBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, borderWidth: 1.5, borderColor: colors.border },

    rsvpText: { ...typography.smallMedium, color: colors.text.muted, textTransform: 'capitalize' },
    rsvpTextActive: { color: colors.text.dark, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 16, right: 16, width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', ...shadows.button },
});
