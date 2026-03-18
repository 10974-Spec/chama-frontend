import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, StatusBar, ActivityIndicator,
    ImageBackground, Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, shadows, radii } from '../../theme';
import api, { getBaseUrl } from '../../services/api';
import { useCustomAlert } from '../../components/ui/CustomAlert';

const PRIMARY_GREEN = '#2A5C3F';
const BG_WHITE = '#FFFFFF';
const PRIMARY_GREEN_LIGHT = '#3A7D54';

export default function CreateChamaScreen({ navigation }: any) {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const { showAlert, AlertComponent } = useCustomAlert();
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [contribution, setContribution] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [maxMembers, setMaxMembers] = useState(20);
    const [isCustomMembers, setIsCustomMembers] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) uploadImage(result.assets[0].uri);
    };

    const uploadImage = async (uri: string) => {
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                type: 'image/jpeg',
                name: `chama-logo-${Date.now()}.jpg`
            } as any);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = res.data.url.startsWith('http') ? res.data.url : getBaseUrl().replace('/api', '') + res.data.url;
            setLogoUrl(fullUrl);
        } catch (error: any) {
            console.error('Failed to upload chama logo', error.response?.data || error.message);
            showAlert('error', 'Upload Failed', 'Could not upload the logo image.');
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/chamas', {
                name,
                description: desc,
                tags,
                logo: logoUrl || undefined,
                weeklyContribution: Number(contribution),
                visibility: isPublic ? 'public' : 'private',
                maxMembers
            });
            // 7-day free trial — navigate straight to chama home
            showAlert('success', '🎉 Chama Created!', 'Your chama is live! You have a 7-day free trial.');
            setTimeout(() => navigation.navigate('ChamaHome', { chamaId: res.data._id }), 1800);
        } catch (err: any) {
            showAlert('error', 'Error', err?.response?.data?.message || 'Failed to create chama');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            if (!name.trim()) {
                showAlert('warning', 'Missing Info', 'Please provide a name for your Chama.');
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (!contribution) {
                showAlert('warning', 'Missing Info', 'Please set a weekly contribution amount.');
                return;
            }
            setStep(3);
        } else {
            handleCreate();
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    return (
        <>
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor={BG_WHITE} />

                {/* ── Watermark background ── */}
                <ImageBackground
                    source={require('../../../assets/watermark.jpeg')}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                    imageStyle={{ opacity: 0.13 }}
                />

                <View style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={styles.scroll}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ── Header ── */}
                        <View style={styles.topHeader}>
                            <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
                                <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                            </TouchableOpacity>
                            {/* Custom Logo Image */}
                            <Image source={require('../../../assets/chama-logo.png')} style={styles.headerLogoImage} resizeMode="contain" />
                            <View style={{ width: 36 }} />
                        </View>

                        {/* ── Progress Indicators ── */}
                        <View style={styles.progressWrap}>
                            {[1, 2, 3].map(s => (
                                <View key={s} style={[styles.progressDot, step >= s && styles.progressDotActive]} />
                            ))}
                        </View>

                        {/* ── Title ── */}
                        <Text style={styles.title}>Create a Chama</Text>
                        <Text style={styles.subtitle}>
                            {step === 1 && 'Set up your group savings circle.'}
                            {step === 2 && 'Configure chama settings.'}
                            {step === 3 && 'Review platform fees to create your chama.'}
                        </Text>

                        {/* ── Form ── */}
                        <View style={styles.form}>
                            {step === 1 && (
                                <>
                                    {/* ── Logo upload ── */}
                                    <TouchableOpacity
                                        style={styles.logoUpload}
                                        onPress={pickImage}
                                        disabled={uploadingLogo}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.logoUploadCircle, logoUrl && { borderWidth: 0, overflow: 'hidden' }]}>
                                            {logoUrl ? (
                                                <Image source={{ uri: logoUrl }} style={{ width: '100%', height: '100%' }} />
                                            ) : uploadingLogo ? (
                                                <ActivityIndicator size="large" color={PRIMARY_GREEN} />
                                            ) : (
                                                <Ionicons name="image-outline" size={32} color={PRIMARY_GREEN} />
                                            )}
                                        </View>
                                        <Text style={styles.logoUploadText}>
                                            {uploadingLogo ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Chama Name */}
                                    <View style={styles.inputRow}>
                                        <Ionicons name="people-outline" size={18} color="#9E9E9E" />
                                        <View style={styles.inputDivider} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Chama Name"
                                            placeholderTextColor="#BDBDBD"
                                            value={name}
                                            onChangeText={setName}
                                        />
                                    </View>

                                    {/* Description */}
                                    <View style={[styles.inputRow, styles.textAreaRow]}>
                                        <Ionicons name="document-text-outline" size={18} color="#9E9E9E" style={{ marginTop: 2 }} />
                                        <View style={styles.inputDivider} />
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            placeholder="What is this chama about?"
                                            placeholderTextColor="#BDBDBD"
                                            value={desc}
                                            onChangeText={setDesc}
                                            multiline
                                            numberOfLines={3}
                                            textAlignVertical="top"
                                        />
                                    </View>

                                    {/* Tags Input Section */}
                                    <Text style={styles.sectionLabel}>Search Tags (Optional)</Text>
                                    <View style={styles.inputRow}>
                                        <Ionicons name="pricetag-outline" size={18} color="#9E9E9E" />
                                        <View style={styles.inputDivider} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. Savings, Investment, Family"
                                            placeholderTextColor="#BDBDBD"
                                            value={tagInput}
                                            onChangeText={setTagInput}
                                            onSubmitEditing={() => {
                                                const newTag = tagInput.trim();
                                                if (newTag && !tags.includes(newTag)) {
                                                    setTags([...tags, newTag]);
                                                    setTagInput('');
                                                }
                                            }}
                                            returnKeyType="done"
                                        />
                                        <TouchableOpacity
                                            style={{ padding: 4 }}
                                            onPress={() => {
                                                const newTag = tagInput.trim();
                                                if (newTag && !tags.includes(newTag)) {
                                                    setTags([...tags, newTag]);
                                                    setTagInput('');
                                                }
                                            }}
                                        >
                                            <Ionicons name="add-circle" size={24} color={PRIMARY_GREEN} />
                                        </TouchableOpacity>
                                    </View>

                                    {tags.length > 0 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                                            {tags.map((tag, index) => (
                                                <View key={index} style={styles.tagPill}>
                                                    <Text style={styles.tagPillText}>{tag}</Text>
                                                    <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== index))}>
                                                        <Ionicons name="close-circle" size={16} color={PRIMARY_GREEN} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    )}
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    {/* Weekly Contribution */}
                                    <View style={styles.inputRow}>
                                        <Ionicons name="cash-outline" size={18} color="#9E9E9E" />
                                        <View style={styles.inputDivider} />
                                        <Text style={styles.currencyLabel}>Ksh</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Weekly contribution"
                                            placeholderTextColor="#BDBDBD"
                                            keyboardType="numeric"
                                            value={contribution}
                                            onChangeText={setContribution}
                                        />
                                    </View>

                                    {/* Privacy toggle */}
                                    <Text style={styles.sectionLabel}>Privacy</Text>
                                    <View style={styles.toggleRow}>
                                        {[
                                            { label: 'Public', icon: 'earth-outline', val: true },
                                            { label: 'Private', icon: 'lock-closed-outline', val: false }
                                        ].map(opt => (
                                            <TouchableOpacity
                                                key={opt.label}
                                                style={[styles.toggleBtn, isPublic === opt.val && styles.toggleBtnActive]}
                                                onPress={() => setIsPublic(opt.val)}
                                            >
                                                <Ionicons
                                                    name={opt.icon as any}
                                                    size={16}
                                                    color={isPublic === opt.val ? PRIMARY_GREEN : '#9E9E9E'}
                                                />
                                                <Text style={[
                                                    styles.toggleText,
                                                    isPublic === opt.val && styles.toggleTextActive
                                                ]}>
                                                    {opt.label}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* Max members */}
                                    <Text style={styles.sectionLabel}>
                                        Max Members: <Text style={styles.sectionLabelValue}>{maxMembers}</Text>
                                    </Text>
                                    <View style={styles.membersRow}>
                                        {[5, 10, 15, 20, 30, 50].map(val => (
                                            <TouchableOpacity
                                                key={val}
                                                style={[styles.memberBtn, maxMembers === val && !isCustomMembers && styles.memberBtnActive]}
                                                onPress={() => {
                                                    setMaxMembers(val);
                                                    setIsCustomMembers(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.memberBtnText,
                                                    maxMembers === val && !isCustomMembers && styles.memberBtnTextActive
                                                ]}>
                                                    {val}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                        {/* Custom input wrapper */}
                                        <View style={[styles.memberBtn, styles.memberCustomWrap, isCustomMembers && styles.memberBtnActive]}>
                                            <TextInput
                                                style={[styles.memberCustomInput, isCustomMembers && styles.memberCustomInputActive]}
                                                placeholder="Custom"
                                                placeholderTextColor={isCustomMembers ? '#E0F0E4' : '#9E9E9E'}
                                                keyboardType="numeric"
                                                onFocus={() => setIsCustomMembers(true)}
                                                onChangeText={(val) => {
                                                    setIsCustomMembers(true);
                                                    setMaxMembers(Number(val) || 0);
                                                }}
                                                value={isCustomMembers && maxMembers ? maxMembers.toString() : ''}
                                                maxLength={4}
                                            />
                                        </View>
                                    </View>
                                </>
                            )}

                            {step === 3 && (
                                <View style={styles.summaryContainer}>
                                    <Text style={styles.summaryTitle}>Chama Summary</Text>

                                    <View style={styles.summaryCard}>
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Name</Text>
                                            <Text style={styles.summaryValue}>{name}</Text>
                                        </View>
                                        <View style={styles.summaryDivider} />
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Description</Text>
                                            <Text style={styles.summaryValue} numberOfLines={2}>{desc || 'No description provided.'}</Text>
                                        </View>
                                        <View style={styles.summaryDivider} />
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Contribution</Text>
                                            <Text style={styles.summaryValue}>Ksh {contribution}/week</Text>
                                        </View>
                                        <View style={styles.summaryDivider} />
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Privacy</Text>
                                            <Text style={[styles.summaryValue, { textTransform: 'capitalize' }]}>{isPublic ? 'Public' : 'Private'}</Text>
                                        </View>
                                        <View style={styles.summaryDivider} />
                                        <View style={styles.summaryRow}>
                                            <Text style={styles.summaryLabel}>Limits</Text>
                                            <Text style={styles.summaryValue}>Max {maxMembers} Members</Text>
                                        </View>
                                    </View>

                                    <Text style={[styles.summaryTitle, { marginTop: 8 }]}>Fees</Text>
                                    {/* ── Fee Details & Agreement ── */}
                                    <View style={styles.feeInfoCard}>
                                        <Ionicons name="information-circle" size={20} color={PRIMARY_GREEN} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.feeInfoTitle}>Platform Fees</Text>
                                            <Text style={styles.feeInfoText}>• <Text style={{ fontWeight: '700' }}>Ksh 500</Text> onboarding fee to activate upon creation.</Text>
                                            <Text style={styles.feeInfoText}>• <Text style={{ fontWeight: '700' }}>Ksh 10-30</Text> per member transaction based on amount.</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.agreementText}>
                                        By completing creation, you agree to our{' '}
                                        <Text
                                            style={styles.agreementLink}
                                            onPress={() => navigation.navigate('TermsPrivacy', { tab: 'terms' })}
                                        >Terms of Service</Text>.
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>

                {/* ── Sticky Bottom Bar ── */}
                <View style={styles.stickyFooter}>
                    {/* ── Create / Next button ── */}
                    <View style={[styles.createBtnShadow, loading && { opacity: 0.75 }]}>
                        <TouchableOpacity
                            style={styles.createBtnWrap}
                            onPress={handleNext}
                            disabled={loading}
                            activeOpacity={0.88}
                        >
                            <LinearGradient
                                colors={[PRIMARY_GREEN_LIGHT, PRIMARY_GREEN, '#1B3D28']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.createBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color={BG_WHITE} />
                                ) : (
                                    <>
                                        {step === 3 ? (
                                            <Ionicons name="checkmark-circle-outline" size={20} color={BG_WHITE} />
                                        ) : (
                                            <Ionicons name="arrow-forward-outline" size={20} color={BG_WHITE} />
                                        )}
                                        <Text style={styles.createBtnText}>
                                            {step === 1 ? 'Continue' : step === 2 ? 'Review & Finish' : 'Create Chama'}
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footerTags}>CHAMA APP © 2026. ALL RIGHTS RESERVED.</Text>
                </View>

            </View>
            <AlertComponent />
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG_WHITE,
    },
    scroll: {
        paddingHorizontal: 44,
        paddingBottom: 20,
    },

    /* ── Header ── */
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 20,
    },
    iconBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: '#F2F2F2',
        alignItems: 'center', justifyContent: 'center',
    },
    headerLogoImage: { width: 180, height: 50, transform: [{ scale: 1.6 }] },

    /* ── Progress Indicators ── */
    progressWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    progressDot: {
        height: 6,
        flex: 1,
        borderRadius: 3,
        backgroundColor: '#E0E0E0',
    },
    progressDotActive: {
        backgroundColor: PRIMARY_GREEN,
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

    /* ── Logo upload ── */
    logoUpload: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    logoUploadCircle: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 2, borderColor: PRIMARY_GREEN,
        borderStyle: 'dashed',
        backgroundColor: '#EEF4EF',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 10,
    },
    logoUploadText: {
        fontSize: 13,
        color: PRIMARY_GREEN,
        fontWeight: '700',
        textAlign: 'center',
    },

    /* ── Form ── */
    form: {
        gap: 11,
        marginBottom: 22,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        paddingHorizontal: 16,
        height: 58,
    },
    textAreaRow: {
        borderRadius: 18,           // softer radius for multiline
        height: 90,
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    inputDivider: {
        width: 1,
        height: 20,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 10,
    },
    currencyLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: PRIMARY_GREEN,
        marginRight: 4,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    textArea: {
        paddingTop: 2,
        lineHeight: 20,
    },

    /* ── Section labels ── */
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#777777',
        marginBottom: 8,
        marginLeft: 4,
    },
    sectionLabelValue: {
        color: PRIMARY_GREEN,
        fontWeight: '800',
    },

    /* ── Tags System ── */
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF4EF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#C8DFC9',
        gap: 6
    },
    tagPillText: {
        color: PRIMARY_GREEN,
        fontSize: 13,
        fontWeight: '600'
    },

    /* ── Privacy toggle ── */
    toggleRow: {
        flexDirection: 'row',
        gap: 10,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1.5,
        borderColor: '#C8DFC9',
        borderRadius: 999,
        paddingVertical: 12,
        backgroundColor: '#F7FAF7',
    },
    toggleBtnActive: {
        borderColor: PRIMARY_GREEN,
        backgroundColor: '#EEF4EF',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9E9E9E',
    },
    toggleTextActive: {
        color: PRIMARY_GREEN,
        fontWeight: '700',
    },

    /* ── Max members ── */
    membersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    memberBtn: {
        width: 52, height: 40,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: '#C8DFC9',
        backgroundColor: '#F7FAF7',
        alignItems: 'center', justifyContent: 'center',
    },
    memberCustomWrap: {
        width: 80, // slightly wider for typing
        paddingHorizontal: 8,
    },
    memberCustomInput: {
        flex: 1,
        width: '100%',
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        paddingVertical: 0,
    },
    memberCustomInputActive: {
        color: BG_WHITE,
    },
    memberBtnActive: {
        backgroundColor: PRIMARY_GREEN,
        borderColor: PRIMARY_GREEN,
    },
    memberBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9E9E9E',
    },
    memberBtnTextActive: {
        color: BG_WHITE,
    },

    /* ── Bottom Sticky Area ── */
    stickyFooter: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
        backgroundColor: BG_WHITE,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    createBtnShadow: {
        width: '100%',
        borderRadius: 999,
        marginBottom: 12,
        shadowColor: '#1B3D28',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        backgroundColor: PRIMARY_GREEN,
    },
    createBtnWrap: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    createBtn: {
        paddingVertical: 17,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 999,
    },
    createBtnText: {
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
    footerTags: {
        fontSize: 10,
        color: '#D0D0D0',
        textAlign: 'center',
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    /* ── Fee Info / Summary ── */
    summaryContainer: {
        marginTop: 4,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        marginBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#888888',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1A1A1A',
        fontWeight: '700',
        maxWidth: '65%',
        textAlign: 'right',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 4,
    },
    feeInfoCard: {
        flexDirection: 'row',
        backgroundColor: '#EEF4EF',
        borderRadius: 16,
        padding: 16,
        gap: 12,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#C8DFC9',
    },
    feeInfoTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: PRIMARY_GREEN,
        marginBottom: 8,
    },
    feeInfoText: {
        fontSize: 13,
        color: '#555',
        marginBottom: 4,
        lineHeight: 18,
    },
});