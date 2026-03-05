import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows } from '../../theme';

export default function PaymentMethodsScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Methods</Text>
                <View style={{ width: 44 }} />
            </View>
            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Saved Methods</Text>

                <TouchableOpacity style={styles.methodCard}>
                    <View style={styles.methodIconBox}>
                        <Ionicons name="cash-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.methodTitle}>M-Pesa</Text>
                        <Text style={styles.methodDesc}>07** *** *89</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add-outline" size={24} color={colors.primary} />
                    <Text style={styles.addButtonText}>Add New Payment Method</Text>
                </TouchableOpacity>
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
    sectionTitle: { ...typography.bodyMedium, color: colors.text.muted, marginBottom: 12, textTransform: 'uppercase', fontSize: 13, letterSpacing: 0.5 },
    methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryBg, padding: 16, borderRadius: 16, marginBottom: 16, ...shadows.card },
    methodIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    methodTitle: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 4 },
    methodDesc: { ...typography.caption, color: colors.text.medium },
    addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.primary, borderStyle: 'dashed', backgroundColor: colors.primaryBg + '40' },
    addButtonText: { ...typography.button, color: colors.primary },
});
