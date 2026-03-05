import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function ChamaDetailsScreen({ route }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    // We expect the Chama object to be passed in the route params
    const { chama } = route.params || {};

    if (!chama) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={typography.bodyMedium}>Chama details not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Header */}
                <View style={styles.heroSection}>
                    <Image source={{ uri: chama.coverImage || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1600' }} style={styles.heroImage} />
                    <View style={styles.heroOverlay} />

                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>

                    <View style={styles.heroContent}>
                        <View style={styles.badgeWrap}>
                            <Text style={styles.badgeText}>{chama.category || 'Investment'}</Text>
                        </View>
                        <Text style={styles.title}>{chama.name}</Text>
                        <Text style={styles.memberCount}>{chama.memberCount || 0} Members</Text>
                    </View>
                </View>

                {/* Info Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Ionicons name="cash-outline" size={24} color={colors.primary} />
                        <Text style={styles.statLabel}>Contribution</Text>
                        <Text style={styles.statValue}>Ksh {chama.contributionAmount || 500}</Text>
                        <Text style={styles.statSub}>{chama.frequency || 'Weekly'}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="people-outline" size={24} color={colors.primary} />
                        <Text style={styles.statLabel}>Capacity</Text>
                        <Text style={styles.statValue}>{chama.memberCount || 0}/{chama.maxMembers || 50}</Text>
                        <Text style={styles.statSub}>Members</Text>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <Text style={styles.sectionTitle}>About this Chama</Text>
                    <Text style={styles.description}>
                        {chama.description || 'A community dedicated to saving and investing together. Join us to start building your wealth in a secure and transparent environment.'}
                    </Text>

                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.text.muted} />
                        <Text style={styles.metaText}>Started: {chama.dateStarted || 'Recently'}</Text>
                    </View>
                    <View style={styles.metaRow}>
                        <Ionicons name="person-outline" size={20} color={colors.text.muted} />
                        <Text style={styles.metaText}>Admin: {chama.adminName || 'Community Led'}</Text>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Rules & Objectives</Text>
                    <View style={styles.ruleItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={styles.ruleText}>Contributions must be made by Friday 5PM.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={styles.ruleText}>Defaulting incurs a 10% penalty fee.</Text>
                    </View>
                    <View style={styles.ruleItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                        <Text style={styles.ruleText}>Loans are approved by majority vote.</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Sticky Join Button */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.joinBtn}
                    onPress={() => navigation.navigate('ChamaDashboard', { chama })}
                >
                    <Text style={styles.joinBtnText}>Join Chama</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    heroSection: { height: 320, position: 'relative' },
    heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
    backBtn: { position: 'absolute', top: 50, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' },
    heroContent: { position: 'absolute', bottom: 30, left: 20, right: 20 },
    badgeWrap: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
    badgeText: { ...typography.smallMedium, color: colors.white },
    title: { ...typography.h3, color: colors.white, marginBottom: 8 },
    memberCount: { ...typography.body, color: 'rgba(255,255,255,0.8)' },

    statsRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginTop: -30 },
    statCard: { flex: 1, backgroundColor: colors.white, padding: 16, borderRadius: 16, alignItems: 'center', ...shadows.card },
    statLabel: { ...typography.small, color: colors.text.muted, marginTop: 12, marginBottom: 4 },
    statValue: { ...typography.h5, color: colors.text.dark },
    statSub: { ...typography.caption, color: colors.text.light, marginTop: 2 },

    aboutSection: { padding: 20, marginTop: 10 },
    sectionTitle: { ...typography.h6, color: colors.text.dark, marginBottom: 12 },
    description: { ...typography.body, color: colors.text.medium, lineHeight: 24, marginBottom: 16 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    metaText: { ...typography.bodyMedium, color: colors.text.dark },
    ruleItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
    ruleText: { flex: 1, ...typography.body, color: colors.text.medium, lineHeight: 22 },

    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 34, borderTopWidth: 1, borderTopColor: colors.border, ...shadows.card },
    joinBtn: { backgroundColor: colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, ...shadows.button },
    joinBtnText: { ...typography.button, color: colors.white },
});
