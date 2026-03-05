import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme';

export default function HelpSupportScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const supportOptions = [
        { icon: 'chatbubbles-outline', title: 'Live Chat', desc: 'Chat with our support team' },
        { icon: 'mail-outline', title: 'Email Us', desc: 'support@chama-app.com' },
        { icon: 'call-outline', title: 'Call Us', desc: '+254 700 000 000' },
        { icon: 'document-text-outline', title: 'FAQs', desc: 'Read common questions and answers' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>How can we help you?</Text>

                {supportOptions.map((opt, index) => (
                    <TouchableOpacity key={index} style={styles.supportCard}>
                        <View style={styles.iconBox}>
                            <Ionicons name={opt.icon as any} size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{opt.title}</Text>
                            <Text style={styles.cardDesc}>{opt.desc}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h5, color: colors.text.dark },
    content: { flex: 1, padding: 20 },
    sectionTitle: { ...typography.bodyMedium, color: colors.text.muted, marginBottom: 16, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 },
    supportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryBg, padding: 16, borderRadius: 16, marginBottom: 16, ...shadows.card },
    iconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    cardTitle: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 4 },
    cardDesc: { ...typography.caption, color: colors.text.medium },
});
