import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Dimensions
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetView,
    BottomSheetFooter,
    BottomSheetTextInput
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
    collection,
    doc,
    getDoc,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import theme from '@/constants/theme';
import { getGenderIcon, getTimeSince, hp, wp } from '@/helpers/common';
import { Icon } from 'react-native-eva-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setDoc, deleteDoc } from 'firebase/firestore';

// If a comment has fewer than NUM_AUTO_SHOW_REPLIES, auto-show its replies.
const NUM_AUTO_SHOW_REPLIES = 2;

const CommentsBottomSheet = React.forwardRef(({ postId, currentUserId, onCommentCountUpdated }, ref) => {
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = Dimensions.get('window');

    // Adjust the snap point so the handle isn’t occluded.
    const snapPoints = useMemo(() => ["70%", "100%"], [insets.top]);
    const [extraPadding, setExtraPadding] = useState(100);
    const [comments, setComments] = useState([]);
    const [userCache, setUserCache] = useState({});
    const inputRef = useRef(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [repliesMap, setRepliesMap] = useState({});
    const [visibleReplies, setVisibleReplies] = useState({});
    const replySubscriptions = useRef({});
    const sendIconSize = hp(2.7);
    const [likeMap, setLikeMap] = useState({}); // {commentId: likeCount}
    const [likedComments, setLikedComments] = useState({}); // {commentId: true/false}
    const [replyLikeMap, setReplyLikeMap] = useState({}); // {replyId: likeCount}
    const [likedReplies, setLikedReplies] = useState({}); // {replyId: true/false}


    const handleSheetChange = (index) => {
        if (index === 0) {
            setExtraPadding(insets.bottom + 300);
        } else {
            setExtraPadding(insets.bottom + 60);
        }
    };

    // Listen to comments on the post.
    useEffect(() => {
        if (!postId) return;
        const commentsRef = collection(db, 'posts', postId, 'comments');
        const q = query(commentsRef, orderBy('timestamp', 'asc'));
        const unsubscribe = onSnapshot(q, snapshot => {
            const commentsData = snapshot.docs.map(docSnap => ({
                id: docSnap.id,
                ...docSnap.data()
            }));
            setComments(commentsData);
            commentsData.forEach(comment => {
                if (!userCache[comment.userId]) {
                    fetchUser(comment.userId);
                }
            });
        });
        return () => unsubscribe();
    }, [postId, userCache]);

    {/* For Likes */ }
    useEffect(() => {
        if (!postId) return;

        const commentsRef = collection(db, 'posts', postId, 'comments');

        // Subscribe to each comment's likes and its replies' likes
        const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
            snapshot.docs.forEach(commentDoc => {
                const commentId = commentDoc.id;
                const commentLikesRef = collection(db, 'posts', postId, 'comments', commentId, 'likes');

                // Listen for likes on comments
                onSnapshot(commentLikesRef, (likesSnapshot) => {
                    setLikeMap(prev => ({ ...prev, [commentId]: likesSnapshot.size }));
                    setLikedComments(prev => ({ ...prev, [commentId]: likesSnapshot.docs.some(doc => doc.id === currentUserId) }));
                });

                // Listen for replies' likes
                const repliesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies');

                onSnapshot(repliesRef, (repliesSnapshot) => {
                    repliesSnapshot.docs.forEach(replyDoc => {
                        const replyId = replyDoc.id;
                        const replyLikesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies', replyId, 'likes');

                        onSnapshot(replyLikesRef, (replyLikesSnapshot) => {
                            setReplyLikeMap(prev => ({ ...prev, [replyId]: replyLikesSnapshot.size }));
                            setLikedReplies(prev => ({ ...prev, [replyId]: replyLikesSnapshot.docs.some(doc => doc.id === currentUserId) }));
                        });
                    });
                });
            });
        });

        return () => unsubscribe();
    }, [postId, currentUserId]);

    // For each comment, subscribe to its replies.
    useEffect(() => {
        comments.forEach(comment => {
            if (!replySubscriptions.current[comment.id]) {
                const repliesRef = collection(db, 'posts', postId, 'comments', comment.id, 'replies');
                const q = query(repliesRef, orderBy('timestamp', 'asc'));
                const unsubscribeReplies = onSnapshot(q, snapshot => {
                    const repliesData = snapshot.docs.map(docSnap => ({
                        id: docSnap.id,
                        ...docSnap.data()
                    }));
                    setRepliesMap(prev => ({ ...prev, [comment.id]: repliesData }));
                    // If the number of replies is less than NUM_AUTO_SHOW_REPLIES,
                    // automatically show them; otherwise, default to hidden.
                    if (repliesData.length < NUM_AUTO_SHOW_REPLIES) {
                        setVisibleReplies(prev => ({ ...prev, [comment.id]: true }));
                    } else {
                        setVisibleReplies(prev => {
                            if (prev[comment.id] === undefined) {
                                return { ...prev, [comment.id]: false };
                            }
                            return prev;
                        });
                    }
                    // Also, fetch user data for each reply.
                    repliesData.forEach(reply => {
                        if (!userCache[reply.userId]) {
                            fetchUser(reply.userId);
                        }
                    });
                });
                replySubscriptions.current[comment.id] = unsubscribeReplies;
            }
        });
        // Clean up subscriptions for comments that no longer exist.
        return () => {
            Object.keys(replySubscriptions.current).forEach(commentId => {
                const exists = comments.some(comment => comment.id === commentId);
                if (!exists) {
                    replySubscriptions.current[commentId]();
                    delete replySubscriptions.current[commentId];
                }
            });
        };
    }, [comments, postId, userCache]);

    const toggleLike = async (commentId, replyId = null) => {
        let likeRef;

        if (replyId) {
            likeRef = doc(db, 'posts', postId, 'comments', commentId, 'replies', replyId, 'likes', currentUserId);
            if (likedReplies[replyId]) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, {
                    userId: currentUserId,
                    timestamp: serverTimestamp(),
                });
            }
        } else {
            likeRef = doc(db, 'posts', postId, 'comments', commentId, 'likes', currentUserId);
            if (likedComments[commentId]) {
                await deleteDoc(likeRef);
            } else {
                await setDoc(likeRef, {
                    userId: currentUserId,
                    timestamp: serverTimestamp(),
                });
            }
        }
    };

    // Fetch a user's data and cache it.
    const fetchUser = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setUserCache(prev => ({ ...prev, [userId]: userDoc.data() }));
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    useEffect(() => {
        let totalReplies = 0;

        // Count all replies in `repliesMap`
        Object.values(repliesMap).forEach(replies => {
            totalReplies += replies.length;
        });

        // Send the updated count to the parent
        onCommentCountUpdated(comments.length + totalReplies);
    }, [comments, repliesMap]);

    const handlePostComment = async (text) => {
        if (text.trim() === '') return;
        try {
            const commentsRef = collection(db, 'posts', postId, 'comments');
            await addDoc(commentsRef, {
                text,
                userId: currentUserId,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const handlePostReply = async (commentId, text) => {
        if (text.trim() === '') return;
        try {
            const replyData = {
                text,
                userId: currentUserId,
                timestamp: serverTimestamp()
            };
            const repliesRef = collection(db, 'posts', postId, 'comments', commentId, 'replies');
            await addDoc(repliesRef, replyData);
        } catch (error) {
            console.error('Error posting reply:', error);
        }
    };

    const handleSend = async () => {
        const text = inputRef.current?.value;
        if (!text || !text.trim()) return;

        if (replyingTo) {
            await handlePostReply(replyingTo, text);
            setReplyingTo(null);
        } else {
            await handlePostComment(text);
        }
        if (inputRef.current) inputRef.current.clear();
    };

    const initiateReply = (commentId) => {
        setReplyingTo(commentId);
    };

    useEffect(() => {
        if (replyingTo) {
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            });
        }
    }, [replyingTo]);

    // For comments with NUM_AUTO_SHOW_REPLIES or more, allow toggling.
    const toggleReplies = (commentId) => {
        setVisibleReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    // Footer component including both the reply indicator and the input.
    const InputFooter = useCallback(
        ({ animatedFooterPosition }) => (
            <BottomSheetFooter animatedFooterPosition={animatedFooterPosition}>
                {replyingTo && (
                    <View style={styles.replyIndicator}>
                        <Text style={styles.replyIndicatorText}>
                            Replying to {userCache[comments.find(c => c.id === replyingTo)?.userId]?.name || 'Unknown'}
                        </Text>
                        <TouchableOpacity onPress={() => setReplyingTo(null)}>
                            <Ionicons name="close" size={16} color="grey" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={{ marginBottom: hp(3.8) }}>
                    <View style={styles.inputInnerContainer}>
                        <View style={styles.inputBox}>
                            <BottomSheetTextInput
                                style={styles.inputText}
                                placeholderTextColor="gray"
                                ref={inputRef}
                                placeholder={replyingTo ? 'Reply...' : 'Add a comment...'}
                                onChangeText={(text) => (inputRef.current.value = text)}
                                onSubmitEditing={handleSend}
                                returnKeyType="send"
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                <Icon name="paper-plane-outline" width={sendIconSize} height={sendIconSize} fill="white" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BottomSheetFooter>
        ),
        [handleSend, replyingTo, sendIconSize, userCache, comments]
    );

    return (
        <BottomSheetModal
            handleIndicatorStyle={{ backgroundColor: 'white' }}
            enableDynamicSizing={false}
            onChange={handleSheetChange}
            ref={ref}
            index={0}
            snapPoints={snapPoints}
            topInset={insets.top}
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    opacity={0.5}  // Adjust opacity for dimming effect
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    pressBehavior="close" // Closes on background tap
                />
            )}
            dismissOnBackdropPress={true} // Enables dismissal on backdrop click
            backgroundStyle={{ backgroundColor: theme.dark.colors.modal }}
            footerComponent={InputFooter}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <BottomSheetView style={styles.container}>
                <Text style={{ fontWeight: 'bold', color: '#fff', alignSelf: 'center', fontSize: hp(2), paddingBottom: hp(1)}}>Comments</Text>
                <FlatList
                    scrollIndicatorInsets={{ right: 0 }}
                    contentContainerStyle={{ paddingBottom: extraPadding, padding: 16 }}
                    data={comments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const user = userCache[item.userId];
                        const repliesCount = repliesMap[item.id]?.length || 0;

                        return (
                            <View style={styles.commentContainer}>
                                <Image source={{ uri: user?.profileImageUrl }} style={styles.avatar} />
                                <View style={styles.commentContent}>
                                    <View className="flex-row gap-1 items-center">
                                        <Text style={styles.userName}>{user?.name || 'Unknown'}</Text>
                                        <Image source={getGenderIcon(user?.gender)} style={{ height: 12, width: 12 }} />
                                        <Text style={styles.timestamp}>{getTimeSince(item.timestamp)}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
                                        <Ionicons
                                            name={likedComments[item.id] ? "heart" : "heart-outline"}
                                            size={18}
                                            color={likedComments[item.id] ? "red" : "grey"}
                                        />
                                        <Text style={styles.likeCount}>{likeMap[item.id] || 0}</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.commentText}>{item.text}</Text>

                                    {/* Like Button & Count for Comment */}
                                    <View style={styles.commentActions}>
                                        <TouchableOpacity onPress={() => initiateReply(item.id)}>
                                            <Text style={styles.actionText}>Reply</Text>
                                        </TouchableOpacity>

                                        {repliesMap[item.id] && repliesCount >= NUM_AUTO_SHOW_REPLIES && (
                                            <TouchableOpacity onPress={() => toggleReplies(item.id)}>
                                                <Text style={styles.actionText}>
                                                    {visibleReplies[item.id] ? 'Hide Replies' : `View ${repliesCount} replies`}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Replies */}
                                    {visibleReplies[item.id] && repliesMap[item.id] && (
                                        <View style={styles.repliesContainer}>
                                            {repliesMap[item.id].map(reply => {
                                                const replyUser = userCache[reply.userId];
                                                return (
                                                    <View key={reply.id} style={styles.replyContainer}>
                                                        <Image source={{ uri: replyUser?.profileImageUrl }} style={styles.replyAvatar} />
                                                        <View style={styles.replyContent}>
                                                            <View className='flex-row gap-1 items-center'>
                                                                <Text style={styles.userName}>{replyUser?.name || 'Unknown'}</Text>
                                                                <Image source={getGenderIcon(replyUser?.gender)} style={{ height: 12, width: 12 }} />
                                                                <Text style={styles.timestamp}>{getTimeSince(item.timestamp)}</Text>
                                                            </View>
                                                            <TouchableOpacity onPress={() => toggleLike(item.id, reply.id)} style={styles.likeButton}>
                                                                <Ionicons
                                                                    name={likedReplies[reply.id] ? "heart" : "heart-outline"}
                                                                    size={18}
                                                                    color={likedReplies[reply.id] ? "red" : "grey"}
                                                                />
                                                                <Text style={styles.likeCount}>{replyLikeMap[reply.id] || 0}</Text>
                                                            </TouchableOpacity>
                                                            <Text style={styles.commentText}>{reply.text}</Text>
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No comments yet</Text>}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    commentContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        position: 'relative',
    },
    commentContent: {
        flex: 1,
        marginLeft: 8,
    },
    likeButton: {
        position: 'absolute',
        right: 0,
        top: hp(1.8),
        justifyContent: 'center',
        gap: 3,
    },
    likeCount: {
        color: 'grey',
        alignSelf: 'center',
        fontWeight: theme.dark.typography.semiBold,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },

    container: { flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    timestamp: { color: 'grey' },
    userName: { fontWeight: 'bold', color: '#fff' },
    commentText: { color: '#fff', marginVertical: 4, maxWidth: "86%" },
    commentActions: { flexDirection: 'row', marginTop: 4 },
    actionText: { color: 'grey', fontWeight: theme.dark.typography.semiBold, marginRight: 12 },
    repliesContainer: { marginTop: 8 },
    replyContainer: { flexDirection: 'row', marginBottom: 8, position: 'relative' },
    replyAvatar: { width: 30, height: 30, borderRadius: 15 },
    replyContent: { marginLeft: 8, flex: 1, alignSelf: 'stretch' },
    replyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.dark.colors.surface,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginHorizontal: 12,
        borderRadius: 20,
        marginBottom: 8
    },
    replyIndicatorText: {
        color: 'grey',
        fontSize: hp(1.6),
        flex: 1
    },
    inputInnerContainer: { marginHorizontal: 10 },
    inputBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 0.6,
        borderColor: theme.dark.colors.surface60,
        backgroundColor: theme.dark.colors.modal,
        padding: 8,
        borderRadius: 50,
        shadowColor: theme.dark.colors.accent,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
    },
    inputText: {
        flex: 1,
        fontSize: hp(2),
        color: '#fff',
        paddingHorizontal: 16,
    },
    sendButton: {
        backgroundColor: theme.dark.colors.primary,
        padding: 8,
        borderRadius: 50,
    },
    emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 }
});

export default CommentsBottomSheet;
