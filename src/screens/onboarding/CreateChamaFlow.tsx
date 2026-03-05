import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, ImageBackground } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows } from '../../theme';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { useCustomAlert } from '../../components/ui/CustomAlert';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function CreateChamaFlow({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { user, login } = useAppContext();
    const { showAlert, AlertComponent } = useCustomAlert();
    const [step, setStep] = useState(1);

    // Form data
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [chamaType, setChamaType] = useState('Investment');
    const [expectedMembers, setExpectedMembers] = useState('10-20');

    const [contribution, setContribution] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    const [loading, setLoading] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [createdChamaId, setCreatedChamaId] = useState('');

    const types = ['Investment', 'Merry-go-round', 'Welfare', 'Other'];
    const memberRanges = ['Under 10', '10-20', '21-50', '50+'];

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/chamas', {
                name,
                description: desc,
                chamaType,
                expectedMembersCount: expectedMembers,
                weeklyContribution: Number(contribution) || 0,
                visibility: isPublic ? 'public' : 'private',
                maxMembers: 50 // Defaulting for simple flow
            });
            setCreatedChamaId(res.data._id);
            setInviteCode(res.data.inviteCode);
            setStep(4); // Success step
        } catch (err: any) {
            showAlert('error', 'Create Failed', err?.response?.data?.message || 'Failed to create chama');;
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) return showAlert('warning', 'Missing Info', 'Please provide a name for your Chama.');
            setStep(2);
        } else if (step === 2) {
            if (!contribution) return showAlert('warning', 'Missing Info', 'Please set a weekly contribution amount.');
            setStep(3);
        } else if (step === 3) {
            handleCreate();
        }
    };

    const handleBack = () => {
        if (step > 1 && step < 4) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleFinish = async () => {
        // Since onboarding is complete, ensure context is totally fresh and route to main app.
        // As AppNavigator listens to user.onboardingCompleted which is true now, 
        // we might just need to refresh or if we can't, navigate to MainApp manually if it's in the stack.
        // Assuming we can trigger context refresh or just navigate out.
        // We will just try to navigate out if standard routing doesn't kick in.

        try {
            const res = await api.get('/auth/profile');
            if (res.data) {
                // Get current token from storage, we don't have it here directly, so use api wrapper internally
                // We'll just force navigate for now:
            }
        } catch (e) { }

        // Fallback: This stack is contained within `OnboardingNavigator`. If `user` state changed, AppNavigator unmounts this. 
        // But if it didn't, we can navigate up to MainApp if we exposed it, or we rely on AppContext reload.
        showAlert('success', 'Chama Created!', "Your Chama is ready. Let's walk through the features.", [
            {
                text: "Continue", onPress: () => {
                    navigation.navigate('FeatureWalkthroughScreen', { intent: 'admin' });
                }
            }
        ]);
    };

    const copyCode = () => {
        Clipboard.setStringAsync(inviteCode);
        showAlert('info', 'Invite Code Copied!', 'Share this code with your members so they can join.');
    };

    return (
        <>
            <View style={styles.container}>
                <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />

                <View style={styles.topHeader}>
                    {step < 4 && (
                        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
                            <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                    )}
                    <View style={styles.progressWrap}>
                        {[1, 2, 3].map(s => <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />)}
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {step === 1 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.title}>Chama Basics</Text>
                            <Text style={styles.subtitle}>Let's start by defining your group's identity and purpose.</Text>

                            <Text style={styles.label}>Chama Name</Text>
                            <TextInput style={styles.input} placeholder="e.g. Visionaries 2024" value={name} onChangeText={setName} />

                            <Text style={styles.label}>Description purpose</Text>
                            <TextInput style={[styles.input, { height: 80 }]} placeholder="What is the goal of this Chama?" multiline value={desc} onChangeText={setDesc} />

                            <Text style={styles.label}>Chama Type</Text>
                            <View style={styles.chipRow}>
                                {types.map(t => (
                                    <TouchableOpacity key={t} style={[styles.chip, chamaType === t && styles.chipActive]} onPress={() => setChamaType(t)}>
                                        <Text style={[styles.chipText, chamaType === t && styles.chipTextActive]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.label}>Expected Members</Text>
                            <View style={styles.chipRow}>
                                {memberRanges.map(r => (
                                    <TouchableOpacity key={r} style={[styles.chip, expectedMembers === r && styles.chipActive]} onPress={() => setExpectedMembers(r)}>
                                        <Text style={[styles.chipText, expectedMembers === r && styles.chipTextActive]}>{r}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.title}>Operations</Text>
                            <Text style={styles.subtitle}>Define the financial rules for the members.</Text>

                            <Text style={styles.label}>Default Weekly Contribution (KSh)</Text>
                            <TextInput style={styles.input} placeholder="e.g. 500" keyboardType="numeric" value={contribution} onChangeText={setContribution} />

                            <Text style={styles.label}>Visibility</Text>
                            <View style={styles.rowBtnWrap}>
                                <TouchableOpacity style={[styles.rowBtn, isPublic && styles.rowBtnActive]} onPress={() => setIsPublic(true)}>
                                    <Ionicons name="globe-outline" size={24} color={isPublic ? PRIMARY_GREEN : '#888'} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.rowBtnTitle, isPublic && styles.rowBtnTitleActive]}>Public</Text>
                                        <Text style={styles.rowBtnSub}>Anyone can request to join</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.rowBtn, !isPublic && styles.rowBtnActive]} onPress={() => setIsPublic(false)}>
                                    <Ionicons name="lock-closed-outline" size={24} color={!isPublic ? PRIMARY_GREEN : '#888'} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.rowBtnTitle, !isPublic && styles.rowBtnTitleActive]}>Private</Text>
                                        <Text style={styles.rowBtnSub}>Invite-only via link/code</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepContainer}>
                            <Text style={styles.title}>Review & Confirm</Text>
                            <Text style={styles.subtitle}>Make sure everything looks good before creating.</Text>

                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>{name || 'Unnamed Chama'}</Text>
                                <Text style={styles.summaryDesc}>{desc || 'No description provided.'}</Text>

                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Type</Text>
                                    <Text style={styles.summaryValue}>{chamaType}</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Size</Text>
                                    <Text style={styles.summaryValue}>{expectedMembers} members</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Contribution</Text>
                                    <Text style={styles.summaryValue}>KSh {contribution} / wk</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Visibility</Text>
                                    <Text style={styles.summaryValue}>{isPublic ? 'Public' : 'Private'}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View style={styles.stepContainer}>
                            <View style={styles.successIcon}>
                                <Ionicons name="checkmark-circle" size={80} color={PRIMARY_GREEN} />
                            </View>
                            <Text style={[styles.title, { textAlign: 'center' }]}>Chama Created!</Text>
                            <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 32 }]}>
                                Your group has been successfully set up. Invite your members using the code below.
                            </Text>

                            <View style={styles.inviteBox}>
                                <Text style={styles.inviteBoxLabel}>YOUR INVITE CODE</Text>
                                <Text style={styles.inviteCode}>{inviteCode}</Text>
                                <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
                                    <Ionicons name="copy-outline" size={20} color={PRIMARY_GREEN} />
                                    <Text style={styles.copyText}>Copy Code</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Bottom Nav */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity
                        style={styles.primaryBtnWrap}
                        onPress={step === 4 ? handleFinish : handleNext}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#4CAF50', PRIMARY_GREEN, '#1B3D28']} style={styles.primaryBtn}>
                            {loading ? <ActivityIndicator color="#fff" /> :
                                <Text style={styles.primaryBtnText}>
                                    {step === 1 || step === 2 ? 'Next' : step === 3 ? 'Confirm & Create' : 'Finish & Go to Dashboard'}
                                </Text>
                            }
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
            <AlertComponent />
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_WHITE },
    topHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 10 },
    iconBtn: { padding: 8, backgroundColor: '#F0F0F0', borderRadius: 20, marginRight: 16 },
    progressWrap: { flex: 1, flexDirection: 'row', gap: 8, paddingRight: 40 },
    progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
    progressDotActive: { backgroundColor: PRIMARY_GREEN },

    scroll: { padding: 24, paddingBottom: 100 },
    stepContainer: { flex: 1 },
    title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 32, lineHeight: 22 },

    label: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 10, marginTop: 16 },
    input: { backgroundColor: '#F9F9F9', borderWidth: 1, borderColor: '#E8E8E8', borderRadius: 12, paddingHorizontal: 16, height: 56, fontSize: 16 },

    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: 'transparent' },
    chipActive: { backgroundColor: '#E8F5E9', borderColor: PRIMARY_GREEN },
    chipText: { fontSize: 14, color: '#666', fontWeight: '500' },
    chipTextActive: { color: PRIMARY_GREEN, fontWeight: '700' },

    rowBtnWrap: { gap: 12 },
    rowBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#F0F0F0', backgroundColor: '#F9F9F9', height: 80, paddingHorizontal: 20 },
    rowBtnActive: { borderColor: PRIMARY_GREEN, backgroundColor: '#E8F5E9' },
    rowBtnTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    rowBtnTitleActive: { color: PRIMARY_GREEN },
    rowBtnSub: { fontSize: 13, color: '#666', marginTop: 2 },

    summaryCard: { backgroundColor: '#F9F9F9', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E8E8E8' },
    summaryTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
    summaryDesc: { fontSize: 14, color: '#666', marginBottom: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: 1, borderColor: '#E8E8E8' },
    summaryLabel: { fontSize: 14, color: '#666' },
    summaryValue: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

    successIcon: { alignItems: 'center', marginBottom: 24, marginTop: 40 },
    inviteBox: { backgroundColor: '#E8F5E9', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderColor: PRIMARY_GREEN, borderStyle: 'dashed' },
    inviteBoxLabel: { fontSize: 12, fontWeight: '700', color: PRIMARY_GREEN, letterSpacing: 1.5, marginBottom: 12 },
    inviteCode: { fontSize: 36, fontWeight: '800', color: '#1A1A1A', letterSpacing: 4, marginBottom: 20 },
    copyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, ...shadows.button },
    copyText: { marginLeft: 8, fontSize: 15, fontWeight: '700', color: PRIMARY_GREEN },

    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: BG_WHITE, borderTopWidth: 1, borderColor: '#E8E8E8' },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    primaryBtn: { height: 60, alignItems: 'center', justifyContent: 'center' },
    primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' }
});
