import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    ImageBackground, KeyboardAvoidingView, Platform, Image,
    Animated, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows } from '../../theme';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function OTPVerificationScreen({ route, navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { phoneNumber, autoOtp } = route.params || {};
    const { login } = useApp();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(28);
    const [isLoading, setIsLoading] = useState(false);

    const inputs = useRef<TextInput[]>([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Auto-fill OTP if provided (while SMS delivery is being fixed)
    useEffect(() => {
        if (autoOtp && autoOtp.length === 6) {
            setOtp(autoOtp.split(''));
        }
    }, [autoOtp]);

    useEffect(() => {
        if (!phoneNumber) {
            Alert.alert('Error', 'No phone number provided');
            navigation.goBack();
        }

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();

        const interval = setInterval(() => setTimer(t => (t > 0 ? t - 1 : 0)), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (val: string, idx: number) => {
        const next = [...otp];
        next[idx] = val;
        setOtp(next);
        if (val && idx < 5) inputs.current[idx + 1]?.focus();
        if (!val && idx > 0) inputs.current[idx - 1]?.focus();
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) return;
        setIsLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { phoneNumber, otp: otpString });
            await login(res.data.token, {
                _id: res.data._id,
                phoneNumber: res.data.phoneNumber,
                name: res.data.name,
                trustScore: res.data.trustScore || 50,
                onboardingCompleted: res.data.onboardingCompleted ?? false,
            });
        } catch (error: any) {
            Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            const res = await api.post('/auth/send-otp', { phoneNumber });
            setTimer(30);
            if (res.data.otp) {
                setOtp(res.data.otp.split(''));
            } else {
                Alert.alert('OTP Sent', 'A new code has been sent to your phone.');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const allFilled = otp.every(d => d !== '');

    // Format timer as 0:XX
    const timerFormatted = `0:${timer.toString().padStart(2, '0')}`;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} />

            {/* ── Top header ── */}
            <View style={styles.topHeader}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>
                {/* Custom Logo Image */}
                <Image source={require('../../../assets/chama-logo.png')} style={styles.headerLogoImage} resizeMode="contain" />
                <View style={{ width: 38 }} />
            </View>

            {/* ── Main content ── */}
            <Animated.View
                style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
                {/* Title */}
                <Text style={styles.title}>Verify Your Phone</Text>
                <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to{' '}
                    <Text style={styles.phoneHighlight}>
                        {phoneNumber || '+254 712 345678'}
                    </Text>
                </Text>

                {/* OTP boxes */}
                <View style={styles.otpRow}>
                    {otp.map((digit, i) => (
                        <TextInput
                            key={i}
                            ref={r => { if (r) inputs.current[i] = r; }}
                            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                            value={digit}
                            onChangeText={v => handleChange(v.slice(-1), i)}
                            keyboardType="number-pad"
                            maxLength={1}
                            textAlign="center"
                            editable={!isLoading}
                            selectionColor={PRIMARY_GREEN}
                        />
                    ))}
                </View>

                {/* Timer / Resend */}
                <Text style={styles.waitingText}>Waiting for OTP...</Text>
                {timer > 0 ? (
                    <Text style={styles.resendTimer}>
                        Resend Code in{' '}
                        <Text style={styles.timerHighlight}>{timerFormatted}</Text>
                    </Text>
                ) : (
                    <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                        <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                )}

                {/* Verify button */}
                <View style={[styles.verifyBtnShadow, !allFilled && styles.verifyBtnDisabled, isLoading && { opacity: 0.75 }]}>
                    <TouchableOpacity
                        style={styles.verifyBtnWrap}
                        onPress={handleVerify}
                        disabled={!allFilled || isLoading}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.verifyBtn}
                        >
                            {isLoading ? (
                                <ActivityIndicator color={BG_WHITE} />
                            ) : (
                                <Text style={styles.verifyBtnText}>Verify</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Change phone number */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeNumberBtn}>
                    <Text style={styles.changeNumberText}>Change Phone Number</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* ── Bottom image with top fade ── */}
            <View style={styles.bottomImageWrapper} pointerEvents="none">
                <ImageBackground
                    source={require('../../../assets/image1.jpeg')}
                    style={styles.bottomImage}
                    resizeMode="cover"
                >
                    {/* Left fade */}
                    <LinearGradient
                        colors={[BG_WHITE, 'transparent']}
                        start={{ x: 0, y: 0.5 }} end={{ x: 0.2, y: 0.5 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {/* Right fade */}
                    <LinearGradient
                        colors={['transparent', BG_WHITE]}
                        start={{ x: 0.8, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    {/* Top fade — strongest, blends into white above */}
                    <LinearGradient
                        colors={[BG_WHITE, 'rgba(255,255,255,0.6)', 'transparent']}
                        style={styles.bottomImageFadeTop}
                    />
                    {/* Bottom fade */}
                    <LinearGradient
                        colors={['transparent', BG_WHITE]}
                        style={styles.bottomImageFadeBottom}
                    />
                </ImageBackground>
            </View>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_WHITE,
    },

    /* ── Header ── */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 52,
        paddingBottom: 8,
    },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: '#F5F5F5',
        alignItems: 'center', justifyContent: 'center',
    },
    headerLogoImage: { width: 180, height: 50, transform: [{ scale: 1.6 }] },

    /* ── Content ── */
    content: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 24,
        zIndex: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 14,
        color: '#777777',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    phoneHighlight: {
        color: PRIMARY_GREEN,
        fontWeight: '700',
    },

    /* ── OTP boxes ── */
    otpRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    otpBox: {
        width: 50,
        height: 58,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        backgroundColor: '#F9F9F9',
        fontSize: 24,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    otpBoxFilled: {
        borderColor: PRIMARY_GREEN,
        backgroundColor: '#E8F5E9',
        color: PRIMARY_GREEN,
    },

    /* ── Timer / Resend ── */
    waitingText: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 4,
        fontWeight: '500',
    },
    resendTimer: {
        fontSize: 14,
        color: '#888888',
        marginBottom: 32,
    },
    timerHighlight: {
        color: PRIMARY_GREEN,
        fontWeight: '700',
    },
    resendLink: {
        fontSize: 14,
        fontWeight: '700',
        color: PRIMARY_GREEN,
        marginBottom: 32,
    },

    /* ── Verify button ── */
    verifyBtnShadow: {
        width: '100%',
        borderRadius: 999,
        marginBottom: 16,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: PRIMARY_GREEN,
    },
    verifyBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    verifyBtn: {
        paddingVertical: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    verifyBtnDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    verifyBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: BG_WHITE,
        letterSpacing: 0.2,
    },

    /* ── Change number ── */
    changeNumberBtn: {
        paddingVertical: 8,
    },
    changeNumberText: {
        fontSize: 14,
        color: '#888888',
        textDecorationLine: 'underline',
    },

    /* ── Bottom image ── */
    bottomImageWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 240,
        zIndex: 0,
    },
    bottomImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    bottomImageFadeTop: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '60%',
    },
    bottomImageFadeBottom: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '25%',
    },
});