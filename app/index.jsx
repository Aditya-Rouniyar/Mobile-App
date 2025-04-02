import { Pressable, View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Loading from "../components/Loading";

const StartPage = () => {
  const router = useRouter();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <Pressable
        onPress={() => {
          router.replace("welcome");
        }}
        style={{
          padding: 10,
          backgroundColor: "white",
          borderRadius: 5,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: "black", fontWeight: "bold" }}>
          Go to Welcome
        </Text>
      </Pressable>
      <Loading size="large" />
    </View>
  );
};

export default StartPage;
