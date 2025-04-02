import { View, Text, TouchableOpacity } from "react-native";
import { Image } from 'expo-image'
import React from "react";
import { getAge, getGenderIcon, getTimeSince, hp, wp } from "../helpers/common";
import { blurhash } from '../utils/common'
import { invalidProfileImage } from "../helpers/common";
import theme from "../constants/theme";
import Badge from '../components/Badge'

const MSG_MAX_LEN = 36;
const ChatItem = ({ item, router, currentUserId }) => {
  const openChatRoom = () => {
    const safeData = {
      ...item,
      url: encodeURIComponent(item.profileImageUrl)
    };
    let data = encodeURIComponent(JSON.stringify(safeData));
    router.push({ pathname: '/pages/chatRoom', params: { item: data } });
  }

  // Determine last message content (Text or "Photo" for media)
  let lastMessageText = 'Say Hi~ 👋'; // Default text if no message
  if (item.lastMessage) {
    if (item.lastMessage.mediaUrl) {
      lastMessageText = "[Photo]";
    } else if (item.lastMessage.content) {
      lastMessageText = item.lastMessage.content.length > MSG_MAX_LEN
        ? item.lastMessage.content.substring(0, MSG_MAX_LEN) + "..."
        : item.lastMessage.content;
    }
  }

  return (
    <TouchableOpacity onPress={openChatRoom} className="flex-row justify-between mx-4 items-center gap-3 mb-4 pb-3">
      <Image
        source={item.otherUser?.profileImageUrl || invalidProfileImage}
        style={{ height: hp(7), width: hp(7), borderRadius: 100 }}
        placeholder={blurhash}
        transition={200}
      ></Image>

      {/* user profile contents */}
      <View className="flex-1 gap-1">
        <View className="flex-row justify-between">
          {/* name and gender and other tags */}
          <View className="flex-row justify-start gap-3 items-center">
            <Text
              className="text-neutral-100 font-bold"
              style={{ fontSize: hp(1.8) }}
            >
              {item.otherUser?.name || "User Deleted"}
            </Text>
            <Badge image={getGenderIcon(item.otherUser?.gender)} text={getAge(item.otherUser?.dateOfBirth)} />
          </View>

          <Text
            className="text-neutral-400 font-normal"
            style={{ fontsize: hp(1) }}
          >
            {getTimeSince(item.lastMessageTimestamp)}
          </Text>
        </View>

        <Text
          className={`font-normal ${!item.hasReadByMe ? 'text-white' : 'text-neutral-400'}`}
          style={{ fontsize: hp(1.8), fontWeight: !item.hasReadByMe ? theme.dark.typography.bold : '' }}
        >
          {item.lastMessage
            ? item.lastMessage.senderId === currentUserId
              ? `${item.hasReadByThem ? 'Read' : 'Sent'} | ${lastMessageText}`
              : lastMessageText
            : 'Say Hi~ 👋'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default ChatItem;
