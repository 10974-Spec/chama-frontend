import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

const PRIMARY_GREEN = '#2A5C3F';
const BG_COLOR = '#F5F5F0';
const { width } = Dimensions.get('window');

const slides = [
    {
        icon: 'analytics-outline',
        title: 'Track Contributions',
        desc: 'See exactly who has paid, automate reminders, and keep everything fully transparent.'
    },
    {
        icon: 'chatbubbles-outline',
        title: 'Seamless Communication',
        desc: 'Discuss plans, vote on decisions, and keep the whole group aligned without leaving the app.'
    },
    {
        icon: 'calendar-outline',
        title: 'Organize Meetings',
        desc: 'Schedule Chama meetings, track RSVPs, and securely store minutes and agendas.'
    }
];

export default function FeatureWalkthroughScreen({ navigation, route }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const [currentIndex, setCurrentIndex] = useState(0);
    const intent = route.params?.intent || 'member'; // e.g. 'admin' if they created, 'member' if joined

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // After walkthrough, go to First Action
            navigation.navigate('FirstActionPromptScreen', { intent });
        }
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />

            <View style={styles.topHeader}>
                <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.navigate('FirstActionPromptScreen', { intent })}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.iconCircle}>
                    <Ionicons name={slides[currentIndex].icon as any} size={64} color={PRIMARY_GREEN} />
                </View>

                <Text style={styles.title}>{slides[currentIndex].title}</Text>
                <Text style={styles.desc}>{slides[currentIndex].desc}</Text>

                <View style={styles.pagination}>
                    {slides.map((_, i) => (
                        <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
                    ))}
                </View>
            </View>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.primaryBtnWrap} onPress={handleNext}>
                    <LinearGradient colors={['#3A7D54', PRIMARY_GREEN, '#1B3D28']} style={styles.primaryBtn}>
                        <Text style={styles.primaryBtnText}>
                            {currentIndex === slides.length - 1 ? "Let's Go" : "Next"}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    topHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 60, paddingHorizontal: 24 },
    skipBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)' },
    skipText: { fontSize: 15, fontWeight: '600', color: '#666' },

    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
    title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 16 },
    desc: { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24, marginBottom: 40 },

    pagination: { flexDirection: 'row', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CCC' },
    dotActive: { width: 24, backgroundColor: PRIMARY_GREEN },

    bottomNav: { padding: 24, paddingBottom: 40 },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    primaryBtn: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    primaryBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700' }
});
