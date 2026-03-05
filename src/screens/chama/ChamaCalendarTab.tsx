import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { colors, typography, shadows, radii } from '../../theme';
import { useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useCustomAlert } from '../../components/ui/CustomAlert';

export default function ChamaCalendarTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const chamaId = route.params?.chamaId;
    const adminId = route.params?.adminId;
    const themeColor = '#2A5C3F';
    const { user } = useAppContext();
    const isAdmin = adminId === user?._id;
    const { showAlert, AlertComponent } = useCustomAlert();

    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const todayDateStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayDateStr);

    // Form
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, [chamaId]);

    const fetchEvents = async () => {
        if (!chamaId || chamaId.startsWith('mock-')) return setLoading(false);
        try {
            const res = await api.get(`/chamas/${chamaId}/events`);
            setEvents(res.data);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!title.trim() || !chamaId) {
            showAlert('warning', 'Validation', 'Please provide an event title.');
            return;
        }
        setSubmitting(true);
        try {
            const res = await api.post(`/chamas/${chamaId}/events`, {
                title,
                note,
                date: new Date(selectedDate)
            });
            setEvents(prev => [...prev, res.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
            setModalVisible(false);
            setTitle('');
            setNote('');
            showAlert('success', 'Event Scheduled', 'Your event has been added to the calendar.');
        } catch (error) {
            console.error('Failed to create event', error);
            showAlert('error', 'Error', 'Could not schedule the event.');
        } finally {
            setSubmitting(false);
        }
    };

    const markedDates = events.reduce((acc: any, event: any) => {
        const d = new Date(event.date).toISOString().split('T')[0];
        acc[d] = { marked: true, dotColor: themeColor };
        return acc;
    }, {});

    markedDates[selectedDate] = {
        ...markedDates[selectedDate],
        selected: true,
        selectedColor: themeColor
    };

    const dayEvents = events.filter(e => new Date(e.date).toISOString().split('T')[0] === selectedDate);

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
                style={{ flex: 1 }}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchEvents(); }} />}
            >
                <Calendar
                    current={selectedDate}
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={markedDates}
                    theme={{
                        todayTextColor: themeColor,
                        selectedDayBackgroundColor: themeColor,
                        arrowColor: themeColor,
                        dotColor: themeColor,
                        textDayFontWeight: '500',
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: '500'
                    }}
                    style={styles.calendarCard}
                />

                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>
                        Events on {new Date(selectedDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                    </Text>

                    {dayEvents.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-clear-outline" size={48} color={colors.text.light} />
                            <Text style={styles.emptyText}>No events scheduled for this day.</Text>
                        </View>
                    ) : (
                        dayEvents.map(event => (
                            <View key={event._id} style={styles.eventCard}>
                                <View style={[styles.eventIndicator, { backgroundColor: themeColor }]} />
                                <View style={styles.eventInfo}>
                                    <Text style={styles.eventTitle}>{event.title}</Text>
                                    {!!event.note && <Text style={styles.eventNote}>{event.note}</Text>}
                                    <Text style={styles.eventAuthor}>Scheduled by {event.createdBy?.profile?.name || 'Admin'}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {isAdmin && (
                <TouchableOpacity style={[styles.fab, { backgroundColor: themeColor }]} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color={colors.white} />
                </TouchableOpacity>
            )}

            {/* Create Event Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.white }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 8 }}>
                            <Ionicons name="close" size={26} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Add Event on {selectedDate}</Text>
                        <View style={{ width: 42 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.inputLabel}>Event Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. End of Month Evaluation"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.inputLabel}>Description / Notes</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="Optional notes..."
                            value={note}
                            onChangeText={setNote}
                            multiline
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: themeColor }, submitting && { opacity: 0.7 }]}
                            onPress={handleCreateEvent}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Schedule Event</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
            <AlertComponent />
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    scroll: { padding: 14, paddingBottom: 90 },
    calendarCard: {
        borderRadius: radii.lg,
        paddingBottom: 8,
        marginBottom: 20,
        ...shadows.card
    },
    eventsSection: {
        paddingHorizontal: 4,
    },
    sectionTitle: {
        ...typography.bodyMedium,
        color: colors.text.dark,
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: colors.white,
        borderRadius: radii.md,
        ...shadows.card
    },
    emptyText: {
        ...typography.body,
        color: colors.text.muted,
        marginTop: 12
    },
    eventCard: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: radii.md,
        marginBottom: 12,
        overflow: 'hidden',
        ...shadows.card
    },
    eventIndicator: {
        width: 6,
    },
    eventInfo: {
        flex: 1,
        padding: 16,
    },
    eventTitle: {
        ...typography.bodyMedium,
        color: colors.text.dark,
        marginBottom: 4,
    },
    eventNote: {
        ...typography.body,
        color: colors.text.muted,
        marginBottom: 8,
    },
    eventAuthor: {
        ...typography.caption,
        color: colors.text.light,
    },
    /* FAB */
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.button
    },
    /* Modal */
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: colors.white
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1A1A1A'
    },
    modalContent: {
        padding: 20
    },
    inputLabel: {
        ...typography.smallMedium,
        color: colors.text.dark,
        marginBottom: 8,
        marginTop: 16
    },
    input: {
        backgroundColor: '#F9F9F9',
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1A1A1A'
    },
    submitBtn: {
        marginTop: 32,
        paddingVertical: 16,
        borderRadius: radii.md,
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitBtnText: {
        ...typography.button,
        color: colors.white
    }
});
