import React from 'react'
import { hp, wp, invalidProfileImage } from '../helpers/common'
import theme from '../constants/theme'
import { Image } from 'expo-image'

const Avatar = ({ size = hp(4.5), user, style = {} }) => {
    return (
        <Image
            source={{ uri: user?.profileImageUrl }}
            style={[{ width: size, height: size, borderRadius: 100 }, style]}
            placeholder={invalidProfileImage}
            placeholderContentFit='fill'
            transition={200}
        />
    )
}

export default Avatar