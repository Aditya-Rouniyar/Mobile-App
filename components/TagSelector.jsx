import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Icon } from 'react-native-eva-icons';
import { hp } from '../helpers/common';
import theme from '../constants/theme';
import { BAD_WORDS } from "../constants/tags";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Hash_Icon_Size = hp(2.2);

const validateTag = (tag) => {
    if (!tag || tag.length < 1) {
        return "Tag must be at least 1 character.";
    }
    if (tag.length > 28) {
        return "Tag cannot exceed 30 characters.";
    }
    if (BAD_WORDS.includes(tag.toLowerCase())) {
        return "Inappropriate tag.";
    }
    if (!/^[\p{L}\p{N}\p{Emoji}]+$/u.test(tag)) {
        return "Tags can only contain letters, numbers, and emojis.";
    }
    return null;
};

const TagSelectorBottomSheet = React.forwardRef(({ predefinedTags, selectedTags, setSelectedTags, maxTags = 5 }, ref) => {
    const [customTag, setCustomTag] = useState("");
    const insets = useSafeAreaInsets();

    const toggleTag = (tag) => {
        setSelectedTags((prev) => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else if (prev.length < maxTags) {
                return [...prev, tag];
            }
            return prev;
        });
        ref.current?.dismiss();
    };

    const addCustomTag = () => {
        const validationError = validateTag(customTag);
        if (validationError) {
            Alert.alert("Invalid Tag", validationError);
            return;
        }
        if (!predefinedTags.includes(customTag) && !selectedTags.includes(customTag)) {
            setSelectedTags([...selectedTags, customTag]);
        }
        setCustomTag("");
        ref.current?.dismiss();
    };

    const filteredTags = predefinedTags.filter(tag =>
        tag.toLowerCase().includes(customTag.toLowerCase())
    );

    const exactMatch = predefinedTags.some(tag => tag.toLowerCase() === customTag.toLowerCase());

    return (
        <BottomSheetModal
            handleIndicatorStyle={{ backgroundColor: 'white' }}
            ref={ref}
            topInset={insets.top}
            enableDynamicSizing={false}
            snapPoints={['75%']}
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    opacity={0.5}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    pressBehavior="close"
                />
            )}
            backgroundStyle={{ backgroundColor: theme.dark.colors.background }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <Text style={styles.header}>Tag Your Vibes</Text>
                <View style={styles.inputContainer}>
                    <Icon name='hash' width={Hash_Icon_Size} height={Hash_Icon_Size} fill={'#fff'} />
                    <TextInput
                        onChangeText={setCustomTag}
                        placeholder="Search or create a tag"
                        placeholderTextColor="gray"
                        style={styles.input}
                    />
                </View>
                <ScrollView keyboardShouldPersistTaps="handled">
                    {filteredTags.map((item) => {
                        const selected = selectedTags.includes(item);
                        return (
                            <TouchableOpacity key={item} onPress={() => toggleTag(item)} style={styles.tagItem}>
                                <View style={{
                                    borderRadius: 3, padding: 5, backgroundColor: 'rgba(133, 43, 246, 0.2)',
                                }}>
                                    <Icon name='hash' width={Hash_Icon_Size} height={Hash_Icon_Size} fill={selected ? '#3f2c70' : theme.dark.colors.primary} />
                                </View>
                                <Text style={[styles.tagText, { color: selected ? 'grey' : '#fff' }]}>{item}</Text>
                                <Text style={styles.tagStatus}>{selected ? 'Selected' : 'Select'}</Text>
                            </TouchableOpacity>
                        );
                    })}
                    {customTag.length > 0 && !exactMatch && validateTag(customTag) === null && (
                        <TouchableOpacity onPress={addCustomTag} style={styles.createTagButton}>
                            <View style={{ borderRadius: 3, padding: 5, backgroundColor: 'rgba(133, 43, 246, 0.2)' }}>
                                <Icon name='hash' width={Hash_Icon_Size} height={Hash_Icon_Size} fill={theme.dark.colors.primary} />
                            </View>
                            <Text style={[styles.tagText, { color: '#fff' }]}>{customTag}</Text>
                            <Text style={styles.tagStatus}>Create</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.dark.colors.background,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
        alignSelf: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'grey',
        borderBottomWidth: 0.2,
        paddingBottom: 8,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: hp(2),
        marginLeft: 8,
    },
    tagItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginVertical: 5,
    },
    tagText: {
        marginLeft: 10,
        fontSize: hp(2),
    },
    tagStatus: {
        color: 'gray',
        position: 'absolute',
        right: 10,
    },
    createTagButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingVertical: 8,
    },
});

export default TagSelectorBottomSheet;
