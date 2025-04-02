import React, { useEffect } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';
import { useAuth } from "../context/authContext";
import { useRouter } from 'expo-router';

import Moonlet from '@/components/Moonlet';
import Button from './Button';
import { wp } from '../helpers/common';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const MoonletModal = ({ visible, onClose, item, postUser, currentUser }) => {
    if (!item) return null;

    const { createChatRoom } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (visible) {
            // Additional logic if needed when modal opens
        }
    }, [visible]);

    const openChatRoom = (item) => {
        const safeData = {
            ...item,
            url: encodeURIComponent(item.profileImageUrl)
        };
        let data = encodeURIComponent(JSON.stringify(safeData));
        router.push({ pathname: '/pages/chatRoom', params: { item: data } });
        onClose();
    }

    const handleLeapPress = async () => {
        console.log('user', postUser);
        let chatRoomId = await createChatRoom(postUser.userId);

        const chatroomData = {
            id: chatRoomId,
            otherUser: postUser,
        };
        await openChatRoom(chatroomData);
    };

    return (
        <View style={styles.overlay}>
            <MotiView
                from={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'timing', duration: 500, easing: Easing.out(Easing.exp) }}
                style={styles.modalContainer}
            >
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Moonlet item={item} postUser={postUser} currentUser={currentUser} />
                <View className='px-2'>
                    <Button onPress={handleLeapPress} title='Leap 👋'></Button>
                </View>
            </MotiView>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: screenWidth * 0.96,
        maxHeight: screenHeight * 0.96,
        paddingHorizontal: wp(1),
        borderRadius: 20,
        paddingTop: 60,
        paddingBottom: 100,
        alignSelf: 'center', // Prevents stretching
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    },
});

export default MoonletModal;
