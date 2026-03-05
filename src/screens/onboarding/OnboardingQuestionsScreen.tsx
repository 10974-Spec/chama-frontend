import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_COLOR = '#F5F5F0';

export default function OnboardingQuestionsScreen() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { user, login } = useAppContext();

    // Fallback if data is missing
    const intent = route.params?.intent || 'join';
    const identityData = route.params?.identityData || {};

    const [experience, setExperience] = useState<string | null>(null);
    const [goal, setGoal] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1);

    const goals = ['Save money', 'Invest', 'Access loans', 'Track transparency'];
    const roles = ['Member', 'Treasurer', 'Chairperson'];

    const handleFinish = async () => {
        setIsSaving(true);
        try {
            // Update the profile API with both identityData and onboardingAnswers
            const payload = {
                idNumber: identityData.idNumber,
                dob: identityData.dob,
                idFrontImage: identityData.idFront,
                idBackImage: identityData.idBack,
                onboardingAnswers: { experience, goals: goal, role },
                onboardingCompleted: true
            };

            const res = await api.put('/auth/profile', payload);

            // Check for pending invite code
            const inviteCode = await AsyncStorage.getItem('pendingInviteCode');
            if (inviteCode) {
                try {
                    await api.post('/chamas/join', { inviteCode });
                    await AsyncStorage.removeItem('pendingInviteCode');

                    // Force navigation to MainApp by updating context
                    const currentToken = await AsyncStorage.getItem('token');
                    if (user && currentToken) {
                        await login(currentToken, { ...user, onboardingCompleted: true });
                    }
                    return; // Stop here, AppNavigator handles the switch
                } catch (e: any) {
                    console.error('Failed to auto-join', e.response?.data || e.message);
                    Alert.alert('Invite Failed', e.response?.data?.message || 'Could not auto-join Chama.');
                    await AsyncStorage.removeItem('pendingInviteCode');
                }
            }

            // Route to next flow based on intent
            if (intent === 'create') {
                navigation.replace('CreateChamaFlow');
            } else {
                navigation.replace('JoinChamaFlow');
            }

        } catch (error: any) {
            console.error('Failed to complete onboarding', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to save your profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const renderOption = (selectedVal: string | null, setVal: any, options: string[]) => (
        <View style={styles.optionsWrap}>
            {options.map((opt) => {
                const isSelected = selectedVal === opt;
                return (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                        onPress={() => setVal(opt)}
                    >
                        <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
                        {isSelected && <Ionicons name="checkmark-circle" size={20} color={PRIMARY_GREEN} />}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.progressWrap}>
                        <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                        <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                        <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
                    </View>
                </View>

                <View style={styles.titleSection}>
                    <Text style={styles.title}>Personalize Your Experience</Text>
                    <Text style={styles.subtitle}>Help us customize your dashboard by answering a few quick questions.</Text>
                </View>

                {/* Experience */}
                {step === 1 && (
                    <View style={styles.questionBlock}>
                        <Text style={styles.questionText}>Have you been in a chama before?</Text>
                        {renderOption(experience, setExperience, ['Yes', 'No'])}
                    </View>
                )}

                {/* Goal */}
                {step === 2 && (
                    <View style={styles.questionBlock}>
                        <Text style={styles.questionText}>What is your primary goal?</Text>
                        {renderOption(goal, setGoal, goals)}
                    </View>
                )}

                {/* Role */}
                {step === 3 && (
                    <View style={styles.questionBlock}>
                        <Text style={styles.questionText}>Which role fits you best?</Text>
                        {renderOption(role, setRole, roles)}
                    </View>
                )}

                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.primaryBtnWrap}
                        activeOpacity={0.88}
                        onPress={handleNext}
                        disabled={isSaving}
                    >
                        <LinearGradient
                            colors={isSaving ? ['#999', '#999'] : ['#4CAF50', PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryBtn}
                        >
                            {isSaving ? (
                                <ActivityIndicator color={colors.white} />
                            ) : step === 3 ? (
                                <>
                                    <Text style={styles.primaryBtnText}>Finish & Setup Chama</Text>
                                    <Ionicons name="sparkles" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.primaryBtnText}>Next</Text>
                                    <Ionicons name="arrow-forward" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Skip button allows them to finish without answering */}
                    <TouchableOpacity style={styles.skipBtn} onPress={handleFinish} disabled={isSaving}>
                        <Text style={styles.skipBtnText}>Skip for now</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8E8E8', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    progressWrap: { flex: 1, flexDirection: 'row', gap: 8, paddingRight: 40 },
    progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
    progressDotActive: { backgroundColor: PRIMARY_GREEN },

    titleSection: { marginBottom: 32 },
    title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#666666', lineHeight: 22 },

    questionBlock: { marginBottom: 28 },
    questionText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    optionsWrap: { gap: 10 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, paddingHorizontal: 20, height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    optionBtnActive: { borderColor: PRIMARY_GREEN, backgroundColor: '#E8F5E9' },
    optionText: { fontSize: 15, fontWeight: '500', color: '#4A4A4A' },
    optionTextActive: { color: PRIMARY_GREEN, fontWeight: '700' },

    bottomSection: { width: '100%', marginTop: 'auto', paddingTop: 24 },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden', marginBottom: 16 },
    primaryBtn: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    primaryBtnText: { fontSize: 17, fontWeight: '700', color: colors.white },

    skipBtn: { alignItems: 'center', paddingVertical: 12 },
    skipBtnText: { fontSize: 15, fontWeight: '600', color: '#888888' },
});
