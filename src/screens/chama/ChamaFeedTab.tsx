import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Image, ScrollView, StatusBar, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRoute } from '@react-navigation/native';
import { colors } from '../../theme';
import { useTheme } from '../../theme/ThemeContext';
import api from '../../services/api';

const PRIMARY_GREEN = '#2A5C3F';
const BG = '#F5F5F0';
const WHITE = '#FFFFFF';



function FeedCard({ item, chamaId, themeColor, onCommentPress }: any) {


    const isApiPost = !!item._id;
    const authorName = isApiPost ? (item.userId?.profile?.name || 'User') : (item.user?.name ?? 'User');
    const authorAvatar = isApiPost ? (item.userId?.profile?.avatar || 'https://i.pravatar.cc/150') : item.user?.avatar;

    const [liked, setLiked] = useState(item.likes?.length > 0 ? true : false);
    const [likes, setLikes] = useState(Array.isArray(item.likes) ? item.likes.length : (item.likes ?? 591));

    const handleLike = async () => {
        setLiked(l => !l);
        setLikes((c: number) => liked ? c - 1 : c + 1);

        if (chamaId && isApiPost) {
            try {
                await api.post(`/ chamas / ${chamaId} /posts/${item._id}/like`);
            } catch (err) {
                console.error("Failed to like post");
                setLiked(l => !l);
                setLikes((c: number) => !liked ? c - 1 : c + 1);
            }
        }
    };

    const mediaUri = item.mediaUrl || item.imageUrl || item.image;
    const hasMedia = !!mediaUri;
    const isVideo = item.mediaType === 'video' || (mediaUri && String(mediaUri).match(/\.(mp4|mov|avi|mkv)$/i));

    const videoSource = (hasMedia && isVideo) ? (mediaUri.startsWith('http') ? mediaUri : (api.defaults.baseURL?.replace('/api', '') + mediaUri)) : null;
    const player = useVideoPlayer(videoSource, p => {
        p.loop = true;
        p.play();
    });

    const postAction = item.action || 'posted an update';
    const amountStr = item.amount?.toLocaleString() || '';
    const postTime = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (item.timestamp ?? '5 mins ago');
    const commentCount = Array.isArray(item.comments) ? item.comments.length : 0;

    const handleShare = async () => {
        try {
            const message = `${authorName} ${postAction}: ${item.content || ''}\n${mediaUri ? `Media: ${mediaUri}` : ''}`;
            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleDownload = async () => {
        if (!mediaUri) return;
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access media library is required!');
                return;
            }
            // @ts-ignore
            if (!FileSystem.documentDirectory) {
                alert('File system not available');
                return;
            }
            // @ts-ignore
            const fileUri = FileSystem.documentDirectory + mediaUri.split('/').pop();
            const { uri } = await FileSystem.downloadAsync(api.defaults.baseURL?.replace('/api', '') + mediaUri, fileUri);
            await MediaLibrary.saveToLibraryAsync(uri);
            alert('Downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download media');
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: authorAvatar }} style={styles.cardAvatar} />
                <View style={{ flex: 1 }}>
                    <View style={styles.cardNameRow}>
                        <Text style={styles.cardName}>{authorName}</Text>
                        <Text style={styles.cardAction}> {postAction}</Text>
                    </View>
                    {!!amountStr && (
                        <Text style={[styles.cardAmount, { color: themeColor }]}>
                            KSh <Text style={styles.cardAmountBold}>{amountStr}</Text>
                        </Text>
                    )}
                    <Text style={styles.cardTime}>{postTime}</Text>
                </View>
                <TouchableOpacity style={styles.dotsBtn}>
                    <Ionicons name="ellipsis-horizontal" size={18} color="#BDBDBD" />
                </TouchableOpacity>
            </View>

            {hasMedia && isVideo ? (
                <View style={styles.mediaContainer}>
                    <VideoView
                        player={player}
                        style={styles.cardImage}
                        contentFit="contain"
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                </View>
            ) : hasMedia ? (
                <View style={styles.mediaContainer}>
                    <Image source={{ uri: mediaUri.startsWith('http') ? mediaUri : (api.defaults.baseURL?.replace('/api', '') + mediaUri) }} style={styles.cardImage} resizeMode="contain" />
                </View>
            ) : null}

            {(item.content || (!hasMedia && item.action)) && (
                <Text style={styles.cardText}>{item.content || (!hasMedia ? item.action : '')}</Text>
            )}

            <View style={styles.reactionsRow}>
                <TouchableOpacity onPress={handleLike} style={styles.reactBtn}>
                    <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#FA5252' : '#9E9E9E'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reactBtn} onPress={() => onCommentPress(item)}>
                    <Ionicons name="chatbubble-outline" size={19} color="#9E9E9E" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.reactBtn} onPress={handleShare}>
                    <Ionicons name="share-outline" size={19} color="#9E9E9E" />
                </TouchableOpacity>
                {hasMedia && (
                    <TouchableOpacity style={styles.reactBtn} onPress={handleDownload}>
                        <Ionicons name="download-outline" size={19} color="#9E9E9E" />
                    </TouchableOpacity>
                )}

                <View style={styles.likesRight}>
                    <Ionicons name="heart" size={14} color="#FA5252" />
                    <Text style={styles.likesCount}>{likes}</Text>
                    <Ionicons name="chatbubble" size={13} color="#9E9E9E" style={{ marginLeft: 8 }} />
                    {commentCount > 0 && <Text style={styles.likesCount}>{commentCount}</Text>}
                </View>
            </View>
        </View>
    );
}

