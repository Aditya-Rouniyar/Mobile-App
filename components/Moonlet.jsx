import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import RenderHtml from '@builder.io/react-native-render-html';
import { getAge, getGenderIcon, getTimeSincePost, hp, wp } from '@/helpers/common';
import theme from '@/constants/theme';
import Avatar from '@/components/Avatar';
import { Icon } from 'react-native-eva-icons';
import { Ionicons } from '@expo/vector-icons';
import ImageViewerModal from '@/components/ImageViewerModal';
import TagList from '@/components/TagList';
import CommentsBottomSheet from '@/components/CommentsBottomSheet'; // adjust path if needed
import { collection, doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Badge from '@/components/Badge'
const screenWidth = Dimensions.get('window').width;
const optionsIconSize = hp(3.2);
const maxTextLength = 76;

const Moonlet = ({ item, postUser, currentUser }) => {
    const [expanded, setExpanded] = useState(false);
    const isLongText = item.content.length > maxTextLength;
    const displayText = expanded ? item.content : `${item.content.slice(0, maxTextLength)}`;
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [images, setImages] = useState([]);
    const [commentsCount, setCommentsCount] = useState(0);
    const commentsSheetRef = useRef(null);
    const [likes, setLikes] = useState(0);
    const [liked, setLiked] = useState(false);

    const MemoizedRenderHtml = React.memo(({ content }) => {
        return (
            <RenderHtml
                contentWidth={wp(0)}
                source={{ html: displayText }}
                baseStyle={{ color: 'white', fontSize: 16 }}
            />
        );
    });

    const toggleLike = async () => {
        const likeRef = doc(db, 'posts', item.id, 'likes', currentUser.userId);

        if (liked) {
            // Unlike: Remove like document
            await deleteDoc(likeRef);
        } else {
            // Like: Add like document
            await setDoc(likeRef, {
                userId: currentUser.userId,
                timestamp: serverTimestamp(),
            });
        }
    };

    useEffect(() => {
        if (!item.id || !currentUser?.userId) return;

        const likesRef = collection(db, 'posts', item.id, 'likes');

        const unsubscribe = onSnapshot(likesRef, (snapshot) => {
            setLikes(snapshot.size);
            setLiked(snapshot.docs.some(doc => doc.id === currentUser.userId));
        });

        return () => unsubscribe();
    }, [item.id, currentUser?.userId]);

    useEffect(() => {
        if (item.images && item.images.length > 0) {
            const sortedImages = [...item.images].sort((a, b) => {
                const numA = parseInt(a.match(/_(\d+)(?=\.[^.]+$)/)?.[1] || 0, 10);
                const numB = parseInt(b.match(/_(\d+)(?=\.[^.]+$)/)?.[1] || 0, 10);
                return numA - numB;
            });
            if (JSON.stringify(sortedImages) !== JSON.stringify(images)) {
                setImages(sortedImages);
            }
        }
    }, [item.images]);

    const renderImages = () => {
        if (!images || images.length === 0) return null;

        if (images.length === 1) {
            return (
                <TouchableOpacity onPress={() => setSelectedImageIndex(0)}>
                    <Image source={{ uri: images[0] }} style={styles.singleImage} />
                </TouchableOpacity>
            );
        }
        return (
            <FlatList
                data={images}
                numColumns={3}
                keyExtractor={(img, index) => index.toString()}
                contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
                columnWrapperStyle={{ justifyContent: 'flex-start' }}
                renderItem={({ item: imgSrc, index }) => (
                    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
                        <Image source={{ uri: imgSrc }} style={styles.gridImage} />
                    </TouchableOpacity>
                )}
            />
        );
    };

    return (
        <>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Avatar user={postUser} style={styles.avatar} size={hp(6)} />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{postUser?.name || 'User Deleted'}</Text>
                        <View style={styles.infoRow}>
                            <Badge image={getGenderIcon(postUser?.gender)} text={getAge(postUser?.dateOfBirth)} />
                        </View>
                    </View>
                    <TouchableOpacity>
                        <Icon fill={'white'} width={optionsIconSize} height={optionsIconSize} name='more-horizontal-outline' />
                    </TouchableOpacity>
                </View>
                {/* Post Body */}
                <View style={{ paddingTop: 10 }}>
                    <MemoizedRenderHtml content={displayText} />
                    {isLongText && (
                        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                            <Text style={styles.moreText}>{expanded ? 'Show Less' : '...more'}</Text>
                        </TouchableOpacity>
                    )}
                    {renderImages()}
                </View>
                {item.tags && (
                    <TagList allowEdit={false} tags={item.tags} tagStyle={{ paddingVertical: 2, paddingHorizontal: 8, fontSize: 2 }} />
                )}

                {/* Footer */}
                <View className='flex-row items-center gap-6 mt-3 mb-3'>
                    <View style={styles.footerButton}>
                        <TouchableOpacity onPress={toggleLike}>
                            <Ionicons
                                name={liked ? "heart" : "heart-outline"}
                                size={hp(3)}
                                color={liked ? "red" : "white"}
                            />
                        </TouchableOpacity>
                        <Text style={styles.countText}>{likes}</Text>
                    </View>
                    <View style={styles.footerButton}>
                        <TouchableOpacity onPress={() => {
                            commentsSheetRef.current?.present();
                        }}>
                            <View style={{ transform: [{ rotateY: '180deg' }] }}>
                                <Ionicons name="chatbubble-ellipses-outline" size={hp(2.68)} color={'white'} />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.countText}>{commentsCount}</Text>
                    </View>
                </View>

                {/* Bottom part */}
                <View className='ml-2'>
                    {item.location && (
                        <View style={{ marginLeft: -5, paddingTop: 10, flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginBottom: 6 }}>
                            <Ionicons name="location-outline" size={20} color={'white'} />
                            <Text className='text-neutral-300'>{item.location.name}</Text>
                        </View>
                    )}
                    <Text className='text-neutral-600' style={{ alignSelf: 'flex-start' }}>{getTimeSincePost(item.createdAt)}</Text>
                </View>
                <ImageViewerModal
                    visible={selectedImageIndex !== null}
                    images={images}
                    initialIndex={selectedImageIndex}
                    onClose={() => setSelectedImageIndex(null)}
                    uriOnly={true}
                />
            </View>

            {/* Comments Bottom Sheet */}
            <CommentsBottomSheet ref={commentsSheetRef} postId={item.id} currentUserId={currentUser.userId} onCommentCountUpdated={setCommentsCount} />
        </>
    );
};

const styles = StyleSheet.create({
    footerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    countText: {
        fontSize: hp(2),
        color: "white",
        fontWeight: theme.dark.typography.semiBold,
    },
    container: {
        borderRadius: theme.radius.xxl,
        padding: 15,
        marginBottom: 15,
        borderBottomColor: theme.dark.colors.surface30,
        borderBottomWidth: 0.3,
        backgroundColor: theme.dark.colors.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: '#FFFFFF',
        fontSize: hp(2),
        fontWeight: 'bold',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        gap: 8,
    },
    moreText: {
        color: 'lightblue',
        marginTop: 5,
    },
    singleImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        marginTop: 10,
    },
    gridImage: {
        width: screenWidth / 3 - 23,
        height: screenWidth / 3 - 23,
        margin: 5,
        borderRadius: 10,
    },
});

export default Moonlet;
