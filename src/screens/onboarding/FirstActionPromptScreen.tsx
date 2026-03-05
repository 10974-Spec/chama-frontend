import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';
import api from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_COLOR = '#F5F5F0';

export default function FirstActionPromptScreen({ navigation, route }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { login, user } = useAppContext();
    const intent = route.params?.intent || 'member';
    const [loading, setLoading] = useState(false);

    const goToDashboard = async () => {
        setLoading(true);
        try {
            // Mark onboarding completed on the backend
            await api.put('/auth/profile', { onboardingCompleted: true });

            // Refresh the user from backend to get updated onboardingCompleted flag
            const res = await api.get('/auth/profile');
            const updatedUser = res.data;

            // Update context — this causes AppNavigator to automatically switch to MainApp
            const token = (await import('@react-native-async-storage/async-storage')).default;
            const storedToken = await token.getItem('userToken');
            if (storedToken) {
                await login(storedToken, {
                    _id: updatedUser._id,
                    phoneNumber: updatedUser.phoneNumber,
                    name: updatedUser.profile?.name,
                    avatar: updatedUser.profile?.avatar,
                    trustScore: updatedUser.trustScore,
                    onboardingCompleted: true,
                });
            }
        } catch (e) {
            console.error('Failed to complete onboarding:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name={intent === 'admin' ? "calendar-outline" : "hand-left-outline"} size={64} color={PRIMARY_GREEN} />
                </View>

                <Text style={styles.title}>
                    {intent === 'admin' ? "Set Your First Meeting" : "Introduce Yourself!"}
                </Text>

                <Text style={styles.desc}>
                    {intent === 'admin'
                        ? "Great leaders keep the momentum going. Schedule your first chama meeting right now to align with your members."
                        : "Your pending request has been sent! In the meantime, head to the dashboard to set up your payment methods."}
                </Text>
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.primaryBtnWrap} onPress={goToDashboard} disabled={loading}>
                    <LinearGradient colors={['#3A7D54', PRIMARY_GREEN, '#1B3D28']} style={styles.primaryBtn}>
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <>
                                <Text style={styles.primaryBtnText}>
                                    {intent === 'admin' ? "Schedule Meeting" : "Go to Dashboard"}
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                            </>
                        }
                    </LinearGradient>
                </TouchableOpacity>

                {intent === 'admin' && (
                    <TouchableOpacity style={styles.skipBtn} onPress={goToDashboard} disabled={loading}>
                        <Text style={styles.skipText}>Not right now, go to Dashboard</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
    title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 16 },
    desc: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40 },

    bottomNav: { padding: 24, paddingBottom: 40 },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden', marginBottom: 16 },
    primaryBtn: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' },

    skipBtn: { alignItems: 'center', paddingVertical: 12 },
    skipText: { fontSize: 15, fontWeight: '600', color: '#666' }
});
