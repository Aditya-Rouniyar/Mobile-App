import { View, Text, Pressable, StyleSheet } from "react-native";
import React from "react";
import { Octicons } from "@expo/vector-icons";
import theme from "../constants/theme";
import { hp, wp } from "../helpers/common";

const BackButton = ({ paddingTop, buttonColor = 'gray', size = 26, router }) => {
  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        width: size + 10, // Size of the icon + padding (5 on each side)
        height: size + 10, // Same as width to make it a square
        alignSelf: "flex-start",
        borderRadius: theme.radius.sm,
        backgroundColor: buttonColor,
        justifyContent: "center", // Center the icon vertically
        alignItems: "center", // Center the icon horizontally
        paddingTop: paddingTop,
      }}
    >
      <Octicons name="chevron-left" size={size} color="white" />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "gray",
    justifyContent: "center",
    alignItems: "center",
  },
});
