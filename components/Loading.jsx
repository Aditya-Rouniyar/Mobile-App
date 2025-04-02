import { ActivityIndicator, View, Text } from "react-native";
import React from "react";
import theme from "../constants/theme";
const Loading = ({ size = "large", color = theme.dark.colors.primary }) => {
  return (
    <View className="justify-center items-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default Loading;
