import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useCustomAlert } from '../../components/ui/CustomAlert';
import JoinApplicationSheet from '../../components/ui/JoinApplicationSheet';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function ChamaDetailsScreen({ route, navigation }: any) {
    const { chama } = route.params;
    const [loading, setLoading] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [checking, setChecking] = useState(true);
    const [showApply, setShowApply] = useState(false);
    const { showAlert, AlertComponent } = useCustomAlert();

    useFocusEffect(
        useCallback(() => {
            const checkMembership = async () => {
                try {
                    // Check active memberships
                    const myRes = await api.get('/chamas/my');
                    const found = myRes.data.find((c: any) => c._id === chama._id);
                    setIsMember(!!found);

                    if (!found) {
                        // Also check if they have a pending request
                        try {
                            const allRes = await api.get(`/chamas/${chama._id}/members`);
                            // We can't easily check pending from there, so we'll fall back to trying to join
                            // and catching the "pending" error — we handle that via a flag set on join
                        } catch {
                            // user is not a member yet
                        }
                    }
                } catch (err) {
                    console.error('Failed to check membership', err);
                } finally {
                    setChecking(false);
                }
            };
            checkMembership();
        }, [chama._id])
    );

    const handleGoToDashboard = () => {
        navigation.replace('ChamaDashboard', { chama });
    };

    const handleApplied = () => {
        setShowApply(false);
        setIsPending(true);
        showAlert('success', 'Application Submitted!', 'Sit tight — the admin will review your request and notify you.');
    };

    return (
        <>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Watermark background ── */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.13 }}
            />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* ── Hero section ── */}
                <View style={styles.heroWrapper}>
                    <ImageBackground
                        source={chama.settings?.bannerImage ? { uri: chama.settings.bannerImage } : require('../../../assets/image1.jpeg')}
                        style={styles.heroImage}
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['rgba(0,0,0,0.4)', 'transparent', BG_WHITE]}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.topNav}>
                            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                                <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
                            </TouchableOpacity>
                        </View>
                    </ImageBackground>

                    <View style={styles.logoWrap}>
                        <Image source={{ uri: chama.logo || 'https://i.pravatar.cc/150' }} style={styles.logo} />
                    </View>
                </View>

                {/* ── Details ── */}
                <View style={styles.detailsContainer}>
                    <Text style={styles.title}>{chama.name}</Text>
                    <Text style={styles.tagline}>{chama.description}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Ionicons name="cash" size={24} color={PRIMARY_GREEN} />
                            <Text style={styles.statValue}>Ksh {chama.settings?.weeklyContribution || chama.contributionAmount || 0}</Text>
                            <Text style={styles.statLabel}>{chama.settings?.payoutFrequency || 'Weekly'}</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Ionicons name="people" size={24} color={PRIMARY_GREEN} />
                            <Text style={styles.statValue}>{chama.memberCount || 0} / {chama.settings?.maxMembers || 50}</Text>
                            <Text style={styles.statLabel}>Members</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>About this Chama</Text>
                    <Text style={styles.aboutText}>
                        {chama.name} is a {chama.visibility} savings group targeting Ksh {chama.settings?.weeklyContribution || chama.contributionAmount || 0} regular contributions.
                        By joining, you agree to the savings schedule and any potential group fines for late payments.
                        Your trust score will be visible to the group admin.
                    </Text>

                    {/* Join requirements info */}
                    {!isMember && !isPending && (
                        <View style={styles.requirementsBox}>
                            <Text style={styles.requirementsTitle}>To Join You'll Need</Text>
                            <View style={styles.requirementRow}>
                                <Ionicons name="id-card-outline" size={18} color={PRIMARY_GREEN} />
                                <Text style={styles.requirementText}>National ID number</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <Ionicons name="camera-outline" size={18} color={PRIMARY_GREEN} />
                                <Text style={styles.requirementText}>Photo of your ID (front)</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <Ionicons name="chatbubble-outline" size={18} color={PRIMARY_GREEN} />
                                <Text style={styles.requirementText}>Reason for joining</Text>
                            </View>
                            <View style={styles.requirementRow}>
                                <Ionicons name="time-outline" size={18} color="#F5A623" />
                                <Text style={styles.requirementText}>Admin approval required (usually 1–2 days)</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ── Bottom action bar ── */}
            <View style={styles.bottomBar}>
                {checking ? (
                    <ActivityIndicator color={PRIMARY_GREEN} />
                ) : isMember ? (
                    /* Already a member — go to dashboard */
                    <TouchableOpacity style={styles.joinBtnWrap} onPress={handleGoToDashboard}>
                        <LinearGradient colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']} style={styles.joinBtn}>
                            <Text style={styles.joinBtnText}>Go to Dashboard</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : isPending ? (
                    /* Application submitted — show pending state */
                    <View style={styles.pendingBar}>
                        <Ionicons name="time-outline" size={22} color="#F5A623" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pendingTitle}>Application Pending</Text>
                            <Text style={styles.pendingSubtitle}>Waiting for admin approval…</Text>
                        </View>
                    </View>
                ) : (
                    /* Not a member — apply button */
                    <TouchableOpacity style={styles.joinBtnWrap} onPress={() => setShowApply(true)} activeOpacity={0.88}>
                        <LinearGradient colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']} style={styles.joinBtn}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="enter-outline" size={20} color="#fff" />
                                <Text style={styles.joinBtnText}>Apply to Join</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>

            {/* Modals */}
            <JoinApplicationSheet
                visible={showApply}
                chamaId={chama._id}
                chamaName={chama.name}
                onClose={() => setShowApply(false)}
                onSubmitted={handleApplied}
            />
            <AlertComponent />
        </>
    );
}

const styles = StyleSheet.create({
    heroWrapper: { width: '100%', height: 280, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    topNav: { position: 'absolute', top: 50, left: 20 },
    backBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: BG_WHITE,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    logoWrap: {
        position: 'absolute', bottom: -35, alignSelf: 'center',
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: BG_WHITE, padding: 4,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 5
    },
    logo: { width: '100%', height: '100%', borderRadius: 99 },
    detailsContainer: { paddingHorizontal: 24, paddingTop: 50, paddingBottom: 140 },
    title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
    tagline: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20, paddingHorizontal: 10, marginBottom: 28 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    statBox: { flex: 1, backgroundColor: '#F8FBF8', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E8F5E9' },
    statValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginTop: 8, marginBottom: 2 },
    statLabel: { fontSize: 12, color: '#888', fontWeight: '500', textTransform: 'capitalize' },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
    aboutText: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 24 },

    requirementsBox: { backgroundColor: '#F8FBF8', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8F5E9', gap: 10 },
    requirementsTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    requirementText: { fontSize: 14, color: '#555', flex: 1 },

    bottomBar: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: BG_WHITE, padding: 20, paddingBottom: 34,
        borderTopWidth: 1, borderTopColor: '#F0F0F0'
    },
    joinBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    joinBtn: { paddingVertical: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    joinBtnText: { fontSize: 16, fontWeight: '700', color: BG_WHITE },

    pendingBar: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF9E6', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE082' },
    pendingTitle: { fontSize: 15, fontWeight: '700', color: '#F57C00' },
    pendingSubtitle: { fontSize: 12, color: '#888', marginTop: 2 },
});
