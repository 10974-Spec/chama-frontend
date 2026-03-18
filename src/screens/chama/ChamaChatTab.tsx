import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { io, Socket } from 'socket.io-client';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography, shadows, radii } from '../../theme';
import { useApp } from '../../context/AppContext';
import api, { getBaseUrl } from '../../services/api';
import { useCustomAlert } from '../../components/ui/CustomAlert';

export default function ChamaChatTab() {
    const { colors } = useTheme();
    const styles = makeStyles(colors);
    const route = useRoute<any>();
    const { chamaId } = route.params || {};
    const themeColor = '#2A5C3F';
    const { user } = useApp();
    const insets = useSafeAreaInsets();
    const { showAlert, AlertComponent } = useCustomAlert();
    const [attachPickerVisible, setAttachPickerVisible] = React.useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [attachment, setAttachment] = useState<{ uri: string, type: 'image' | 'document', name: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const listRef = useRef<FlatList>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!chamaId) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/chamas/${chamaId}/messages`);
                setMessages(res.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        const backendUrl = getBaseUrl().replace('/api', '');
        const socket = io(backendUrl);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Chat socket connected:', socket.id);
            socket.emit('joinRoom', chamaId);
        });

        socket.on('newMessage', (msg) => {
            setMessages((prev) => [...prev, msg]);
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        });

        return () => {
            socket.emit('leaveRoom', chamaId);
            socket.disconnect();
        };
    }, [chamaId]);

    const handleAttachmentPress = () => {
        setAttachPickerVisible(true);
    };

    const pickImage = async (useCamera: boolean) => {
        let result;
        if (useCamera) {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
                alert("You've refused to allow this app to access your camera!");
                return;
            }
            result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.5,
            });
        }

        if (!result.canceled) {
            setAttachment({
                uri: result.assets[0].uri,
                type: 'image',
                name: `image-${Date.now()}.jpg`
            });
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({});
            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAttachment({
                    uri: result.assets[0].uri,
                    type: 'document',
                    name: result.assets[0].name || `document-${Date.now()}`
                });
            }
        } catch (err) {
            console.error('Error picking document', err);
        }
    };

    const sendMessage = async () => {
        if (!text.trim() && !attachment) return;
        setSending(true);

        let attachmentUrl = null;
        let attachmentType = null;

        if (attachment) {
            try {
                const formData = new FormData();
                formData.append('image', {
                    uri: Platform.OS === 'android' ? attachment.uri : attachment.uri.replace('file://', ''),
                    type: attachment.type === 'image' ? 'image/jpeg' : 'application/octet-stream',
                    name: attachment.name,
                } as any);

                const res = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                attachmentUrl = res.data.url.startsWith('http') ? res.data.url : getBaseUrl().replace('/api', '') + res.data.url;
                attachmentType = attachment.type;
            } catch (error) {
                console.error('Failed to upload attachment', error);
                showAlert('error', 'Upload Failed', 'Could not upload the attachment.');
                setSending(false);
                return;
            }
        }

        const currentText = text.trim();
        setText('');
        setAttachment(null);



        try {
            await api.post(`/chamas/${chamaId}/messages`, {
                content: currentText,
                attachmentUrl,
                attachmentType
            });
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        } catch (err) {
            console.error('Failed to send message', err);
            setText(currentText); // Restore text
        }
        setSending(false);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <>
            <KeyboardAvoidingView
                style={{ flex: 1, backgroundColor: '#F7F8FA' }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 70}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(i, index) => i._id || index.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => {
                        const isMe = item.senderId?._id === user?._id || item.senderId === user?._id;
                        const avatarUrl = item.senderId?.profile?.avatar || 'https://i.pravatar.cc/150';
                        const senderName = isMe ? 'Me' : (item.senderId?.profile?.name || 'User');
                        const timeString = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now';

                        return (
                            <View style={[styles.bubbleWrap, isMe && styles.bubbleWrapSent]}>
                                {!isMe && <Image source={{ uri: avatarUrl }} style={styles.avatar} />}
                                <View>
                                    {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
                                    <View style={[styles.bubble, isMe ? styles.bubbleSent : styles.bubbleReceived]}>
                                        {/* Handle attachments */}
                                        {item.attachmentUrl && item.attachmentType === 'image' && (
                                            <Image source={{ uri: item.attachmentUrl }} style={styles.bubbleImage} />
                                        )}
                                        {item.attachmentUrl && item.attachmentType === 'document' && (
                                            <View style={styles.bubbleDoc}>
                                                <Ionicons name="document-text" size={24} color={isMe ? '#FFFFFF' : themeColor} />
                                                <Text style={[styles.bubbleDocText, isMe && { color: '#FFFFFF' }]} numberOfLines={1}>Document Attachment</Text>
                                            </View>
                                        )}
                                        {item.content ? (
                                            <Text style={[styles.bubbleText, isMe && { color: colors.text.dark }]}>{item.content}</Text>
                                        ) : null}
                                    </View>
                                    <Text style={[styles.bubbleTime, isMe && { textAlign: 'right' }]}>{timeString}</Text>
                                </View>
                            </View>
                        );
                    }}
                    onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
                />

                {/* Attachment Preview Area */}
                {attachment && (
                    <View style={styles.attachmentPreview}>
                        {attachment.type === 'image' ? (
                            <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
                        ) : (
                            <View style={styles.previewDoc}>
                                <Ionicons name="document-text" size={32} color={themeColor} />
                                <Text style={styles.previewDocText} numberOfLines={1}>{attachment.name}</Text>
                            </View>
                        )}
                        <TouchableOpacity style={styles.removeAttachmentBtn} onPress={() => setAttachment(null)}>
                            <Ionicons name="close-circle" size={24} color="#FA5252" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Input bar */}
                <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                    <TouchableOpacity style={styles.attachBtn} onPress={handleAttachmentPress}>
                        <Ionicons name="add-circle-outline" size={26} color={colors.text.muted} />
                    </TouchableOpacity>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Type a message..."
                            placeholderTextColor={colors.text.placeholder}
                            value={text}
                            onChangeText={setText}
                            multiline
                        />
                        <TouchableOpacity>
                            <Ionicons name="happy-outline" size={20} color={colors.text.muted} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        style={[styles.sendBtn, (text.trim() || attachment) ? { backgroundColor: themeColor } : null]}
                        onPress={sendMessage}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <Ionicons name="send" size={18} color={(text.trim() || attachment) ? colors.white : colors.text.muted} />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Attachment Picker Sheet */}
            <Modal transparent visible={attachPickerVisible} animationType="slide" onRequestClose={() => setAttachPickerVisible(false)}>
                <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }} activeOpacity={1} onPress={() => setAttachPickerVisible(false)}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>Send Attachment</Text>
                        {[{ icon: 'camera-outline', label: 'Camera', action: () => { setAttachPickerVisible(false); pickImage(true); } },
                        { icon: 'image-outline', label: 'Photo Gallery', action: () => { setAttachPickerVisible(false); pickImage(false); } },
                        { icon: 'document-text-outline', label: 'Document', action: () => { setAttachPickerVisible(false); pickDocument(); } },
                        ].map(item => (
                            <TouchableOpacity key={item.label} style={styles.pickerRow} onPress={item.action}>
                                <View style={styles.pickerIcon}><Ionicons name={item.icon as any} size={22} color='#2A5C3F' /></View>
                                <Text style={styles.pickerLabel}>{item.label}</Text>
                                <Ionicons name="chevron-forward" size={18} color="#CCC" />
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.pickerCancel} onPress={() => setAttachPickerVisible(false)}>
                            <Text style={styles.pickerCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
            <AlertComponent />
        </>
    );
}

const makeStyles = (colors: any) => StyleSheet.create({
    list: { padding: 14, paddingBottom: 10 },
    bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
    bubbleWrapSent: { flexDirection: 'row-reverse' },
    avatar: { width: 32, height: 32, borderRadius: 16, marginBottom: 16 },
    senderName: { ...typography.caption, color: colors.text.muted, marginBottom: 3, marginLeft: 2 },
    bubble: { maxWidth: 260, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
    bubbleSent: { backgroundColor: colors.sent, borderBottomRightRadius: 4 },
    bubbleReceived: { backgroundColor: colors.received, borderBottomLeftRadius: 4 },
    bubbleText: { ...typography.body, color: colors.text.dark, lineHeight: 20 },
    bubbleTime: { ...typography.caption, color: colors.text.light, marginTop: 2 },

    // Attachment styles
    bubbleImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 6, resizeMode: 'cover' },
    bubbleDoc: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', padding: 10, borderRadius: 8, marginBottom: 6 },
    bubbleDocText: { ...typography.bodyMedium, color: colors.text.dark, marginLeft: 8, flex: 1 },

    attachmentPreview: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: 'center',
    },
    previewImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    previewDoc: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, padding: 12, borderRadius: 8, flex: 1, marginRight: 12 },
    previewDocText: { ...typography.bodyMedium, color: colors.text.dark, marginLeft: 8, flex: 1 },
    removeAttachmentBtn: { padding: 4, position: 'absolute', top: 6, right: 6, zIndex: 10 },

    inputBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
    attachBtn: { padding: 2 },
    inputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 24, paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
    input: { flex: 1, ...typography.body, color: colors.text.dark, maxHeight: 100 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center' },
    sendBtnActive: { backgroundColor: colors.primary, ...shadows.button },

    /* Picker bottom-sheet */
    pickerSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    pickerHandle: { width: 40, height: 5, backgroundColor: '#E0E0E0', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
    pickerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
    pickerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    pickerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    pickerLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    pickerCancel: { marginTop: 20, height: 52, backgroundColor: '#F5F5F0', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    pickerCancelText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
});
