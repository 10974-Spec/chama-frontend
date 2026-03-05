import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, shadows, radii } from '../../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
    return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radii.lg,
        padding: 16,
        marginBottom: 12,
        ...shadows.card,
    },
});
