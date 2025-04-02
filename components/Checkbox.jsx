import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Octicons } from "@expo/vector-icons"; // Ensure you have @expo/vector-icons installed
import theme from "../constants/theme";

const Checkbox = ({
  label = "",
  isChecked = false,
  onChange = () => {},
  disabled = false,
  size = 24,
  textSize = 16,
  textColor = "#FFF",
  checkedColor = theme.dark.colors.primary,
}) => {
  const [checked, setChecked] = useState(isChecked);

  const handlePress = () => {
    if (disabled) return;
    const newChecked = !checked;
    setChecked(newChecked);
    onChange(newChecked);
  };

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View
        style={[
          styles.checkbox,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: checked ? "transparent" : checkedColor,
            backgroundColor: checked ? checkedColor : "transparent",
          },
        ]}
      >
        {checked && <Octicons name="check" size={size * 0.6} color="#FFF" />}
      </View>
      {label ? (
        <Text style={[styles.label, { fontSize: textSize, color: textColor }]}>
          {label}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  checkbox: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  label: {
    fontSize: 16,
  },
  disabledContainer: {
    opacity: 0.5,
  },
});

export default Checkbox;