export default function ChamaFeedTab() {


    const route = useRoute<any>();
    const { chamaId, chama } = route.params || {};
    const themeColor = '#2A5C3F';
    const amountToPay = chama?.settings?.weeklyContribution || chama?.amount || 0;

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const [newPostText, setNewPostText] = useState('');
    const [mediaFile, setMediaFile] = useState<any>(null);
    const [isPosting, setIsPosting] = useState(false);

    const isPreviewVideo = mediaFile && (mediaFile.type === 'video' || (mediaFile.uri && mediaFile.uri.match(/\.(mp4|mov|avi|mkv)$/i)));
    const previewPlayer = useVideoPlayer(isPreviewVideo ? mediaFile.uri : null, p => {
        p.loop = true;
        p.play();
    });

    const fetchPosts = async (showLoading = true) => {
        if (!chamaId) return;
        if (showLoading) setLoading(true);
        try {
            const res = await api.get(`/chamas/${chamaId}/posts`);
            if (res.data) {
                setPosts(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch posts', err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [chamaId]);

    const pickMedia = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setMediaFile(result.assets[0]);
        }
    };

    const submitPost = async () => {
        if (!newPostText.trim() && !mediaFile) return;
        setIsPosting(true);
        try {
            let uploadedMediaUrl = '';
            let mediaType = 'text';

            if (mediaFile) {
                const isVideo = mediaFile.type === 'video' || (mediaFile.uri && mediaFile.uri.match(/\.(mp4|mov|avi|mkv)$/i));
                mediaType = isVideo ? 'video' : 'image';

                const formData = new FormData();
                formData.append('file', {
                    uri: Platform.OS === 'android' ? mediaFile.uri : mediaFile.uri.replace('file://', ''),
                    name: `post-media-${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
                    type: isVideo ? 'video/mp4' : 'image/jpeg',
                } as any);

                const uploadRes = await api.post('/upload/media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedMediaUrl = uploadRes.data.url;
            }

            const postRes = await api.post(`/chamas/${chamaId}/posts`, {
                content: newPostText,
                mediaUrl: uploadedMediaUrl,
                mediaType: mediaType,
            });

            setPosts([postRes.data, ...posts]);
            setNewPostText('');
            setMediaFile(null);
        } catch (error) {
            console.error('Failed to create post', error);
            alert('Could not create post');
        } finally {
            setIsPosting(false);
        }
    };

    const openComments = (post: any) => {


        setSelectedPost(post);
        setModalVisible(true);
    };

    const submitComment = async () => {
        if (!commentText.trim() || !selectedPost || !chamaId) return;

        setSubmittingComment(true);
        try {
            const res = await api.post(`/chamas/${chamaId}/posts/${selectedPost._id}/comments`, { content: commentText.trim() });
            const updatedPost = res.data;

            // Update local post state
            setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
            setSelectedPost(updatedPost); // Refresh modal comments
            setCommentText('');
        } catch (error) {
            console.error('Failed to submit comment', error);
            alert("Could not post comment.");
        } finally {
            setSubmittingComment(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={themeColor} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                    contentContainerStyle={styles.feedList}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <View style={styles.createPostCard}>
                            <TextInput
                                style={[styles.createPostInput, { borderColor: themeColor + '40' }]}
                                placeholder="What's on your mind?"
                                value={newPostText}
                                onChangeText={setNewPostText}
                                multiline
                            />
                            {mediaFile && (
                                <View style={styles.previewWrap}>
                                    {isPreviewVideo ? (
                                        <VideoView player={previewPlayer} style={styles.mediaPreview} contentFit="contain" allowsFullscreen />
                                    ) : (
                                        <Image source={{ uri: mediaFile.uri }} style={styles.mediaPreview} resizeMode="contain" />
                                    )}
                                    <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setMediaFile(null)}>
                                        <Ionicons name="close-circle" size={24} color="#FA5252" />
                                    </TouchableOpacity>
                                </View>
                            )}
                            <View style={styles.createPostActions}>
                                <TouchableOpacity style={styles.attachBtn} onPress={pickMedia}>
                                    <Ionicons name="image-outline" size={20} color={themeColor} />
                                    <Text style={[styles.attachText, { color: themeColor }]}>Photo / Video</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.postSubmitBtn, { backgroundColor: themeColor, opacity: (!newPostText.trim() && !mediaFile) || isPosting ? 0.6 : 1 }]}
                                    onPress={submitPost}
                                    disabled={(!newPostText.trim() && !mediaFile) || isPosting}
                                >
                                    {isPosting ? <ActivityIndicator size="small" color={WHITE} /> : <Text style={styles.postSubmitText}>Post</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <FeedCard item={item} chamaId={chamaId} themeColor={themeColor} onCommentPress={openComments} />
                    )}
                    ListFooterComponent={<View style={{ height: 120 }} />}
                />
            )}

            {/* pinned pay btn */}
            <View style={styles.bottomBar}>
                <View style={[styles.payBtnShadow, { backgroundColor: themeColor, shadowColor: themeColor }]}>
                    <TouchableOpacity style={styles.payBtnWrap} activeOpacity={0.88}>
                        <LinearGradient
                            colors={[`${themeColor}99`, themeColor, themeColor]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.payBtn}
                        >
                            <Text style={styles.payBtnText}>PAY KSH {amountToPay}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Comments Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView style={{ flex: 1, backgroundColor: WHITE }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 8 }}>
                            <Ionicons name="close" size={26} color="#1A1A1A" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Comments</Text>
                        <View style={{ width: 42 }} />
                    </View>

                    <FlatList
                        data={selectedPost?.comments || []}
                        keyExtractor={(item, idx) => item._id || idx.toString()}
                        contentContainerStyle={{ padding: 16 }}
                        renderItem={({ item }) => (
                            <View style={styles.commentRow}>
                                <Image source={{ uri: item.userId?.profile?.avatar || 'https://i.pravatar.cc/150' }} style={styles.commentAvatar} />
                                <View style={styles.commentBubble}>
                                    <Text style={styles.commentName}>{item.userId?.profile?.name || 'User'}</Text>
                                    <Text style={styles.commentText}>{item.content}</Text>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 20 }}>No comments yet. Be the first!</Text>}
                    />

                    <View style={styles.commentInputWrap}>
                        <TextInput
                            style={[styles.commentInput, { borderColor: themeColor }]}
                            placeholder="Write a comment..."
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                        />
                        <TouchableOpacity style={[styles.commentSendBtn, { backgroundColor: themeColor }]} onPress={submitComment} disabled={submittingComment || !commentText.trim()}>
                            {submittingComment ? (
                                <ActivityIndicator size="small" color={WHITE} />
                            ) : (
                                <Ionicons name="send" size={18} color={WHITE} />
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: WHITE },
    feedList: { paddingHorizontal: 14, paddingTop: 12 },

    createPostCard: { backgroundColor: WHITE, borderRadius: 16, marginBottom: 16, padding: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    createPostInput: { backgroundColor: '#F9F9F9', borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 60, fontSize: 15, color: '#1A1A1A', marginBottom: 12 },
    createPostActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    attachBtn: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: '#F0F0F0', borderRadius: 8 },
    attachText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },
    postSubmitBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999 },
    postSubmitText: { color: WHITE, fontSize: 14, fontWeight: '700' },
    previewWrap: { position: 'relative', marginBottom: 12, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', minHeight: 250 },
    mediaPreview: { width: '100%', height: '100%', minHeight: 250 },
    removeMediaBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: WHITE, borderRadius: 12, padding: 2 },

    card: { backgroundColor: WHITE, borderRadius: 16, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 8 },
    cardAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    cardNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    cardName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
    cardAction: { fontSize: 14, color: '#555', fontWeight: '400' },
    cardAmount: { fontSize: 14, color: PRIMARY_GREEN, marginTop: 2 },
    cardAmountBold: { fontWeight: '800', fontSize: 15 },
    cardTime: { fontSize: 12, color: '#BDBDBD', marginTop: 2 },
    dotsBtn: { padding: 4 },
    mediaContainer: { width: '100%', backgroundColor: '#000', minHeight: 300 },
    cardImage: { width: '100%', height: '100%', minHeight: 300 },
    cardText: { fontSize: 14, color: '#555', paddingHorizontal: 14, paddingBottom: 10, paddingTop: 10, lineHeight: 20 },
    reactionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F5F5F5', gap: 6 },
    reactBtn: { padding: 4, marginRight: 4 },
    likesRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 3 },
    likesCount: { fontSize: 13, color: '#9E9E9E' },
    bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 36, paddingTop: 12, backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    payBtnShadow: { width: '100%', borderRadius: 999, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
    payBtnWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
    payBtn: { width: '100%', paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
    payBtnText: { fontSize: 16, fontWeight: '800', color: WHITE, letterSpacing: 0.2 },

    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', backgroundColor: WHITE },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
    commentRow: { flexDirection: 'row', marginBottom: 16 },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    commentBubble: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 12, padding: 12 },
    commentName: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    commentText: { fontSize: 14, color: '#444', lineHeight: 20 },
    commentInputWrap: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: WHITE, alignItems: 'flex-end', paddingBottom: Platform.OS === 'ios' ? 30 : 16 },
    commentInput: { flex: 1, backgroundColor: '#F9F9F9', borderRadius: 18, borderWidth: 1.5, borderColor: PRIMARY_GREEN, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, minHeight: 46, maxHeight: 100, fontSize: 15, color: '#1A1A1A' },
    commentSendBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: PRIMARY_GREEN, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
});