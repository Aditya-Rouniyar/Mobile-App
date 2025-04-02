import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import theme from '@/constants/theme'
import { hp } from '@/helpers/common'
import { Image } from 'expo-image'

const Badge = ({ image, imageStyles = styles.icon, text }) => {
    return (
        <View style={styles.badge}>
            {image && <Image source={image} style={imageStyles} />}
            {text && <Text style={styles.badgeText}>{text}</Text>}
        </View>
    )
}

const styles = StyleSheet.create({
    icon: {
        height: 12,
        width: 12,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: theme.dark.colors.badge,
        borderRadius: 100,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    badgeText: {
        color: '#CCCCCC',
        fontSize: hp(1.5),
    },
}); export default Badge