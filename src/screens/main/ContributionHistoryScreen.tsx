import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import api from '../../services/api';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import { useAppContext } from '../../context/AppContext';

export default function ContributionHistoryScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { user } = useAppContext();
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/transactions/my');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to fetch contribution history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const renderItem = ({ item }: any) => {
        const _chamaName = item.chamaId?.name || 'Sacco';
        // Note: the backend uses 'completed' for successful payments but let's allow 'success' too.
        const isSuccess = item.status === 'success' || item.status === 'completed';

        return (
            <View style={[styles.historyCard, { flexDirection: 'column' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                    <View style={styles.iconBox}>
                        <Ionicons
                            name={isSuccess ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={isSuccess ? colors.status.success : colors.status.error}
                        />
                    </View>
                    <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle}>
                            {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Contribution'} - {_chamaName}
                        </Text>
                        <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.historyAmount}>- Ksh {item.amount}</Text>
                        <Text style={[styles.historyStatus, { color: isSuccess ? colors.status.success : colors.status.error }]}>
                            {isSuccess ? 'Completed' : 'Failed'}
                        </Text>
                    </View>
                </View>

                {isSuccess && (
                    <TouchableOpacity
                        style={styles.downloadBtn}
                        activeOpacity={0.7}
                        onPress={() => generateInvoicePDF(item, user)}
                    >
                        <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                        <Text style={styles.downloadText}>Download Invoice</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.dark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Contribution History</Text>
                <View style={{ width: 44 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item._id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>No transactions found.</Text>
                    }
                />
            )}
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBg },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { ...typography.h5, color: colors.text.dark },
    listContent: { padding: 16, paddingBottom: 40 },
    historyCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
        padding: 16, borderRadius: 16, marginBottom: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    historyInfo: { flex: 1 },
    historyTitle: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 2 },
    historyDate: { ...typography.caption, color: colors.text.muted },
    historyAmount: { ...typography.bodyMedium, color: colors.text.dark, marginBottom: 2 },
    historyStatus: { ...typography.caption, fontWeight: '600' },
    downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginLeft: 52, marginTop: 12, paddingVertical: 6, paddingHorizontal: 16, backgroundColor: colors.primaryBg, borderRadius: 12 },
    downloadText: { ...typography.smallMedium, color: colors.primary, marginLeft: 6 }
});
