import React, { useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, Animated, StatusBar,
    TouchableOpacity, ImageBackground, Dimensions, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SplashScreen({ navigation }: any) {


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleGetStarted = () => navigation.replace('LoginSignup');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} translucent={false} />

            <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                {/* ── Top section: logo + text ── */}
                <View style={styles.topSection}>
                    {/* Logo Image */}
                    <Image source={require('../../../assets/chama-logo.png')} style={styles.headerLogoImage} resizeMode="contain" />

                    {/* Hero text */}
                    <Text style={styles.heroTitle}>Welcome to Chama</Text>
                    <Text style={styles.heroSubtitle}>
                        Join a modern way to save and{'\n'}grow together!
                    </Text>
                </View>

                {/* ── Full-width community image ── */}
                <View style={styles.imageWrapper}>
                    <ImageBackground
                        source={require('../../../assets/image1.jpeg')}
                        style={styles.communityImage}
                        resizeMode="cover"
                    >
                        {/* Fade top of image into white */}
                        <LinearGradient
                            colors={[BG_WHITE, 'rgba(255,255,255,0.6)', 'transparent']}
                            style={styles.imageFadeTop}
                        />
                        {/* Fade left edge */}
                        <LinearGradient
                            colors={[BG_WHITE, 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 0.18, y: 0.5 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        {/* Fade right edge */}
                        <LinearGradient
                            colors={['transparent', BG_WHITE]}
                            start={{ x: 0.82, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={StyleSheet.absoluteFillObject}
                        />
                        {/* Fade bottom of image into white */}
                        <LinearGradient
                            colors={['transparent', 'rgba(255,255,255,0.6)', BG_WHITE, BG_WHITE]}
                            locations={[0, 0.5, 0.9, 1]}
                            style={styles.imageFadeBottom}
                        />
                    </ImageBackground>
                </View>

                {/* ── Bottom section: hashtag + button ── */}
                <View style={styles.bottomSection}>
                    <Text style={styles.hashtag}>
                        <Text style={styles.hashtagNormal}>#JipangeNa</Text>
                        <Text style={styles.hashtagBold}>Chama</Text>
                    </Text>

                    <View style={styles.getStartedBtnShadow}>
                        <TouchableOpacity
                            style={styles.getStartedBtnWrap}
                            onPress={handleGetStarted}
                            activeOpacity={0.88}
                        >
                            <LinearGradient
                                colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.getStartedBtn}
                            >
                                <Text style={styles.getStartedText}>Get Started</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={handleGetStarted}>
                        <Text style={styles.loginHint}>
                            Already have an account?{' '}
                            <Text style={styles.loginLink}>Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_WHITE,
    },
    inner: {
        flex: 1,
    },

    /* ── Top section ── */
    topSection: {
        alignItems: 'center',
        paddingTop: 52,
        paddingHorizontal: 24,
        paddingBottom: 16,
        backgroundColor: BG_WHITE,
        zIndex: 2,
    },
    headerLogoImage: { width: 280, height: 90, marginBottom: 20, transform: [{ scale: 1.8 }] },
    heroTitle: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        fontSize: 15,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },

    /* ── Community image ── */
    imageWrapper: {
        flex: 1,                  // fills available space between top and bottom
        width: '100%',
        overflow: 'hidden',
    },
    communityImage: {
        flex: 1,
        width: '100%',
    },
    imageFadeTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '35%',
    },
    imageFadeBottom: {
        position: 'absolute',
        bottom: -2,
        left: 0,
        right: 0,
        height: '60%',
    },

    /* ── Bottom section ── */
    bottomSection: {
        backgroundColor: BG_WHITE,
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 8,
        zIndex: 2,
    },
    hashtag: {
        fontSize: 18,
        marginBottom: 28,
        textAlign: 'center',
    },
    hashtagNormal: {
        color: '#333333',
        fontWeight: '500',
    },
    hashtagBold: {
        color: PRIMARY_GREEN,
        fontWeight: '800',
    },
    getStartedBtnShadow: {
        width: '100%',
        borderRadius: 999,
        marginBottom: 16,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: PRIMARY_GREEN,
    },
    getStartedBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    getStartedBtn: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    getStartedText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    loginHint: {
        fontSize: 14,
        color: '#888888',
    },
    loginLink: {
        color: PRIMARY_GREEN,
        fontWeight: '700',
    },
});