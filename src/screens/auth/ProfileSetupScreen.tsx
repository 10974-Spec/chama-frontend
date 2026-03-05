import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, shadows, radii } from '../../theme';
import api, { getBaseUrl } from '../../services/api';

export default function ProfileSetupScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [idPhotoUrl, setIdPhotoUrl] = useState('');
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

    const handleFinish = async () => {
        try {
            await api.put('/auth/profile', { name, bio, avatar: avatarUrl, idPhoto: idPhotoUrl, idNumber });
            navigation.replace('MainApp');
        } catch (error) {
            console.error('Failed to update profile details', error);
            alert('Could not save your setup data.');
            navigation.replace('MainApp'); // Still proceed for now
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>You're almost there! Just a few more details.</Text>

                {/* Avatar upload */}
                <TouchableOpacity
                    style={styles.avatarWrap}
                    onPress={() => pickImage('avatar')}
                    disabled={uploadingAvatar}
                >
                    <View style={styles.avatar}>
                        {uploadingAvatar ? (
                            <ActivityIndicator size="large" color={colors.primary} />
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                        ) : (
                            <Ionicons name="person-outline" size={44} color={colors.primary} style={{ opacity: 0.5 }} />
                        )}
                    </View>
                    <View style={styles.avatarBadge}>
                        <Ionicons name="camera" size={14} color={colors.white} />
                    </View>
                    <Text style={styles.avatarHint}>Upload profile photo</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Display Name *</Text>
                <View style={styles.inputWrap}>
                    <Ionicons name="person-outline" size={18} color={colors.text.placeholder} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Your full name"
                        placeholderTextColor={colors.text.placeholder}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <Text style={styles.label}>National ID Number *</Text>
                <View style={styles.inputWrap}>
                    <Ionicons name="card-outline" size={18} color={colors.text.placeholder} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="e.g 12345678"
                        placeholderTextColor={colors.text.placeholder}
                        value={idNumber}
                        onChangeText={setIdNumber}
                        keyboardType="numeric"
                    />
                </View>

                {/* ID Document Photo */}
                <View style={styles.idUploadContainer}>
                    <Text style={styles.label}>ID Document Photo *</Text>
                    <TouchableOpacity
                        style={styles.idUploadBox}
                        onPress={() => pickImage('id')}
                        disabled={uploadingId}
                    >
                        {idPhotoUrl ? (
                            <Image source={{ uri: idPhotoUrl }} style={styles.idUploadImg} />
                        ) : (
                            <View style={styles.idUploadPlaceholder}>
                                {uploadingId ? (
                                    <ActivityIndicator size="large" color={colors.primary} />
                                ) : (
                                    <>
                                        <Ionicons name="image-outline" size={32} color={colors.text.placeholder} />
                                        <Text style={styles.idUploadText}>Tap to upload ID</Text>
                                    </>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Bio (optional)</Text>
                <View style={[styles.inputWrap, { height: 90, alignItems: 'flex-start', paddingTop: 10 }]}>
                    <TextInput
                        style={[styles.input, { textAlignVertical: 'top' }]}
                        placeholder="Tell the chama community a little about yourself..."
                        placeholderTextColor={colors.text.placeholder}
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity style={styles.completeBtn} onPress={handleFinish} activeOpacity={0.87}>
                    <Text style={styles.completeBtnText}>Complete Setup</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('MainApp')}>
                    <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.white },
    scroll: { paddingHorizontal: 24, paddingTop: 70, paddingBottom: 40 },
    title: { ...typography.h2, color: colors.text.dark, textAlign: 'center', marginBottom: 8 },
    subtitle: { ...typography.body, color: colors.text.muted, textAlign: 'center', marginBottom: 28 },
    avatarWrap: { alignItems: 'center', marginBottom: 24 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, borderStyle: 'dashed', overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%' },
    avatarBadge: { position: 'absolute', top: 70, right: '35%', backgroundColor: colors.primary, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
    avatarHint: { ...typography.small, color: colors.text.muted, marginTop: 8 },
    label: { ...typography.smallMedium, color: colors.text.muted, marginBottom: 6 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.primary, borderRadius: radii.md, paddingHorizontal: 12, marginBottom: 16, backgroundColor: colors.inputBg },
    inputIcon: { marginRight: 8 },
    input: { flex: 1, ...typography.body, color: colors.text.dark, paddingVertical: 13 },
    idUploadContainer: { marginBottom: 16 },
    idUploadBox: { height: 160, backgroundColor: colors.inputBg, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.primary, borderStyle: 'dashed', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    idUploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    idUploadText: { marginTop: 8, ...typography.small, color: colors.text.muted },
    idUploadImg: { width: '100%', height: '100%', resizeMode: 'cover' },
    completeBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingVertical: 15, alignItems: 'center', ...shadows.button, marginTop: 8 },
    completeBtnText: { ...typography.button, color: colors.white },
    skipBtn: { alignItems: 'center', marginTop: 14 },
    skipText: { ...typography.body, color: colors.text.muted },
});
