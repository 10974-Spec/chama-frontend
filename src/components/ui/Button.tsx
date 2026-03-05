import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, radii, shadows } from '../../theme';

interface ButtonProps {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
    label, onPress, variant = 'primary', size = 'md', loading, disabled, style
}) => {
    const btnStyle = [
        styles.base,
        styles[`size_${size}`],
        styles[`variant_${variant}`],
        (disabled || loading) && styles.disabled,
        style,
    ];
    const textStyle = [
        typography.button,
        styles[`text_${variant}`],
    ];

    return (
        <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled || loading} activeOpacity={0.8}>
            {variant === 'primary' ? (
                <LinearGradient
                    colors={['#3A7D54', colors.primary, '#1B3D28']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            ) : null}
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? colors.white : colors.primary} />
            ) : (
                <Text style={textStyle}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radii.xl,
        flexDirection: 'row',
        overflow: 'hidden',
    },
    size_sm: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: radii.md },
    size_md: { paddingVertical: 14, paddingHorizontal: 24 },
    size_lg: { paddingVertical: 17, paddingHorizontal: 32 },
    variant_primary: { backgroundColor: 'transparent', ...shadows.button },
    variant_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    variant_ghost: { backgroundColor: 'transparent' },
    variant_danger: { backgroundColor: colors.accent.red },
    text_primary: { color: colors.white },
    text_outline: { color: colors.primary },
    text_ghost: { color: colors.primary },
    text_danger: { color: colors.white },
    disabled: { opacity: 0.5 },
});
