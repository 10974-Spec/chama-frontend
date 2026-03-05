import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, ImageBackground, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, shadows, radii } from '../../theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../services/api';

const PRIMARY_GREEN = '#2A5C3F';
const BG_COLOR = '#F5F5F0';

export default function IdentitySetupScreen() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const intent = route.params?.intent || 'join'; // 'create' or 'join'

    const [fullName, setFullName] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [dob, setDob] = useState('');
    const [idFront, setIdFront] = useState<string | null>(null);
    const [idBack, setIdBack] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'loading' | 'success' | 'error'>('loading');
    const [modalMessage, setModalMessage] = useState('');

    // Image Picker Modal State
    const [imagePickerVisible, setImagePickerVisible] = useState(false);
    const [pickerSide, setPickerSide] = useState<'front' | 'back' | null>(null);

    const handlePickImage = (side: 'front' | 'back') => {
        setPickerSide(side);
        setImagePickerVisible(true);
    };

    const handleLaunchCamera = async () => {
        setImagePickerVisible(false);
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Denied', 'Camera permission is required to verify your ID.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0] && pickerSide) {
            if (pickerSide === 'front') setIdFront(result.assets[0].uri);
            if (pickerSide === 'back') setIdBack(result.assets[0].uri);
        }
    };

    const handleLaunchGallery = async () => {
        setImagePickerVisible(false);
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0] && pickerSide) {
            if (pickerSide === 'front') setIdFront(result.assets[0].uri);
            if (pickerSide === 'back') setIdBack(result.assets[0].uri);
        }
    };

    const handleContinue = async () => {
        if (step === 1) {
            if (!fullName || !idNumber || !dob) {
                Alert.alert('Missing Fields', 'Please complete your Full Name, ID Number, and Date of Birth to continue.');
                return;
            }
            setStep(2);
        } else {
            // Step 2 OCR Validation API Call
            if (!idFront) {
                Alert.alert('ID Required', 'Please upload at least the front of your ID card.');
                return;
            }

            setModalType('loading');
            setModalMessage('Analyzing your ID Card with secure OCR. This might take a few seconds...');
            setModalVisible(true);

            try {
                const formData = new FormData();
                formData.append('idNumber', idNumber);
                formData.append('fullName', fullName);

                // Extract filename and mime from URI correctly for react-native
                const localUri = idFront;
                const filename = localUri.split('/').pop() || 'id_front.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                formData.append('idImage', { uri: localUri, name: filename, type } as any);

                const res = await api.post('/ocr/validate-id', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data.success) {
                    setModalType('success');
                    setModalMessage('Your identity has been successfully verified!');

                    setTimeout(() => {
                        setModalVisible(false);
                        navigation.navigate('OnboardingQuestionsScreen', {
                            intent,
                            identityData: { fullName, idNumber, dob, idFront, idBack }
                        });
                    }, 2000); // Give user time to see the success message
                }

            } catch (error: any) {
                console.error("OCR Validation Error", error.response?.data || error.message);
                setModalType('error');
                setModalMessage(error.response?.data?.message || 'We could not verify your ID. Please ensure the picture is clear and try again.');
            }
        }
    };

    const handleBack = () => {
        if (step === 2) {
            setStep(1);
        } else {
            navigation.goBack();
        }
    };

    return (
        <>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ImageBackground source={require('../../../assets/watermark.jpeg')} style={StyleSheet.absoluteFillObject} imageStyle={{ opacity: 0.1 }} />
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                        </TouchableOpacity>
                        <View style={styles.progressWrap}>
                            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                        </View>
                    </View>

                    {step === 1 && (
                        <>
                            <View style={styles.titleSection}>
                                <Text style={styles.title}>Complete Your Profile</Text>
                                <Text style={styles.subtitle}>Before you {intent === 'create' ? 'create' : 'join'} a chama, we need to verify your identity. This builds financial trust across the platform.</Text>
                            </View>

                            {/* Trust Badge */}
                            <View style={styles.trustBadge}>
                                <Ionicons name="lock-closed" size={20} color={PRIMARY_GREEN} />
                                <Text style={styles.trustText}>Your information is encrypted and secure.</Text>
                            </View>

                            <View style={styles.formSection}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name (as per ID)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. John Doe"
                                        placeholderTextColor="#BDBDBD"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>National ID Number</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 12345678"
                                        placeholderTextColor="#BDBDBD"
                                        keyboardType="numeric"
                                        value={idNumber}
                                        onChangeText={setIdNumber}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Date of Birth</Text>
                                    <TouchableOpacity
                                        style={[styles.input, { justifyContent: 'center' }]}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={{ color: dob ? '#1A1A1A' : '#BDBDBD', fontSize: 16 }}>
                                            {dob || "YYYY-MM-DD"}
                                        </Text>
                                    </TouchableOpacity>

                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={dob ? new Date(dob) : new Date(2000, 0, 1)}
                                            mode="date"
                                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                            maximumDate={new Date()}
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(Platform.OS === 'ios');
                                                if (selectedDate) {
                                                    const formattedDate = selectedDate.toISOString().split('T')[0];
                                                    setDob(formattedDate);
                                                }
                                            }}
                                        />
                                    )}
                                </View>
                            </View>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <View style={styles.titleSection}>
                                <Text style={styles.title}>ID Card Verification</Text>
                                <Text style={styles.subtitle}>Please upload a clear picture of the front and back of your National ID. This is required for M-Pesa transactions and platform security.</Text>
                            </View>

                            <View style={styles.idUploadRow}>
                                <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage('front')} activeOpacity={0.8}>
                                    {idFront ? (
                                        <Image source={{ uri: idFront }} style={styles.uploadedImage} />
                                    ) : (
                                        <>
                                            <Ionicons name="id-card-outline" size={32} color={PRIMARY_GREEN} style={{ opacity: 0.6 }} />
                                            <Text style={styles.uploadText}>Upload ID Front</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.uploadBox} onPress={() => handlePickImage('back')} activeOpacity={0.8}>
                                    {idBack ? (
                                        <Image source={{ uri: idBack }} style={styles.uploadedImage} />
                                    ) : (
                                        <>
                                            <Ionicons name="id-card-outline" size={32} color={PRIMARY_GREEN} style={{ opacity: 0.6 }} />
                                            <Text style={styles.uploadText}>Upload ID Back</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <View style={styles.bottomSection}>
                        <TouchableOpacity
                            style={styles.primaryBtnWrap}
                            activeOpacity={0.88}
                            onPress={handleContinue}
                        >
                            <LinearGradient
                                colors={['#4CAF50', PRIMARY_GREEN, '#1B3D28']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.primaryBtn}
                            >
                                <Text style={styles.primaryBtnText}>{step === 1 ? "Let's Continue" : "Submit Identity"}</Text>
                                <Ionicons name="arrow-forward" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                            </LinearGradient>
                        </TouchableOpacity>

                        {step === 2 && (
                            <TouchableOpacity
                                style={styles.skipBtn}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('OnboardingQuestionsScreen', {
                                    intent,
                                    identityData: { fullName, idNumber, dob, idFront: null, idBack: null }
                                })}
                            >
                                <Text style={styles.skipBtnText}>Skip for now</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* --- Image Picker Options Modal --- */}
            <Modal
                transparent={true}
                visible={imagePickerVisible}
                animationType="slide"
                onRequestClose={() => setImagePickerVisible(false)}
            >
                <TouchableOpacity style={styles.bottomSheetOverlay} activeOpacity={1} onPress={() => setImagePickerVisible(false)}>
                    <View style={styles.bottomSheetContent}>
                        <View style={styles.bottomSheetHandle} />
                        <Text style={styles.bottomSheetTitle}>Upload ID Photo</Text>
                        <Text style={styles.bottomSheetSubtitle}>How would you like to upload your ID?</Text>

                        <TouchableOpacity style={styles.optionBtn} onPress={handleLaunchCamera}>
                            <View style={styles.optionIconWrap}>
                                <Ionicons name="camera-outline" size={24} color={PRIMARY_GREEN} />
                            </View>
                            <Text style={styles.optionText}>Take Photo</Text>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionBtn} onPress={handleLaunchGallery}>
                            <View style={styles.optionIconWrap}>
                                <Ionicons name="image-outline" size={24} color={PRIMARY_GREEN} />
                            </View>
                            <Text style={styles.optionText}>Choose from Gallery</Text>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setImagePickerVisible(false)}>
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* --- Custom Modal --- */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, modalType === 'success' ? styles.modalSuccess : modalType === 'error' ? styles.modalError : {}]}>
                        {modalType === 'loading' && (
                            <>
                                <ActivityIndicator size="large" color={PRIMARY_GREEN} style={{ marginBottom: 16 }} />
                                <Text style={styles.modalTitle}>Verifying Identity</Text>
                                <Text style={styles.modalBodyText}>{modalMessage}</Text>
                            </>
                        )}

                        {modalType === 'success' && (
                            <>
                                <View style={styles.modalIconWrapSuccess}>
                                    <Ionicons name="checkmark-circle" size={60} color={PRIMARY_GREEN} />
                                </View>
                                <Text style={styles.modalTitle}>Verification Successful</Text>
                                <Text style={styles.modalBodyText}>{modalMessage}</Text>
                            </>
                        )}

                        {modalType === 'error' && (
                            <>
                                <View style={styles.modalIconWrapError}>
                                    <Ionicons name="close-circle" size={60} color="#E53935" />
                                </View>
                                <Text style={styles.modalTitle}>Verification Failed</Text>
                                <Text style={styles.modalBodyText}>{modalMessage}</Text>
                                <TouchableOpacity
                                    style={styles.modalBtnError}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.modalBtnTextError}>Try Again</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: BG_COLOR },
    scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8E8E8', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    progressWrap: { flex: 1, flexDirection: 'row', gap: 8, paddingRight: 40 },
    progressDot: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#E0E0E0' },
    progressDotActive: { backgroundColor: PRIMARY_GREEN },

    titleSection: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 8 },
    subtitle: { fontSize: 15, color: '#666666', lineHeight: 22 },

    trustBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 12, marginBottom: 32 },
    trustText: { marginLeft: 8, fontSize: 13, fontWeight: '600', color: PRIMARY_GREEN },

    formSection: { flex: 1, gap: 16 },
    inputGroup: { flex: 1 },
    label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8, marginLeft: 4 },
    input: { height: 60, backgroundColor: colors.white, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#1A1A1A', borderWidth: 1, borderColor: '#E0E0E0' },

    idUploadRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    uploadBox: { flex: 1, height: 100, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    uploadText: { fontSize: 13, color: '#666666', marginTop: 8, fontWeight: '500' },
    uploadedImage: { width: '100%', height: '100%', resizeMode: 'cover' },

    bottomSection: { width: '100%', marginTop: 40 },
    primaryBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    primaryBtn: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 999 },
    primaryBtnText: { fontSize: 17, fontWeight: '700', color: colors.white },
    skipBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
    skipBtnText: { fontSize: 14, color: '#999', textDecorationLine: 'underline' },

    /* --- Modal Styles --- */
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalContent: { width: '100%', backgroundColor: colors.white, borderRadius: 24, padding: 32, alignItems: 'center', ...shadows.card },
    modalSuccess: { borderColor: PRIMARY_GREEN, borderWidth: 2 },
    modalError: { borderColor: '#FFEBEB', borderWidth: 2, backgroundColor: '#FFFAFA' },
    modalIconWrapSuccess: { marginBottom: 16 },
    modalIconWrapError: { marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A', marginBottom: 12, textAlign: 'center' },
    modalBodyText: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    modalBtnError: { width: '100%', height: 56, backgroundColor: '#E53935', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    modalBtnTextError: { color: colors.white, fontSize: 16, fontWeight: '700' },

    /* --- Bottom Sheet Picker Styles --- */
    bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    bottomSheetContent: { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    bottomSheetHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    bottomSheetTitle: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
    bottomSheetSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    optionIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    optionText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    cancelBtn: { marginTop: 24, height: 56, backgroundColor: '#F5F5F0', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' }
});
