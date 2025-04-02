import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import theme from "../../constants/theme";
import { useAuth } from "../../context/authContext";
import BaseTabContent from "../../components/BaseTabContent";
import ChatItem from "../../components/ChatItem";
import isEqual from "lodash/isEqual";
import { useRouter } from "expo-router";

const Chat = () => {
  const { user, chatRooms, getChatRooms, cleanupInvalidChatRooms } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await getChatRooms();
    await cleanupInvalidChatRooms();
    setRefreshing(false);
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      {(
        <BaseTabContent
          data={chatRooms}
          contentContainerStyle={styles.contentContainer}
          keyExtractor={(item, index) => (item.id ? item.id.toString() : `index-${index}`)}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => <ChatItem item={item} router={router} currentUserId={user.userId} index={index} />}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark.colors.surface,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 25,
  },
});

export default Chat;
