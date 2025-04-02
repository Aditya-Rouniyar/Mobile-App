import {
    Alert,
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ScreenWrapper from '../../components/ScreenWrapper';
import theme from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import BackButton from '../../components/BackButton';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import RichTextEditor from '../../components/RichTextEditor';
import { Ionicons } from '@expo/vector-icons';
import ImageViewerModal from '../../components/ImageViewerModal';
import { Icon } from 'react-native-eva-icons';
// Import useNavigation from React Navigation
import { useNavigation } from '@react-navigation/native';
import TagList from '../../components/TagList';
import TagSelectorBottomSheet from '../../components/TagSelector'
import { PREDEFINED_POST_HASHTAGS } from "../../constants/tags";
import LocationPickerBottomSheet from '../../components/LocationPickerBottomSheet';
import { useAuth } from "../../context/authContext";
import * as ImageManipulator from 'expo-image-manipulator';
import { Keyboard } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

const toolBarIconSize = 28;
const toolBarIconColor = 'white';

const CreatePost = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const bodyRef = useRef("");
    const editorRef = useRef(null);
    const [images, setImages] = useState([]);
    // Track if there are unsaved changes (dirty state)
    const [isDirty, setIsDirty] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Tag Selector Modal
    const tagSelectorRef = useRef(null);
    const [selectedTags, setSelectedTags] = useState([]);

    // Location Ref
    const locationPickerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const { createPost } = useAuth();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // Update "dirty" state whenever the text or images change.
    // (For text, we update the dirty flag in the onChange callback of the editor.)
    useEffect(() => {
        setIsDirty(bodyRef.current !== "" || images.length > 0);
    }, [images]);

    // Disable swipe gestures when there are unsaved changes.
    useEffect(() => {
        navigation.setOptions({ gestureEnabled: !isDirty });
    }, [navigation, isDirty]);

    // Return to previous page after uploading successfully
    useEffect(() => {
        if (uploadSuccess) {
            router.back();
        }
    }, [uploadSuccess]);

    // Add beforeRemove listener to warn about unsaved changes (back button)
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            if (!isDirty || uploadSuccess) return; // No unsaved changes, allow navigation
            // Prevent default behavior (leaving the screen)
            e.preventDefault();

            // Show confirmation alert
            Alert.alert(
                "Discard changes?",
                "If you go back now, you will lose your current changes. Are you sure you want to continue?",
                [
                    { text: "Cancel", style: "cancel", onPress: () => { } },
                    {
                        text: "Discard",
                        style: "destructive",
                        onPress: () => {
                            // Remove the listener and navigate back
                            unsubscribe();
                            navigation.dispatch(e.data.action);
                        },
                    },
                ]
            );
        });

        return unsubscribe;
    }, [navigation, isDirty, uploadSuccess]);

    // Function to open image picker
    const pickImage = async () => {
        const available = 9 - images.length;
        if (available <= 0) return;

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.Images,
            allowsMultipleSelection: true,
            selectionLimit: available,
            quality: 1,
        });

        if (!result.canceled) {
            const compressedImages = await Promise.all(
                result.assets.map(async (asset) => {
                    const manipResult = await ImageManipulator.manipulateAsync(
                        asset.uri,
                        [], // No resize or cropping actions
                        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG } // 75% compression
                    );
                    return { uri: manipResult.uri };
                })
            );

            setImages(prev => [...prev, ...compressedImages]);
        }
    };

    const handleCreatePost = async () => {
        if (isUploading) return;
        if (!bodyRef.current.trim() && images.length === 0) {
            Alert.alert("Error", "Your post cannot be empty.");
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);

        try {
            await createPost(bodyRef.current, images.map(img => img.uri), selectedTags, selectedLocation, (progress) => setUploadProgress(progress));
            setUploadSuccess(true);
        } catch (error) {
            console.error("Failed to create post:", error);
            Alert.alert("Error", "Failed to create post. Please try again.");
        }
    };

    // Function to remove an image
    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };

    return (
        <ScreenWrapper bg={theme.dark.colors.surface}>
            <View style={{ flex: 1 }}>
                {/* Overlay view for upload progress */}
                {uploadProgress > 0 && uploadProgress < 1 && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: theme.dark.colors.surface,
                        alignItems: 'center',
                        elevation: 5,
                        zIndex: 1000,
                    }}>
                        <Text style={{
                            color: 'white',
                            fontSize: 20,
                            fontWeight: '600',
                            marginBottom: 10,
                        }}>
                            Launching Moonlet...
                        </Text>
                        <ProgressBar
                            progress={uploadProgress}
                            width={Dimensions.get('window').width}
                            color={theme.dark.colors.primary}
                            borderWidth={0}
                            unfilledColor={'rgba(255,255,255,0.2)'}
                        />
                    </View>
                )}
                {/* Main content container */}
                <View style={{ flex: 1, marginBottom: hp(8), paddingHorizontal: wp(3), gap: 15 }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                        <View style={{ position: 'absolute', left: 0 }}>
                            <BackButton router={router} />
                        </View>
                        <Text style={{ color: 'white', fontSize: hp(2.7), fontWeight: 'bold' }}>
                            New Moonlet
                        </Text>
                        <Ionicons name='planet' color='white' size={18}></Ionicons>
                        <View style={{ position: 'absolute', right: 0 }}>
                            <Button
                                enabled={!isUploading}
                                onPress={handleCreatePost}
                                shadowOppacity={0.3}
                                title="Post"
                                buttonStyle={{ height: hp(3.8), paddingHorizontal: wp(3) }}
                                textStyle={{
                                    fontWeight: theme.dark.typography.small,
                                    fontSize: hp(2),
                                }}
                            />
                        </View>
                    </View>

                    {/* Main Content */}
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag">
                        <View style={{ flexGrow: 1 }}>
                            <RichTextEditor
                                editorRef={editorRef}
                                onChange={body => {
                                    bodyRef.current = body;
                                    setIsDirty(body !== "" || images.length > 0);
                                }}
                            />

                            {/* Grid Display Using ScrollView */}
                            <ScrollView
                                horizontal={true}
                                automaticallyAdjustContentInsets={false}
                                directionalLockEnabled={true}
                                style={{ alignSelf: 'flex-start' }}
                                contentContainerStyle={{
                                    flexDirection: 'row',
                                    flexWrap: 'nowrap',
                                    justifyContent: 'flex-start',
                                    paddingVertical: 10,
                                }}
                            >
                                {images.map((item, index) => (
                                    <TouchableOpacity key={index} onPress={() => setSelectedImageIndex(index)}>
                                        <View style={{ position: 'relative', margin: 5 }}>
                                            <Image
                                                source={{ uri: item.uri }}
                                                style={{
                                                    width: wp(28),
                                                    height: wp(28),
                                                    borderRadius: 10,
                                                }}
                                            />
                                            <TouchableOpacity
                                                onPress={() => removeImage(index)}
                                                style={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    right: 5,
                                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                                    borderRadius: 15,
                                                    width: 25,
                                                    height: 25,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Ionicons name="close" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </ScrollView>
                </View>

                {/* Image Viewer Modal */}
                <ImageViewerModal
                    visible={selectedImageIndex !== null}
                    images={images}
                    initialIndex={selectedImageIndex}
                    onClose={() => setSelectedImageIndex(null)}
                />

                {/* tag selector modal */}
                <TagSelectorBottomSheet
                    ref={tagSelectorRef}
                    predefinedTags={PREDEFINED_POST_HASHTAGS}
                    selectedTags={selectedTags}
                    setSelectedTags={setSelectedTags}
                />

                {/* Bottom Taskbar */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={hp(6)}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                >
                    {selectedLocation && (
                        <View className='flex-row px-2 items-start'>
                            <View
                                style={[
                                    {
                                        borderRadius: 20,
                                        paddingVertical: 5,
                                        paddingHorizontal: 15,
                                        backgroundColor: theme.dark.colors.surface10,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 6,
                                    },
                                ]}
                            >
                                <Ionicons name='location-outline' color={'white'} size={16}></Ionicons>
                                <Text style={{ color: 'white' }}>{selectedLocation?.name}</Text>
                                <TouchableOpacity onPress={() => setSelectedLocation(null)} style={{ marginLeft: 5 }}>
                                    <Ionicons name="close-circle" size={18} color='gainsboro' />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View className='flex-row px-2'>
                        <TagList allowEdit={true} tags={selectedTags} onTagRemoved={(tag) => setSelectedTags((prevTags) => prevTags.filter(t => t !== tag))} ></TagList>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingVertical: hp(1),
                            paddingHorizontal: hp(2),
                            borderTopColor: theme.dark.colors.surface10,
                            borderTopWidth: 0.6,
                            backgroundColor: theme.dark.colors.surface,
                        }}
                    >
                        <View style={{ flexDirection: 'row', marginBottom: 5, gap: 10 }}>
                            {/* Image Icon Button */}
                            <TouchableOpacity
                                onPress={images.length < 9 ? pickImage : undefined}
                                disabled={images.length >= 9}
                                style={{
                                    padding: 10,
                                    opacity: images.length >= 9 ? 0.5 : 1,
                                }}
                            >
                                <Icon name="image-outline" width={toolBarIconSize} height={toolBarIconSize} fill={toolBarIconColor} />
                            </TouchableOpacity>

                            {/* Hashtag Button */}
                            <TouchableOpacity
                                onPress={selectedTags.length < 5 ? () => tagSelectorRef.current?.present() : undefined}
                                disabled={selectedTags.length >= 5}
                                style={{
                                    padding: 10,
                                    opacity: selectedTags.length >= 5 ? 0.5 : 1,
                                }}>
                                <Icon name="hash-outline" width={toolBarIconSize} height={toolBarIconSize} fill={toolBarIconColor} />
                            </TouchableOpacity>

                            {/* Location Button */}
                            <TouchableOpacity onPress={() => {
                                editorRef.current.dismissKeyboard();
                                Keyboard.dismiss();
                                locationPickerRef.current?.present();
                            }} style={{ padding: 10 }}>
                                <Ionicons name="location-outline" size={toolBarIconSize} color={toolBarIconColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                <LocationPickerBottomSheet
                    ref={locationPickerRef}
                    onLocationSelected={setSelectedLocation}
                />
            </View >
        </ScreenWrapper >
    );
};

export default CreatePost;
