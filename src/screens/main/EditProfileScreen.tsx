import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar,
    TextInput, ScrollView, Image, KeyboardAvoidingView,
    Platform, ActivityIndicator, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, shadows } from '../../theme';
import { useApp } from '../../context/AppContext';
import api, { getBaseUrl } from '../../services/api';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function EditProfileScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { user, login } = useApp();
    const [name, setName] = useState((user as any)?.profile?.name || '');
    const [phone, setPhone] = useState((user as any)?.phone || '');
    const [idNumber, setIdNumber] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState((user as any)?.profile?.avatar || '');
    const [idPhotoUrl, setIdPhotoUrl] = useState((user as any)?.profile?.idPhoto || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingId, setUploadingId] = useState(false);

    const pickImage = async (type: 'avatar' | 'id') => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: type === 'avatar',
            aspect: type === 'avatar' ? [1, 1] : undefined,
            quality: 0.5,
        });
        if (!result.canceled) uploadImage(result.assets[0].uri, type);
    };

    const uploadImage = async (uri: string, type: 'avatar' | 'id') => {
        if (type === 'avatar') setUploadingAvatar(true);
        else setUploadingId(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                type: 'image/jpeg',
                name: `${type}-${Date.now()}.jpg`
            } as any);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = getBaseUrl().replace('/api', '') + res.data.url;
            if (type === 'avatar') setAvatarUrl(fullUrl);
            else setIdPhotoUrl(fullUrl);
        } catch (error: any) {
            console.error(`Failed to upload ${type} image`, error.response?.data || error.message);
            alert(`${type === 'avatar' ? 'Profile' : 'ID'} image upload failed`);
        } finally {
            if (type === 'avatar') setUploadingAvatar(false);
            else setUploadingId(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.put('/auth/profile', { name, avatar: avatarUrl, idPhoto: idPhotoUrl, email, phone, idNumber });
            alert('Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to save changes');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} />

            {/* ── Watermark background — very faint, centered ── */}
            <ImageBackground
                source={require('../../../assets/watermark.jpeg')}
                style={StyleSheet.absoluteFillObject}
                resizeMode="cover"
                imageStyle={{ opacity: 0.13 }}   // slightly brighter watermark
            />

            {/* ── Content ── */}
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Top header ── */}
                <View style={styles.topHeader}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.logoRow}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="people" size={18} color="#fff" />
                        </View>
                        <Text style={styles.logoText}>CHAMA</Text>
                    </View>
                    <View style={{ width: 38 }} />
                </View>

                {/* ── Title ── */}
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>Tell us more about you to join a Chama.</Text>

                {/* ── Avatar ── */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        style={styles.avatarWrap}
                        onPress={() => pickImage('avatar')}
                        disabled={uploadingAvatar}
                        activeOpacity={0.9}
                    >
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Ionicons name="person" size={72} color="#A5D6A7" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.uploadBtn}
                        onPress={() => pickImage('avatar')}
                        disabled={uploadingAvatar}
                        activeOpacity={0.85}
                    >
                        {uploadingAvatar ? (
                            <ActivityIndicator size="small" color={BG_WHITE} />
                        ) : (
                            <>
                                <Ionicons name="camera-outline" size={13} color={BG_WHITE} style={{ marginRight: 5 }} />
                                <Text style={styles.uploadBtnText}>Upload Photo</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* ── Form ── */}
                <View style={styles.form}>

                    {/* Full Name */}
                    <View style={styles.inputRow}>
                        <Ionicons name="person-outline" size={18} color="#9E9E9E" />
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Full Name"
                            placeholderTextColor="#BDBDBD"
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.inputRow}>
                        <Text style={styles.flagEmoji}>🇰🇪</Text>
                        <Text style={styles.countryCode}>+254</Text>
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="712 345678"
                            placeholderTextColor="#BDBDBD"
                            keyboardType="phone-pad"
                        />
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={13} color={BG_WHITE} />
                        </View>
                    </View>

                    {/* National ID Number */}
                    <View style={styles.inputRow}>
                        <Ionicons name="card-outline" size={18} color="#9E9E9E" />
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.input}
                            value={idNumber}
                            onChangeText={setIdNumber}
                            placeholder="National ID Number"
                            placeholderTextColor="#BDBDBD"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* ID Document Photo upload */}
                    <TouchableOpacity
                        style={styles.idUploadBox}
                        onPress={() => pickImage('id')}
                        disabled={uploadingId}
                        activeOpacity={0.8}
                    >
                        {idPhotoUrl ? (
                            <Image source={{ uri: idPhotoUrl }} style={styles.idUploadImg} />
                        ) : uploadingId ? (
                            <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                        ) : (
                            <>
                                <Ionicons name="image-outline" size={28} color="#BDBDBD" />
                                <Text style={styles.idUploadText}>Upload ID Document</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {/* Email */}
                    <View style={styles.inputRow}>
                        <Ionicons name="mail-outline" size={18} color="#9E9E9E" />
                        <View style={styles.inputDivider} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email Address (optional)"
                            placeholderTextColor="#BDBDBD"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* ── Continue button ── */}
                <View style={[styles.continueBtnShadow]}>
                    <TouchableOpacity
                        style={styles.continueBtnWrap}
                        onPress={handleSave}
                        activeOpacity={0.88}
                    >
                        <LinearGradient
                            colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.continueBtn}
                        >
                            <Text style={styles.continueBtnText}>Continue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* ── Agreement text ── */}
                <Text style={styles.agreementText}>
                    By continuing, you confirm that the information provided is accurate and you agree to our{' '}
                    <Text style={styles.agreementLink}>Terms of Service</Text>
                    {' '}and{' '}
                    <Text style={styles.agreementLink}>Privacy Policy</Text>
                    . Your data is protected and will only be used to verify your identity.
                </Text>

                <View style={{ height: 48 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_WHITE,
    },

    /* ── Scroll ── */
    scroll: {
        paddingHorizontal: 44,
        paddingTop: 0,
        flexGrow: 1,
    },

    /* ── Header ── */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 20,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F2F2F2',
        alignItems: 'center', justifyContent: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    logoCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
    },
    logoText: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 3,
        color: '#1A1A1A',
    },

    /* ── Title ── */
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    subtitle: {
        fontSize: 13,
        color: '#888888',
        textAlign: 'center',
        marginBottom: 24,
    },

    /* ── Avatar ── */
    avatarSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatarWrap: {
        width: 116, height: 116,
        borderRadius: 58,
        overflow: 'hidden',
        backgroundColor: '#E8F5E9',
        borderWidth: 3,
        borderColor: BG_WHITE,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarPlaceholder: {
        width: '100%', height: '100%',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#E8F5E9',
    },
    uploadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: PRIMARY_GREEN,
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 999,
        shadowColor: PRIMARY_GREEN,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    uploadBtnText: {
        fontSize: 13,
        fontWeight: '700',
        color: BG_WHITE,
    },

    /* ── Form ── */
    form: {
        gap: 10,
        marginBottom: 22,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 18,
        height: 58,
    },
    inputDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 10,
    },
    flagEmoji: { fontSize: 20 },
    countryCode: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginLeft: 4,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    verifiedBadge: {
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: PRIMARY_GREEN,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 6,
    },

    /* ── ID upload box ── */
    idUploadBox: {
        height: 110,
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    idUploadText: {
        fontSize: 13,
        color: '#BDBDBD',
        fontWeight: '500',
    },
    idUploadImg: {
        width: '100%', height: '100%',
        borderRadius: 14,
        resizeMode: 'cover',
    },

    /* ── Continue button ── */
    continueBtnShadow: {
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
    continueBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    continueBtn: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
    },
    continueBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: BG_WHITE,
        letterSpacing: 0.2,
    },

    /* ── Agreement text ── */
    agreementText: {
        fontSize: 11.5,
        color: '#AAAAAA',
        textAlign: 'center',
        lineHeight: 17,
        paddingHorizontal: 4,
    },
    agreementLink: {
        color: PRIMARY_GREEN,
        fontWeight: '600',
    },
});