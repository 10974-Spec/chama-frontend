import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    Animated, ScrollView, KeyboardAvoidingView, Platform, StatusBar,
    ActivityIndicator, Alert, ImageBackground, Dimensions, Modal, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows, radii } from '../../theme';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const PRIMARY_GREEN = '#2A5C3F';
const PRIMARY_GREEN_LIGHT = '#3A7D54';
const MPESA_GREEN = '#2E7D32';
const BG_COLOR = '#F5F5F0';

export default function LoginSignupScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { login } = useApp();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [identifier, setIdentifier] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [inviteModalVisible, setInviteModalVisible] = useState(false);
    const [inviteInput, setInviteInput] = useState('');

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Error', 'Please enter your phone number/email and password.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.post('/auth/login', { phoneNumber: identifier, password });
            await login(res.data.token, {
                _id: res.data._id,
                phoneNumber: res.data.phoneNumber,
                name: res.data.name,
                trustScore: res.data.trustScore || 50,
                onboardingCompleted: res.data.onboardingCompleted ?? false,
            });
        } catch (error: any) {
            if (error.response?.status === 403 && error.response?.data?.requireOtp) {
                navigation.navigate('OTPVerification', { phoneNumber: identifier });
            } else {
                Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!identifier || !password || !name) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.post('/auth/register', { phoneNumber: identifier, name, password });
            if (res.status === 201 && res.data.requireOtp) {
                navigation.navigate('OTPVerification', { phoneNumber: identifier });
            }
        } catch (error: any) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteSubmit = async () => {
        if (!inviteInput) {
            Alert.alert('Error', 'Please enter an invite link or code.');
            return;
        }

        let extractedCode = inviteInput.trim();
        // If it's a URL, try to extract the ?code= parameter or the last path segment
        if (inviteInput.includes('code=')) {
            extractedCode = inviteInput.split('code=')[1].split('&')[0];
        } else if (inviteInput.includes('/')) {
            const parts = inviteInput.split('/');
            extractedCode = parts[parts.length - 1];
        }

        try {
            await AsyncStorage.setItem('pendingInviteCode', extractedCode);
            setInviteModalVisible(false);
            setMode('signup');
            Alert.alert('Invite Code Saved', 'Please create an account to join the Chama automatically.');
        } catch (error) {
            console.error('Failed to save invite code', error);
        }
    };

    const isLogin = mode === 'login';

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <StatusBar barStyle="dark-content" backgroundColor={BG_COLOR} />

            {/* ── Watermark background ── */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.13 }}
            />

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    {/* ── Logo ── */}
                    <Image source={require('../../../assets/chama-logo.png')} style={styles.headerLogoImage} resizeMode="contain" />

                    {/* ── Title ── */}
                    <Text style={styles.title}>
                        {isLogin ? 'Login to Chama' : 'Join Chama'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isLogin ? 'Welcome back! Log in to continue' : 'Create an account to get started'}
                    </Text>

                    {/* ── Form ── */}
                    <View style={styles.formSection}>

                        {/* Full Name — Signup only */}
                        {!isLogin && (
                            <View style={styles.inputRow}>
                                <View style={styles.iconPrefix}>
                                    <Ionicons name="person-outline" size={20} color="#9E9E9E" />
                                </View>
                                <View style={styles.inputDivider} />
                                <TextInput
                                    style={[styles.inputText, { flex: 1 }]}
                                    placeholder="Full Name"
                                    placeholderTextColor="#BDBDBD"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                        )}

                        {/* Phone */}
                        <View style={styles.inputRow}>
                            <View style={styles.flagPrefix}>
                                <Text style={styles.flagEmoji}>🇰🇪</Text>
                                <Text style={styles.countryCode}>+254</Text>
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={[styles.inputText, { flex: 1 }]}
                                placeholder={isLogin ? 'Phone number' : '07xxxxxxxx'}
                                placeholderTextColor="#BDBDBD"
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                value={identifier}
                                onChangeText={setIdentifier}
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputRow}>
                            <View style={styles.iconPrefix}>
                                <Ionicons name="lock-closed-outline" size={20} color="#9E9E9E" />
                            </View>
                            <View style={styles.inputDivider} />
                            <TextInput
                                style={[styles.inputText, { flex: 1 }]}
                                placeholder="Password"
                                placeholderTextColor="#BDBDBD"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                                <Ionicons
                                    name={showPass ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#9E9E9E"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.bottomSection}>
                        {/* ── Gradient Login button ── */}
                        <TouchableOpacity
                            style={[styles.primaryBtnWrap, isLoading && { opacity: 0.75 }]}
                            onPress={isLogin ? handleLogin : handleSignup}
                            activeOpacity={0.88}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.primaryBtn}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.primaryBtnText}>
                                        {isLogin ? 'Log in' : 'Create Account'}
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* ── OR Divider — more vertical space ── */}
                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>or</Text>
                            <View style={styles.orLine} />
                        </View>

                        {/* ── Continue with MPESA ── */}
                        <TouchableOpacity style={styles.mpesaBtn} activeOpacity={0.88}>
                            <View style={styles.mpesaIconWrap}>
                                <Ionicons name="phone-portrait-outline" size={20} color={MPESA_GREEN} />
                            </View>
                            <Text style={styles.mpesaBtnText}>Continue with MPESA</Text>
                        </TouchableOpacity>

                        {/* ── Sign in with Invite Link ── */}
                        <TouchableOpacity style={[styles.mpesaBtn, { borderColor: '#E8E8E8', marginTop: -16 }]} activeOpacity={0.88} onPress={() => setInviteModalVisible(true)}>
                            <View style={[styles.mpesaIconWrap, { backgroundColor: '#F5F5F5' }]}>
                                <Ionicons name="link-outline" size={20} color="#757575" />
                            </View>
                            <Text style={[styles.mpesaBtnText, { color: '#757575' }]}>Sign in with Invite Link</Text>
                        </TouchableOpacity>

                        {/* ── Terms ── */}
                        <Text style={styles.terms}>
                            By signing up, you agree to the{'\n'}
                            <Text style={styles.termsLink}>Terms & Privacy Policy</Text>
                        </Text>

                        {/* ── Toggle login / signup ── */}
                        <View style={styles.switchRow}>
                            <Text style={styles.switchPrompt}>
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            </Text>
                            <TouchableOpacity onPress={() => setMode(isLogin ? 'signup' : 'login')}>
                                <Text style={styles.switchLink}>
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Invite Link Modal */}
            <Modal visible={inviteModalVisible} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Enter Invite Link</Text>
                            <TouchableOpacity onPress={() => setInviteModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalDesc}>
                            Paste your Chama invite link or code below to join automatically after signing up.
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="e.g. https://chama.app/invite?code=CH123"
                            value={inviteInput}
                            onChangeText={setInviteInput}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleInviteSubmit}>
                            <Text style={styles.modalSubmitText}>Continue</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },

    /* ── Scroll ── */
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 36,
        paddingVertical: 80,
    },
    inner: {
        width: '100%',
        alignItems: 'center',
        minHeight: Dimensions.get('window').height - 160,
    },

    /* ── Logo ── */
    logoWrap: {
        alignItems: 'center',
        marginBottom: 24,
    },
    headerLogoImage: {
        width: 280,
        height: 100,
        alignSelf: 'center',
        marginBottom: 10,
        transform: [{ scale: 1.8 }],
    },

    bottomSection: {
        width: '100%',
        alignItems: 'center',
        marginTop: 'auto', // Pushes it down
    },

    /* ── Title ── */
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 32,
    },

    /* ── Inputs — no shadow, cleaner white ── */
    formSection: {
        width: '100%',
        gap: 14,
        marginBottom: 28,          // more space before button
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 18,
        height: 68,
        // no shadow
    },
    flagPrefix: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingRight: 10,
    },
    flagEmoji: { fontSize: 20 },
    countryCode: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    iconPrefix: {
        paddingRight: 10,
    },
    inputDivider: {
        width: 1,
        height: 22,
        backgroundColor: '#E0E0E0',
        marginRight: 12,
    },
    inputText: {
        fontSize: 15,
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    eyeBtn: {
        padding: 6,
        marginLeft: 6,
    },

    /* ── Gradient primary button ── */
    primaryBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
        marginBottom: 32,          // extra space above OR
    },
    primaryBtn: {
        height: 68,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    primaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },

    /* ── OR Divider — generous spacing ── */
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 32,          // extra space below OR before MPESA
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#DDDDDD',
    },
    orText: {
        fontSize: 13,
        color: '#AAAAAA',
        marginHorizontal: 16,
    },

    /* ── MPESA button — no shadow, clean white ── */
    mpesaBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: MPESA_GREEN,
        borderRadius: 999,
        height: 68,
        backgroundColor: '#FFFFFF',
        marginBottom: 28,
        gap: 10,
        // no shadow
    },
    mpesaIconWrap: {
        width: 32, height: 32, borderRadius: 8,
        backgroundColor: '#E8F5E9',
        alignItems: 'center', justifyContent: 'center',
    },
    mpesaBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: MPESA_GREEN,
    },

    /* ── Terms ── */
    terms: {
        fontSize: 12,
        color: '#AAAAAA',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
    },
    termsLink: {
        color: '#666666',
        fontWeight: '600',
    },

    /* ── Switch Row ── */
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchPrompt: {
        fontSize: 14,
        color: '#757575',
    },
    switchLink: {
        fontSize: 14,
        fontWeight: '700',
        color: PRIMARY_GREEN,
    },

    /* ── Modal Styles ── */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { ...typography.h3 },
    modalDesc: { ...typography.body, color: '#757575', marginBottom: 24 },
    modalInput: { backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 16, marginBottom: 24, color: '#1A1A1A' },
    modalSubmitBtn: { backgroundColor: PRIMARY_GREEN, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    modalSubmitText: { ...typography.button, color: '#FFF' },
});