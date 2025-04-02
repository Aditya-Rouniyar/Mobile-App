import { View, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import { Octicons } from "@expo/vector-icons"; // Import Octicons
import theme from "../constants/theme";
import { hp } from "../helpers/common";

const Input = (props) => {
  // State to track if the input is focused
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View
      className="bg-neutral-800"
      style={[
        styles.container,
        props.containerStyles && props.containerStyles,
        isFocused && {
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }, // Emit blur shadow when focused
      ]}
    >
      {/* Icon Section */}
      <View style={styles.iconContainer}>
        {props.icon && (
          <Octicons
            name={props.icon}
            size={hp(3)} // Set consistent size for icons
            color={props.iconColor || theme.dark.colors.text}
          />
        )}
      </View>

      {/* TextInput Section */}
      <TextInput
        style={[styles.input, props.inputStyles && props.inputStyles]}
        ref={props.inputRef && props.inputRef}
        placeholder={props.placeholder || "Enter text"}
        placeholderTextColor={
          props.placeholderTextColor || theme.dark.colors.placeholder
        }
        onFocus={handleFocus} // Trigger onFocus
        onBlur={handleBlur} // Trigger onBlur
        {...props} // Spread additional props
      />
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xxl,
    flexDirection: "row", // Row layout for icon and TextInput
    height: hp(7.2),
    alignItems: "center",
    paddingHorizontal: 18,
    shadowColor: theme.dark.colors.primary,
  },
  iconContainer: {
    width: hp(4), // Fixed width ensures consistent alignment
    height: "100%", // Match parent height
    justifyContent: "center", // Center icon vertically
    alignItems: "center", // Center icon horizontally
  },
  input: {
    flex: 1, // TextInput takes up the remaining space
    fontSize: hp(2),
    color: theme.dark.colors.text, // Set default text color
    paddingLeft: 8,
    textAlign: "left", // Left-align text
  },
});
