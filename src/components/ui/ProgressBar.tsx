import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';

interface ProgressBarProps {
    progress: number; // 0–1
    height?: number;
    color?: string;
    backgroundColor?: string;
    animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress, height = 6, color = colors.primary, backgroundColor = '#E8F5E9', animated = true
}) => {
    const animatedWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.timing(animatedWidth, {
                toValue: progress,
                duration: 800,
                useNativeDriver: false,
            }).start();
        } else {
            animatedWidth.setValue(progress);
        }
    }, [progress]);

    const widthInterpolated = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
        extrapolate: 'clamp',
    });

    return (
        <View style={[styles.track, { height, backgroundColor }]}>
            <Animated.View style={[styles.fill, { width: widthInterpolated, backgroundColor: color }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    track: { borderRadius: 99, overflow: 'hidden', width: '100%' },
    fill: { height: '100%', borderRadius: 99 },
});
