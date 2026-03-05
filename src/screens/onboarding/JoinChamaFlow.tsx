import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, shadows } from '../../theme';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';

export default function JoinChamaFlow({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { user } = useAppContext();
    const [step, setStep] = useState(1);
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [chamaDetails, setChamaDetails] = useState<any>(null);
    const [publicChamas, setPublicChamas] = useState<any[]>([]);
    const [loadingChamas, setLoadingChamas] = useState(true);

    React.useEffect(() => {
        fetchPublicChamas();
    }, []);

    const fetchPublicChamas = async () => {
        try {
            const res = await api.get('/chamas');
            setPublicChamas(res.data);
        } catch (error) {
            console.error('Failed to fetch chamas', error);
        } finally {
            setLoadingChamas(false);
        }
    };

    // This would ideally hit an endpoint that returns chama details by invite code without joining.
    // However, the api currently accepts an invite code directly in the POST /chamas/:id/join route.
    // For a real preview, we would need a GET /api/chamas/invite/:code endpoint.
    // For now, since the user joins on the second step, we can just attempt to join immediately on step 1
    // OR just show a dummy preview and let the backend handle the 404. Let's do the actual join on step 1, 
    // and if successful, show the pending status on step 2.

    const handleJoin = async (idOrCode?: string) => {
        const target = idOrCode || inviteCode;
        if (!target.trim()) {
            console.warn('Missing Code');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/chamas/${target}/join`);
            // Assuming successful join or pending request
            setChamaDetails(res.data.chama); // Store the Chama details returned from backend
            setStep(2); // Move to Pending screen
        } catch (error: any) {
            console.error('Join Error', error.response?.data);
            // Error is shown naturally; no alert needed here
        } finally {
            setLoading(false);
        }
    };

    const handleFinish = () => {
        navigation.navigate('FeatureWalkthroughScreen', { intent: 'member' });
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />

            <View style={styles.topHeader}>
                {step === 1 && (
                    <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {step === 1 && (
                    <View style={styles.stepContainer}>
                        <View style={styles.iconWrap}>
                            <Ionicons name="enter-outline" size={40} color={PRIMARY_GREEN} />
                        </View>
                        <Text style={styles.title}>Join a Chama</Text>
                        <Text style={styles.subtitle}>Enter the 6-character invite code provided by the Chama administrator.</Text>

                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.codeInput}
                                placeholder="ENTER CODE"
                                placeholderTextColor="#BDBDBD"
                                autoCapitalize="characters"
                                maxLength={6}
                                value={inviteCode}
                                onChangeText={setInviteCode}
                            />
                        </View>
                    </View>
                )}

                {step === 2 && (
                    <View style={styles.stepContainer}>
                        {chamaDetails ? (
                            <View style={styles.chamaProfileCard}>
                                <View style={styles.chamaProfileHeader}>
                                    {chamaDetails.logo ? (
                                        <Image source={{ uri: chamaDetails.logo }} style={styles.chamaProfileLogo} />
                                    ) : (
                                        <View style={styles.chamaProfileLogoPlaceholder}>
                                            <Ionicons name="people" size={40} color={PRIMARY_GREEN} />
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.chamaProfileName}>{chamaDetails.name}</Text>
                                        <Text style={styles.chamaProfileType}>{chamaDetails.chamaType}</Text>
                                    </View>
                                </View>
                                <Text style={styles.chamaProfileDesc}>{chamaDetails.description}</Text>
                            </View>
                        ) : null}

                        <View style={styles.successIcon}>
                            <Ionicons name="time" size={60} color="#F5A623" />
                        </View>
                        <Text style={[styles.title, { textAlign: 'center' }]}>Waiting for Approval</Text>
                        <Text style={[styles.subtitle, { textAlign: 'center', marginBottom: 24 }]}>
                            Your join request to {chamaDetails?.name || 'this Chama'} is currently pending. You will be notified once the Chama administrator approves your membership.
                        </Text>
                    </View>
                )}

            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity
                    style={styles.primaryBtnWrap}
                    onPress={step === 1 ? () => handleJoin() : handleFinish}
                    disabled={loading}
                >
                    <LinearGradient colors={['#4CAF50', PRIMARY_GREEN, '#1B3D28']} style={styles.primaryBtn}>
                        {loading ? <ActivityIndicator color="#fff" /> :
                            <Text style={styles.primaryBtnText}>
                                {step === 1 ? 'Find & Request to Join' : 'Continue to App without Chama'}
                            </Text>
                        }
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_WHITE },
    topHeader: { height: 100, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20, paddingBottom: 10 },
    iconBtn: { padding: 8, backgroundColor: '#F0F0F0', borderRadius: 20 },

    scroll: { flexGrow: 1, padding: 24, paddingBottom: 120, justifyContent: 'center' },
    stepContainer: { flex: 1, alignItems: 'center' },

    iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, paddingHorizontal: 20, marginBottom: 40 },

    inputContainer: { width: '100%', marginBottom: 32 },
    codeInput: { height: 80, backgroundColor: '#F9F9F9', borderWidth: 2, borderColor: '#E8E8E8', borderRadius: 16, fontSize: 32, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', letterSpacing: 8 },

    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', width: '100%', marginBottom: 16 },
    emptyText: { fontSize: 14, color: '#888', fontStyle: 'italic' },
    chamaCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, width: '100%', marginBottom: 12, borderWidth: 1, borderColor: '#E8E8E8', ...shadows.button },
    chamaLogoWrap: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 16 },
    chamaLogo: { width: '100%', height: '100%', resizeMode: 'cover' },
    chamaInfo: { flex: 1, justifyContent: 'center' },
    chamaName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    chamaDesc: { fontSize: 13, color: '#666', marginBottom: 8 },
    chamaTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#F0F0F0', borderRadius: 12, fontSize: 11, fontWeight: '600', color: PRIMARY_GREEN },

    successIcon: { alignItems: 'center', marginBottom: 24 },
    infoBox: { flexDirection: 'row', backgroundColor: '#F9F9F9', padding: 16, borderRadius: 12, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#E8E8E8' },
    infoText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#666', lineHeight: 20 },

    chamaProfileCard: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#E8E8E8', ...shadows.button },
    chamaProfileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    chamaProfileLogoPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    chamaProfileLogo: { width: 70, height: 70, borderRadius: 35, marginRight: 16 },
    chamaProfileName: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 4 },
    chamaProfileType: { fontSize: 13, fontWeight: '600', color: PRIMARY_GREEN, backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    chamaProfileDesc: { fontSize: 14, color: '#666', lineHeight: 22 },

    bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: BG_WHITE, borderTopWidth: 1, borderColor: '#E8E8E8' },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    primaryBtn: { height: 60, alignItems: 'center', justifyContent: 'center' },
    primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' }
});
