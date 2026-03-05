import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

type PayStatus = 'paid' | 'pending' | 'late';

interface StatusDotProps {
    status: PayStatus;
    showLabel?: boolean;
}

const statusMap: Record<PayStatus, { color: string; label: string }> = {
    paid: { color: '#2F9E44', label: 'Paid' },
    pending: { color: '#F59F00', label: 'Pending' },
    late: { color: '#FA5252', label: 'Late' },
};

export const StatusDot: React.FC<StatusDotProps> = ({ status, showLabel }) => {
    const { color, label } = statusMap[status];
    return (
        <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            {showLabel && <Text style={[typography.smallMedium, { color, marginLeft: 4 }]}>{label}</Text>}
        </View>
    );
};

interface BadgeProps {
    label: string;
    color?: string;
    textColor?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = colors.primaryLight, textColor = colors.primary }) => (
    <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={[typography.smallMedium, { color: textColor }]}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 9, height: 9, borderRadius: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
});
