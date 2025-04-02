import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { hp } from "../helpers/common";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

export default function Header({ routeName = "" }) {
  const { top } = useSafeAreaInsets();

  const getTitle = (routeName) => {
    switch (routeName) {
      case "home":
        return "Home";
      case "discovery":
        return "Explore";
      case "chat":
        return "Chat";
      case "profile":
        return "Profile";
      default:
        return "";
    }
  };

  const title = getTitle(routeName);

  return (
    <BlurView intensity={30} tint="dark" style={[styles.header, { paddingTop: top }]}>
      <View className="flex-row justify-between px-5 pb-6">
        <View className="flex-row">
          <Text style={{ ...styles.headerText, fontSize: hp(3) }} className="font-bold text-white">
            {title}
          </Text>
          <Ionicons name="planet" color="white" size={18} />
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent white for glass effect
    borderBottomColor: "rgba(255, 255, 255, 0.2)",
    borderBottomWidth: 1,
    shadowColor: "black",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backdropFilter: "blur(20px)", // Works on web
  },
  headerText: {
    shadowColor: theme.dark.colors.primary,
    shadowOpacity: 1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
});
