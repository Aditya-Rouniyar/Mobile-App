import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Comes with Expo
import theme from "../constants/theme";

const TwoHearts = ({ size = 22, color1 = theme.dark.colors.primary20, color2 = "pink" }) => (
  <View style={{ width: size * 1.3, height: size, position: "relative" }}>
    {/* Left Heart (Rotated Outwards Left) */}
    <Ionicons
      name="heart"
      size={size}
      color={color2}
      style={{
        position: "absolute",
        left: size * 0.1,
        top: size * 0.1,
        opacity: 0.8,
        transform: [{ rotate: "-15deg" }],
      }}
    />
    {/* Right Heart (Rotated Outwards Right) */}
    <Ionicons
      name="heart"
      size={size}
      color={color1}
      style={{
        position: "absolute",
        left: size * 0.3,
        top: 0,
        transform: [{ rotate: "15deg" }],
      }}
    />
  </View>
);

export default TwoHearts;
