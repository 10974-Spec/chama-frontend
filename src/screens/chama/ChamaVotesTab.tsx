import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useRoute } from '@react-navigation/native';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { useCustomAlert } from '../../components/ui/CustomAlert';

export default function ChamaVotesTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const chamaId = route.params?.chamaId;
    const adminId = route.params?.adminId;
    const themeColor = '#2A5C3F';
    const { user } = useApp();
    const isAdmin = adminId === user?._id;
    const { showAlert, AlertComponent } = useCustomAlert();

    const [votes, setVotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Create Poll State
    const [modalVisible, setModalVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [days, setDays] = useState('3');
    const [submitting, setSubmitting] = useState(false);

    const fetchVotes = async () => {
        if (!chamaId || chamaId.startsWith('mock-')) return setLoading(false);
        try {
            const res = await api.get(`/chamas/${chamaId}/votes`);
            setVotes(res.data);
        } catch (error) {
            console.error('Failed to fetch votes', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchVotes();
    }, [chamaId]);

    const handleCreatePoll = async () => {
        if (!title.trim() || !question.trim() || !days.trim() || !chamaId) {
            showAlert('warning', 'Validation', 'Please fill in all fields.');
            return;
        }
        setSubmitting(true);
        try {
            const deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + parseInt(days, 10));

            const res = await api.post(`/chamas/${chamaId}/votes`, {
                title,
                question,
                deadline: deadlineDate,
                options: ['Yes', 'No']
            });
            setVotes(prev => [res.data, ...prev]);
            setModalVisible(false);
            setTitle('');
            setQuestion('');
            setDays('3');
            showAlert('success', 'Poll Created', 'Poll created successfully.');
        } catch (error) {
            console.error('Failed to create vote', error);
            showAlert('error', 'Error', 'Could not create the poll.');
        } finally {
            setSubmitting(false);
        }
    };

    const castVote = async (voteId: string, optionId: string) => {
        if (!chamaId || chamaId.startsWith('mock-')) return;
        try {
            // Optimistic UI Data prep
            setVotes(prev => prev.map(v => {
                if (v._id !== voteId) return v;

                const myPastVoterIndex = v.voters.findIndex((voter: any) => voter.userId === user?._id);
                const activeOptionIndex = v.options.findIndex((opt: any) => opt._id === optionId);
                let prevOptionIndex = -1;

                const newVoters = [...v.voters];
                const newOptions = [...v.options];

                if (myPastVoterIndex !== -1) {
                    prevOptionIndex = v.options.findIndex((opt: any) => opt._id === newVoters[myPastVoterIndex].optionId);
                    if (prevOptionIndex !== -1 && prevOptionIndex !== activeOptionIndex) {
                        newOptions[prevOptionIndex].count = Math.max(0, newOptions[prevOptionIndex].count - 1);
                    }
                    newVoters[myPastVoterIndex].optionId = optionId;
                } else {
                    newVoters.push({ userId: user?._id, optionId });
                }

                if (activeOptionIndex !== -1 && prevOptionIndex !== activeOptionIndex) {
                    newOptions[activeOptionIndex].count += 1;
                }

                return { ...v, voters: newVoters, options: newOptions };
            }));

            await api.post(`/chamas/${chamaId}/votes/${voteId}/cast`, { optionId });
        } catch (error) {
            console.error('Failed to cast vote', error);
            fetchVotes();
            showAlert('error', 'Error', 'Could not cast your vote.');
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F8FA' }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchVotes(); }} />}
            >
                {votes.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No active polls.</Text>
                ) : null}

                {votes.map(vote => {
                    const totalVotes = vote.options.reduce((sum: number, opt: any) => sum + opt.count, 0);
                    const hasEnded = new Date(vote.deadline) < new Date();

                    const myVoteData = vote.voters.find((voter: any) => voter.userId === user?._id);
                    const myVoteOptId = myVoteData ? myVoteData.optionId : null;

                    return (
                        <View key={vote._id} style={styles.card}>
                            <View style={styles.cardTop}>
                                <View style={[styles.statusBadge, hasEnded ? styles.endedBadge : { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.statusText, { color: hasEnded ? colors.text.muted : themeColor }]}>
                                        {hasEnded ? 'Ended' : `Active until ${new Date(vote.deadline).toLocaleDateString()}`}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.question}>{vote.question}</Text>

                            {/* Vote bars */}
                            <View style={styles.barSection}>
                                {vote.options.map((opt: any, index: number) => {
                                    const pct = totalVotes > 0 ? opt.count / totalVotes : 0;
                                    const isYes = opt.label.toLowerCase() === 'yes';
                                    const color = isYes ? themeColor : (index === 1 ? '#FA5252' : colors.text.muted);
                                    const bgColor = isYes ? (themeColor + '20') : (index === 1 ? '#FFF0F0' : '#E0E0E0');

                                    return (
                                        <View key={opt._id} style={styles.barRow}>
                                            <Text style={styles.barLabel}>{opt.label}</Text>
                                            <ProgressBar progress={pct} height={7} color={color} backgroundColor={bgColor} />
                                            <Text style={[styles.barPct, { color }]}>{Math.round(pct * 100)}%</Text>
                                        </View>
                                    );
                                })}
                                <Text style={styles.voteCounts}>{totalVotes} total votes</Text>
                            </View>

                            {/* Vote buttons */}
                            {!hasEnded && (
                                <View style={styles.btnRow}>
                                    {vote.options.map((opt: any, index: number) => {
                                        const isYes = opt.label.toLowerCase() === 'yes';
                                        const isMyVote = myVoteOptId === opt._id;

                                        return (
                                            <TouchableOpacity
                                                key={opt._id}
                                                style={[
                                                    styles.voteBtn,
                                                    !isYes && styles.voteBtnNoVariant,
                                                    isMyVote && isYes && { backgroundColor: themeColor, borderColor: themeColor },
                                                    isMyVote && !isYes && styles.voteBtnNoActive,
                                                    isYes && !isMyVote && { borderColor: themeColor }
                                                ]}
                                                onPress={() => castVote(vote._id, opt._id)}
                                            >
                                                <Ionicons
                                                    name={isYes ? "thumbs-up-outline" : "thumbs-down-outline"}
                                                    size={16}
                                                    color={isMyVote ? colors.white : (isYes ? themeColor : colors.text.muted)}
                                                />
                                                <Text style={[
                                                    styles.voteBtnText,
                                                    { color: isMyVote ? colors.white : (isYes ? themeColor : colors.text.muted) }
                                                ]}>
                                                    {opt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            {isAdmin && (
                <TouchableOpacity style={[styles.fab, { backgroundColor: themeColor }]} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={28} color={colors.white} />
                </TouchableOpacity>
            )}

            {/* Create Poll Modal */}
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
                        <Text style={styles.modalTitle}>Create New Poll</Text>
                        <View style={{ width: 42 }} />
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.inputLabel}>Poll Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Fine Changes"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.inputLabel}>Question</Text>
                        <TextInput
                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                            placeholder="e.g. Should we increase the late fee to 200?"
                            value={question}
                            onChangeText={setQuestion}
                            multiline
                        />

                        <Text style={styles.inputLabel}>Duration (Days)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 3"
                            value={days}
                            onChangeText={setDays}
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: themeColor }, submitting && { opacity: 0.7 }]}
                            onPress={handleCreatePoll}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.submitBtnText}>Publish Poll</Text>
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
    card: { backgroundColor: colors.white, borderRadius: radii.lg, padding: 16, marginBottom: 12, ...shadows.card },
    cardTop: { flexDirection: 'row', marginBottom: 10 },
    statusBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4 },
    endedBadge: { backgroundColor: '#F5F5F5' },
    statusText: { ...typography.smallMedium },
    question: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 14, lineHeight: 22 },
    barSection: { gap: 8, marginBottom: 14 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    barLabel: { ...typography.smallMedium, color: colors.text.muted, width: 28 },
    barPct: { ...typography.smallMedium, color: colors.primary, width: 32, textAlign: 'right' },
    voteCounts: { ...typography.caption, color: colors.text.light, textAlign: 'center' },
    btnRow: { flexDirection: 'row', gap: 10 },
    voteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 99, paddingVertical: 10, borderWidth: 1.5 },
    voteBtnNoVariant: { borderColor: colors.border },
    voteBtnNoActive: { backgroundColor: '#FA5252', borderColor: '#FA5252' },
    voteBtnText: { ...typography.smallMedium },

    /* FAB */
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...shadows.button },

    /* Modal */
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: colors.white },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    modalContent: { padding: 20 },
    inputLabel: { ...typography.smallMedium, color: colors.text.dark, marginBottom: 8, marginTop: 16 },
    input: { backgroundColor: '#F9F9F9', borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1A1A1A' },
    submitBtn: { marginTop: 32, paddingVertical: 16, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { ...typography.button, color: colors.white }
});
