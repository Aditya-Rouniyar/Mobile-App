import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import BaseTabContent from "../../components/BaseTabContent";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/authContext";
import { wp } from "@/helpers/common";
import Moonlet from "../../components/Moonlet"
import theme from "@/constants/theme";
import Loading from "@/components/Loading";

const Discovery = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { fetchPosts, user } = useAuth();

  const getPosts = async (reset = false) => {
    if ((loadingMore && !reset) || refreshing) return; // Prevent multiple calls

    let result = await fetchPosts(reset ? null : lastVisible);

    if (reset) {
      setPosts(result.posts);
    } else {
      setPosts(prevPosts => [...prevPosts, ...result.posts]); // Append new posts
    }

    setLastVisible(result.lastVisible);
  }

  useEffect(() => {
    getPosts(true); // Fetch initial posts
  }, []);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getPosts(true); // Refresh by resetting posts
    } catch (error) {
      console.error("Error refreshing posts:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMorePosts = async () => {
    if (!lastVisible || loadingMore) return;

    try {
      setLoadingMore(true);
      await getPosts();
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const ListHeader = () => (
    <View className="mb-5 px-2">
      <Button title="Launch Moonlet 💭" onPress={() => router.push('/pages/createPost')} />
    </View>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.dark.colors.surface }}>
      <BaseTabContent
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={<ListHeader />}
        data={posts}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Moonlet item={item} postUser={item?.user} currentUser={user} router={router} />
        )}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <Loading /> : null}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
};

export default Discovery;
