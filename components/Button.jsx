import React from "react";
import { Pressable, StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import theme from "../constants/theme";
import { wp, hp } from "../helpers/common";
import Loading from "./Loading";
import { Icon } from "react-native-eva-icons";

const Button = ({
  buttonStyle,
  textStyle,
  title = "",
  onPress = () => { },
  loading = false,
  hasShadow = true,
  enabled = true,
  iconName = "",
  iconColor = "white",
  textColor = "white",
  buttonColor = theme.dark.colors.primary,
  shadowColor = theme.dark.colors.primaryBlur,
  shadowOppacity = 1,

}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shadowStyle = {
    shadowColor: shadowColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: shadowOppacity,
    shadowRadius: 12,
    elevation: 4,
  };

  // Function to darken a color
  const darkenColor = (color, amount) => {
    let r, g, b;
    if (color.startsWith("#")) {
      const bigint = parseInt(color.slice(1), 16);
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    } else if (color.startsWith("rgb")) {
      const rgb = color.match(/\d+/g);
      [r, g, b] = rgb.map(Number);
    } else {
      throw new Error("Unsupported color format");
    }
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const originalColor = buttonColor;
  const backgroundColor = enabled
    ? originalColor
    : darkenColor(originalColor, 40);

  if (loading) {
    return (
      <View
        style={[
          styles.button,
          buttonStyle,
          { backgroundColor: theme.dark.surface },
        ]}
      >
        <Loading />
      </View>
    );
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          if (enabled) {
            scale.value = withSpring(0.9, { damping: 10, stiffness: 200 });
          }
        }}
        onPressOut={() => {
          if (enabled) {
            scale.value = withSpring(1, { damping: 10, stiffness: 200 });
          }
        }}
        onPress={enabled ? onPress : null}
        style={[
          styles.button,
          buttonStyle,
          { backgroundColor, height: buttonStyle?.height || hp(6), paddingHorizontal: buttonStyle?.paddingHorizontal || wp(2) },
          hasShadow && shadowStyle,
        ]}
      >
        {iconName ? (
          <Icon
            name={iconName}
            width={26}
            height={26}
            fill={iconColor}
            style={{ marginRight: 6 }}
          />
        ) : null}
        <Text
          style={[
            styles.text,
            textStyle,
            { color: textColor },
            !enabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    // Remove the fixed height to allow dynamic sizing
    height: hp(6),
    // Add vertical and horizontal padding
    paddingHorizontal: wp(2),  // Adjust as needed for "2" left and right padding

    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.xxl,
    flexDirection: "row",
  },
  text: {
    fontSize: hp(2),
    color: "white",
    fontWeight: theme.dark.typography.semiBold,
  },
  disabledText: {
    opacity: 0.6,
  },
});
