import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_COLOR = '#F5F5F0';

export default function WelcomeScreen() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const navigation = useNavigation<any>();
    const { logout } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.1 }}
            />

            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setShowLogoutModal(true)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="people" size={32} color={colors.white} />
                    </View>
                    <Text style={styles.title}>
                        Manage your chama.{'\n'}
                        <Text style={{ color: PRIMARY_GREEN }}>Securely.</Text>{'\n'}
                        <Text style={{ color: PRIMARY_GREEN }}>Transparently.</Text>{'\n'}
                        <Text style={{ color: PRIMARY_GREEN }}>Together.</Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Create or join a chama, track contributions, chat, and manage funds in one place.
                    </Text>
                </View>

                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.primaryBtnWrap}
                        activeOpacity={0.88}
                        onPress={() => setShowModal(true)}
                    >
                        <LinearGradient
                            colors={['#4CAF50', PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.primaryBtn}
                        >
                            <Ionicons name="add-circle-outline" size={24} color={colors.white} style={{ marginRight: 8 }} />
                            <Text style={styles.primaryBtnText}>Create a Chama</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryBtn}
                        activeOpacity={0.88}
                        onPress={() => navigation.navigate('IdentitySetupScreen', { intent: 'join' })}
                    >
                        <Ionicons name="enter-outline" size={24} color={PRIMARY_GREEN} style={{ marginRight: 8 }} />
                        <Text style={styles.secondaryBtnText}>Join a Chama</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.termsLink}
                        onPress={() => navigation.navigate('TermsPrivacy')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.termsLinkText}>Terms of Service  ·  Privacy Policy</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Logout Confirm Modal ── */}
            <Modal transparent visible={showLogoutModal} animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowLogoutModal(false)}>
                    <View style={[styles.modalSheet, { paddingBottom: 32 }]}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Log Out?</Text>
                        <Text style={styles.modalSubtitle}>Are you sure you want to log out of your account?</Text>
                        <TouchableOpacity
                            style={[styles.modalCta, { shadowColor: '#E53935' }]}
                            onPress={async () => { setShowLogoutModal(false); await logout(); }}
                        >
                            <View style={{ backgroundColor: '#E53935', borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18 }}>
                                <Ionicons name="log-out-outline" size={18} color="#fff" />
                                <Text style={styles.modalCtaText}>Log Out</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowLogoutModal(false)}>
                            <Text style={styles.modalDismissText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            <Modal
                transparent
                visible={showModal}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowModal(false)}
                >
                    <View style={styles.modalSheet}>
                        <View style={styles.modalHandle} />

                        {/* Icon badge */}
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="shield-checkmark" size={48} color={PRIMARY_GREEN} />
                        </View>

                        <Text style={styles.modalTitle}>One Step First 👋</Text>
                        <Text style={styles.modalSubtitle}>
                            To create a Chama, we need to verify your identity. It only takes a minute!
                        </Text>

                        {/* Steps */}
                        <View style={styles.stepsList}>
                            {[
                                { icon: 'person-outline' as const, label: 'Set up your name & photo' },
                                { icon: 'id-card-outline' as const, label: 'Upload your ID for verification' },
                                { icon: 'people-circle-outline' as const, label: 'Create & manage your Chama' },
                            ].map((s, i) => (
                                <View key={i} style={styles.stepItem}>
                                    <View style={styles.stepIconWrap}>
                                        <Ionicons name={s.icon} size={18} color={PRIMARY_GREEN} />
                                    </View>
                                    <Text style={styles.stepLabel}>{s.label}</Text>
                                    {i < 2 && <Ionicons name="chevron-forward" size={16} color="#CCC" style={{ marginLeft: 'auto' }} />}
                                    {i === 2 && <Ionicons name="checkmark-circle" size={18} color={PRIMARY_GREEN} style={{ marginLeft: 'auto' }} />}
                                </View>
                            ))}
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={styles.modalCta}
                            activeOpacity={0.88}
                            onPress={() => {
                                setShowModal(false);
                                navigation.navigate('IdentitySetupScreen', { intent: 'create' });
                            }}
                        >
                            <LinearGradient
                                colors={['#4CAF50', PRIMARY_GREEN, '#1B3D28']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.modalCtaGradient}
                            >
                                <Text style={styles.modalCtaText}>Get Started</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalDismiss} onPress={() => setShowModal(false)}>
                            <Text style={styles.modalDismissText}>Maybe later</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_COLOR,
    },
    content: {
        flex: 1,
        paddingHorizontal: 36,
        paddingTop: 40,
        paddingBottom: 60,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    header: {
        flex: 1,
        justifyContent: 'center',
    },
    logoCircle: {
        width: 64, height: 64, borderRadius: 32,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
        ...shadows.card
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1A1A1A',
        lineHeight: 46,
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        lineHeight: 24,
    },
    actionContainer: {
        width: '100%',
        marginTop: 'auto',
        gap: 16,
    },
    primaryBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    primaryBtn: {
        height: 68,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    primaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.white,
    },
    secondaryBtn: {
        width: '100%',
        height: 68,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        borderWidth: 2,
        borderColor: PRIMARY_GREEN,
        backgroundColor: colors.white,
    },
    secondaryBtnText: {
        fontSize: 17,
        fontWeight: '700',
        color: PRIMARY_GREEN,
    },
    termsLink: {
        marginTop: 16,
        alignItems: 'center',
        paddingVertical: 8,
    },
    termsLinkText: {
        fontSize: 12,
        color: '#AAAAAA',
        textDecorationLine: 'underline',
    },

    /* ── Profile Required Modal ── */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingBottom: 44,
        paddingTop: 12,
    },
    modalHandle: {
        width: 40, height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalIconWrap: {
        alignSelf: 'center',
        width: 84, height: 84,
        borderRadius: 42,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
    },
    stepsList: {
        gap: 10,
        marginBottom: 28,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F8FBF8',
        borderRadius: 14,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E6F0E7',
    },
    stepIconWrap: {
        width: 36, height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },
    modalCta: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 7,
        marginBottom: 12,
    },
    modalCtaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 18,
        borderRadius: 999,
    },
    modalCtaText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
    modalDismiss: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalDismissText: {
        fontSize: 14,
        color: '#AAAAAA',
    },
});

