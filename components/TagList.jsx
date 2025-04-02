import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

const TagList = ({
    tags = [],
    allowEdit = false,
    onTagRemoved = () => { },
    containerStyle = {},
    tagStyle = {},
    textStyle = {}
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[{ marginVertical: 10 }, containerStyle]}
            contentContainerStyle={{ flexDirection: 'row', gap: 10 }}
        >
            {tags.map((tag, index) => (
                <View
                    key={index}
                    style={[
                        {
                            borderRadius: 20,
                            paddingVertical: 5,
                            paddingHorizontal: 15,
                            backgroundColor: 'rgba(133, 43, 246, 0.2)',
                            flexDirection: 'row',
                            alignItems: 'center',
                        },
                        tagStyle
                    ]}
                >
                    <Text style={[{ color: theme.dark.colors.primary }, textStyle]}># {tag}</Text>
                    {allowEdit && (
                        <TouchableOpacity onPress={() => onTagRemoved(tag)} style={{ marginLeft: 5 }}>
                            <Ionicons name="close-circle" size={18} color={theme.dark.colors.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

export default TagList;
