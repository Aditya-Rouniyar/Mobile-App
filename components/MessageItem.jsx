import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { wp, hp } from '../helpers/common';
import theme from '../constants/theme';
import { Image } from 'expo-image';
import Avatar from './Avatar';
import ImageViewerModal from './ImageViewerModal';

const profileImageSize = hp(5);
const fontSize = hp(2);
const bubbleWidth = wp(68);

const MessageItem = ({ message, currentUser, otherUser }) => {
    const isCurrentUser = currentUser?.userId === message?.senderId;
    const hasMedia = !!message?.mediaUrl;
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [images, setImages] = useState([]);

    // Use useEffect to set images once when message changes
    useEffect(() => {
        if (message?.mediaUrl) {
            setImages([message.mediaUrl]);
        }
    }, [message]);

    return (
        <View className={`flex-row ${isCurrentUser ? 'justify-end mr-5' : 'justify-start ml-5'} mb-6 gap-3 items-start`}>
            {!isCurrentUser && <Avatar size={profileImageSize} user={otherUser} />}
            
            <View style={{ maxWidth: bubbleWidth }}>
                <View
                    className={`flex rounded-3xl ${hasMedia ? '' : 'p-3 px-4'}`}
                    style={{ backgroundColor: hasMedia ? 'transparent' : (isCurrentUser ? theme.dark.colors.primary : theme.dark.colors.surface50) }}
                >
                    {hasMedia ? (
                        <TouchableOpacity onPress={() => setSelectedImageIndex(0)}>
                            <Image
                                source={{ uri: message.mediaUrl }}
                                style={{ width: wp(50), height: hp(25), borderRadius: 21 }}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>
                    ) : (
                        <Text style={{ fontSize: fontSize, color: 'white', flexWrap: 'wrap' }}>
                            {message?.content}
                        </Text>
                    )}
                </View>
            </View>

            {isCurrentUser && <Avatar size={profileImageSize} user={currentUser} />}
            
            {/* Image Viewer Modal */}
            <ImageViewerModal
                visible={selectedImageIndex !== null}
                images={images}
                initialIndex={selectedImageIndex}
                onClose={() => setSelectedImageIndex(null)}
                uriOnly={true}
            />
        </View>
    );
};

export default MessageItem;
