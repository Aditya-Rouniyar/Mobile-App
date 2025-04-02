import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import BackButton from './BackButton'
import theme from '../constants/theme'
import { getGenderIcon, hp, invalidProfileImage, blurhash, getAge } from '../helpers/common'
import { Image } from 'expo-image'
import { Icon } from 'react-native-eva-icons'
import Badge from './Badge'

const ChatRoomHeader = ({ user, router }) => {
    const userImageSize = hp(5);
    const optionsIconSize = hp(3);
    return (
        <View className='flex-row px-2 gap-2' style={{ paddingBottom: 8, borderColor: theme.dark.colors.surface10, borderBottomWidth: 0.3, backgroundColor: theme.dark.colors.surface }}>
            <BackButton buttonColor='transparent' router={router} paddingTop={6}>

            </BackButton>
            <View className='flex-1 flex-row gap-4' style={{ paddingRight: 4 }}>
                <Image source={{uri: user?.profileImageUrl}}
                    style={{ height: userImageSize, width: userImageSize, borderRadius: 100 }}
                    placeholder={invalidProfileImage}
                    placeholderContentFit='fill'
                    transition={200}></Image>
                <View className="flex-1">
                    <View className="flex-row justify-between">
                        {/* name and gender and other tags */}
                        <View className="flex-row justify-start gap-3 items-center">
                            <Text
                                className="text-neutral-100 font-bold"
                                style={{ fontSize: hp(2) }}
                            >
                                {user.name}
                            </Text>
                            <Badge image={getGenderIcon(user?.gender)} text={getAge(user?.dateOfBirth)}/>
                        </View>

                        {/* follow andoptions button */}
                        <View className='flex-row gap-2'>
                            <TouchableOpacity style={{ position: 'relative', top: 8 }}>
                                <Icon name='person-add-outline' width={optionsIconSize} height={optionsIconSize} fill={'white'}></Icon>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ position: 'relative', top: 8 }}>
                                <Icon name='more-vertical-outline' width={optionsIconSize} height={optionsIconSize} fill={'white'}></Icon>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <Text
                        className="text-neutral-400 font-normal"
                        style={{ fontsize: hp(1.8) }}
                    >Active 15 min.</Text>
                </View>
            </View>
        </View >
    )
}

export default ChatRoomHeader