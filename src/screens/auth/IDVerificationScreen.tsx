import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';

const STEPS = ['Upload ID', 'Selfie', 'Submit'];

export default function IDVerificationScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const [step, setStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const goNext = () => {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
        if (step < 2) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]).start();
            setStep(s => s + 1);
        } else {
            navigation.navigate('ProfileSetup');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={22} color={colors.text.dark} />
            </TouchableOpacity>

            {/* Step indicator */}
            <View style={styles.stepRow}>
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <View style={styles.stepItem}>
                            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                                {i < step ? (
                                    <Ionicons name="checkmark" size={14} color={colors.white} />
                                ) : (
                                    <Text style={[styles.stepDotText, i === step && { color: colors.white }]}>{i + 1}</Text>
                                )}
                            </View>
                            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
                        </View>
                        {i < 2 && <View style={[styles.stepLine, i < step && styles.stepLineActive]} />}
                    </React.Fragment>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {step === 0 && (
                        <View style={styles.uploadSection}>
                            <Text style={styles.sectionTitle}>Upload Government-Issued ID</Text>
                            <Text style={styles.sectionSub}>Take a clear photo of the front & back of your ID card</Text>
                            {['Front side', 'Back side'].map(side => (
                                <TouchableOpacity key={side} style={styles.uploadBox}>
                                    <Ionicons name="camera-outline" size={32} color={colors.primary} />
                                    <Text style={styles.uploadBoxLabel}>{side}</Text>
                                    <Text style={styles.uploadBoxHint}>Tap to upload photo</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {step === 1 && (
                        <View style={styles.uploadSection}>
                            <Text style={styles.sectionTitle}>Take a Selfie</Text>
                            <Text style={styles.sectionSub}>Look straight at the camera with good lighting</Text>
                            <View style={styles.selfiePreview}>
                                <Ionicons name="person-circle-outline" size={80} color={colors.primary} style={{ opacity: 0.4 }} />
                                <Text style={styles.selfieHint}>Tap to open camera</Text>
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.uploadSection}>
                            <View style={styles.successIcon}>
                                <Ionicons name="shield-checkmark-outline" size={56} color={colors.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>Review & Submit</Text>
                            <Text style={styles.sectionSub}>Your documents will be reviewed within 24 hours. You'll get a ✅ Verified badge once approved.</Text>
                            <View style={styles.summaryCard}>
                                {[
                                    { icon: 'card-outline', label: 'ID Document', value: 'Uploaded ✓' },
                                    { icon: 'camera-outline', label: 'Selfie', value: 'Captured ✓' },
                                ].map(item => (
                                    <View key={item.label} style={styles.summaryRow}>
                                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                                        <Text style={styles.summaryLabel}>{item.label}</Text>
                                        <Text style={styles.summaryValue}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
                    <Text style={styles.nextBtnText}>{step < 2 ? 'Continue' : 'Submit for Review'}</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                {step < 2 && (
                    <TouchableOpacity onPress={() => setStep(s => s + 1)} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip for now</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 24 },
    back: { marginTop: 60, marginBottom: 20, width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, paddingHorizontal: 8 },
    stepItem: { alignItems: 'center' },
    stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    stepDotActive: { backgroundColor: colors.primary },
    stepDotText: { ...typography.smallMedium, color: colors.text.muted },
    stepLine: { flex: 1, height: 2, backgroundColor: colors.border, marginBottom: 20 },
    stepLineActive: { backgroundColor: colors.primary },
    stepLabel: { ...typography.caption, color: colors.text.muted },
    stepLabelActive: { color: colors.primary, fontWeight: '600' },
    scroll: { paddingBottom: 120 },
    uploadSection: { alignItems: 'center' },
    sectionTitle: { ...typography.h3, color: colors.text.dark, textAlign: 'center', marginBottom: 8 },
    sectionSub: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginBottom: 28 },
    uploadBox: {
        width: '100%', height: 130, borderRadius: radii.lg,
        borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
        backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    uploadBoxLabel: { ...typography.bodyMedium, color: colors.primary, marginTop: 8 },
    uploadBoxHint: { ...typography.small, color: colors.text.muted },
    selfiePreview: {
        width: 160, height: 160, borderRadius: 80,
        borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed',
        backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center',
    },
    selfieHint: { ...typography.small, color: colors.text.muted, marginTop: 8 },
    successIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    summaryCard: { width: '100%', backgroundColor: colors.primaryBg, borderRadius: radii.lg, padding: 16, gap: 12 },
    summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    summaryLabel: { ...typography.bodyMedium, color: colors.text.medium, flex: 1 },
    summaryValue: { ...typography.bodyMedium, color: colors.primary },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
    nextBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', ...shadows.button },
    nextBtnText: { ...typography.button, color: colors.white },
    skipBtn: { alignItems: 'center', marginTop: 10 },
    skipText: { ...typography.body, color: colors.text.muted },
});
