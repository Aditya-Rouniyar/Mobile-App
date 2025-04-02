import React, { useRef, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop,
    BottomSheetView
} from '@gorhom/bottom-sheet';
import Button from './Button';
import theme from '../constants/theme';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const UploadImageBottomSheet = React.forwardRef((props, ref) => {
    // Define snap points for the bottom sheet
    const snapPoints = useMemo(() => ['25%'], []);
    const [image, setImage] = useState(null); // State without type annotation
    const { onImageSelected } = props;  // Accept the callback

    // State to handle permission status
    const [cameraPermission, setCameraPermission] = useState(false);
    const [galleryPermission, setGalleryPermission] = useState(false);

    useEffect(() => {
        // Request camera and gallery permissions on mount
        const requestPermissions = async () => {
            const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
            const galleryResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setCameraPermission(cameraResult.granted);
            setGalleryPermission(galleryResult.granted);
        };

        requestPermissions();
    }, []);

    const pickImage = async () => {
        if (!galleryPermission) {
            alert('You need to grant permission to access the photo gallery');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(result.assets[0].uri,
                [], // no actions (e.g. no resize or crop)
                { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
            );

            setImage(manipResult.uri);
            onImageSelected(manipResult.uri);
            ref.current?.dismiss();
        }
    };

    const takePicture = async () => {
        if (!cameraPermission) {
            alert('You need to grant permission to access the camera');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(result.assets[0].uri,
                [], // no actions (e.g. no resize or crop)
                { format: ImageManipulator.SaveFormat.JPEG }
            );

            setImage(manipResult.uri);
            onImageSelected(manipResult.uri);
            ref.current?.dismiss();
        }
    };

    return (
        <BottomSheetModal
            handleIndicatorStyle={{ backgroundColor: 'white' }}
            ref={ref}
            index={0}
            snapPoints={snapPoints}
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
            backgroundStyle={{ backgroundColor: theme.dark.colors.surface20 }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Button
                    buttonColor='transparent'
                    iconName='camera'
                    title="Camera"
                    onPress={takePicture}
                    shadowOppacity={0.1}
                />
                <Button
                    buttonColor='transparent'
                    iconName='image'
                    title="Choose from Album"
                    onPress={pickImage}
                    shadowOppacity={0.1}
                />
                <Button
                    buttonColor='transparent'
                    title="Cancel"
                    onPress={() => {
                        console.log('Cancel Pressed');
                        ref.current?.dismiss();
                    }}
                    shadowOppacity={0.1}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-around',
    },
});

export default UploadImageBottomSheet;
