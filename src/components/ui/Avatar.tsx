import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, typography } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

interface AvatarProps {
    uri?: string;
    name?: string;
    size?: number;
    online?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name = '', size = 40, online }) => {
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return (
        <View style={{ width: size, height: size }}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={{ width: size, height: size, borderRadius: size / 2 }}
                />
            ) : (
                <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
                    <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
                </View>
            )}
            {online && (
                <View style={[styles.onlineDot, { width: size * 0.27, height: size * 0.27, borderRadius: size * 0.135, bottom: 0, right: 0 }]} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    fallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
    initials: { color: colors.white, fontWeight: '700' },
    onlineDot: { position: 'absolute', backgroundColor: '#51CF66', borderWidth: 1.5, borderColor: colors.white },
});
