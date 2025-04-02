import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import theme from '../../constants/theme';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hp } from '../../helpers/common';
import { Icon } from 'react-native-eva-icons';
import KeyboardView from '../../components/KeyboardView';
import { query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/authContext';
import MessageList from '../../components/MessageList';
import { db } from '../../firebaseConfig';
import { collection } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const ChatRoom = () => {
  const { sendMessage, markLastMessageAsRead, user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const item = JSON.parse(params.item);
  const chatRoomId = item.id;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const sendIconSize = hp(2.7);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!chatRoomId) {
      Alert.alert('Error', 'No chat room specified.');
      router.back();
      return;
    }

    const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages([...msgs]);
      if (flatListRef.current && msgs.length > 0) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    });

    markLastMessageAsRead(chatRoomId);

    return () => unsubscribe();
  }, [chatRoomId]);

  // Function to open image picker
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const manipResult = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      );

      setSelectedImage(manipResult.uri);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSend = async () => {
    if (!messageText.trim() && !selectedImage) {
      Alert.alert('Error', 'Cannot send an empty message.');
      return;
    }

    const formattedMessage = messageText.trim();

    const result = await sendMessage(chatRoomId, formattedMessage, selectedImage);

    if (result.success) {
      setMessageText('');
      setSelectedImage(null);
    } else {
      Alert.alert('Error', result.msg || 'Failed to send message.');
    }
  };

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <KeyboardView inChat={true}>
        <ChatRoomHeader router={router} user={item.otherUser} />
        <View className="flex-1 justify-between overflow-visible">
          <View className="flex-1">
            <MessageList messages={messages} currentUser={user} otherUser={item.otherUser} />
          </View>

          <View style={{ marginBottom: hp(3.8) }} className="pt-2">
            <View className="flex-row justify-between items-center mx-3">
              <View className="flex-row justify-between border p-2 rounded-full pl-5"
                style={{ flex: 1, backgroundColor: theme.dark.colors.surface50, borderColor: theme.dark.colors.surface60, borderWidth: 0.6, shadowColor: theme.dark.colors.accent, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }}>

                {/* If an image is selected, show preview */}
                {selectedImage ? (
                  <View style={{ position: 'relative', marginRight: 10 }}>
                    <Image source={{ uri: selectedImage }} style={{ width: 36, height: 36, borderRadius: 5 }} />
                    <TouchableOpacity
                      style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, padding: 2 }}
                      onPress={removeImage}>
                      <Icon name="close" width={14} height={14} fill="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TextInput
                    className="flex-1 mr-2 text-neutral-300"
                    placeholder="Say something..."
                    placeholderTextColor={'gray'}
                    style={{ fontSize: hp(2) }}
                    value={messageText}
                    onChangeText={setMessageText}
                    onSubmitEditing={handleSend}
                    returnKeyType="send"
                  />
                )}

                {/* Send or Image Picker Icon */}
                {messageText.trim().length > 0 || selectedImage ? (
                  <TouchableOpacity
                    style={{ aspectRatio: 1, backgroundColor: theme.dark.colors.primary }}
                    className="p-2 mr-1 rounded-full"
                    onPress={handleSend}
                  >
                    <Icon name="paper-plane-outline" width={sendIconSize} height={sendIconSize} fill="white" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={{ backgroundColor: theme.dark.colors.primary }}
                    className="p-2 mr-1 rounded-full"
                    onPress={pickImage}
                  >
                    <Icon name="image-outline" width={sendIconSize} height={sendIconSize} fill="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </KeyboardView>
    </ScreenWrapper>
  );
};

export default ChatRoom;
