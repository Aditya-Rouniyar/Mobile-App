import React, { useState, useEffect } from 'react';
import { Modal, TouchableOpacity, Image, View, Dimensions, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import * as MediaLibrary from 'expo-media-library';
import { Icon } from 'react-native-eva-icons';
import theme from '../constants/theme';
import { hp } from '../helpers/common';

const { width, height } = Dimensions.get('window');
const buttonSize = hp(3.6);
const ImageViewerModal = ({ visible, images, initialIndex = 0, onClose, uriOnly = false }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const translateX = useSharedValue(-width * initialIndex);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            translateX.value = -width * initialIndex;
        }
    }, [visible, initialIndex]);

    useEffect(() => {
        translateX.value = withSpring(-width * currentIndex);
    }, [currentIndex]);

    const downloadCurrentImage = async () => {
        try {
            const localUri = uriOnly ? images[currentIndex] : images[currentIndex]?.uri;
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Permission to access the media library is required to save images.');
                return;
            }
            await MediaLibrary.saveToLibraryAsync(localUri);
            Alert.alert('Downloaded', 'Image saved to your gallery!');
        } catch (error) {
            console.error('Error saving image:', error);
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    const swipeGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = -width * currentIndex + event.translationX;
        })
        .onEnd((event) => {
            const threshold = width / 3;
            let newIndex = currentIndex;
            if (event.translationX < -threshold && currentIndex < images.length - 1) {
                newIndex = currentIndex + 1;
            } else if (event.translationX > threshold && currentIndex > 0) {
                newIndex = currentIndex - 1;
            }
            runOnJS(setCurrentIndex)(newIndex);
            translateX.value = withSpring(-width * newIndex);
        });

    const tapGesture = Gesture.Tap()
        .maxDeltaX(10)
        .maxDeltaY(10)
        .onEnd(() => {
            runOnJS(onClose)();
        });

    const composedGesture = Gesture.Exclusive(tapGesture, swipeGesture);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={styles.container}>
                    <View style={styles.imageContainer}>
                        <GestureDetector gesture={composedGesture}>
                            <Animated.View
                                style={[
                                    { flexDirection: 'row', width: width * images.length, height: height },
                                    animatedStyle,
                                ]}
                            >
                                {Array.isArray(images) && images.map((img, index) => (
                                    <View key={index} style={styles.imageWrapper}>
                                        <Image source={{ uri: uriOnly ? img : img.uri }} style={styles.image} />
                                    </View>
                                ))}
                            </Animated.View>
                        </GestureDetector>
                    </View>

                    <TouchableOpacity onPress={downloadCurrentImage} style={styles.downloadButton}>
                        <Icon name="download-outline" width={20} height={20} fill="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Icon name="close-outline" width={20} height={20} fill="white" />
                    </TouchableOpacity>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    imageContainer: {
        width: width,
        height: height,
        overflow: 'hidden',
    },
    imageWrapper: {
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    closeButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: buttonSize,
        height: buttonSize,
        backgroundColor: 'grey',
        borderRadius: 100,
        position: 'absolute',
        top: 40,
        left: 20,
    },
    downloadButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: buttonSize,
        height: buttonSize,
        backgroundColor: 'grey',
        borderRadius: 100,
        position: 'absolute',
        top: 40,
        right: 20,
    },
});

export default ImageViewerModal;



