import {
  Alert,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { wp, hp } from "../helpers/common";
import { StatusBar } from "expo-status-bar";
import theme from "../constants/theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Input from "../components/Input";
import { MotiView } from "moti";

const { width, height } = Dimensions.get("window");
const STAR_COUNT = 30;
const starColors = [
  "#875cf6", // Thistle (Soft purple-white)
  "#DCD0FF", // Pale Lilac (Soft pastel violet)
  "#B19CD9", // Light Lavender (Muted purple-white)
];

const BackgroundStars = React.memo(() => (
  <>
    {[...Array(STAR_COUNT).keys()].map((index) => {
      const randomX = Math.random() * width;
      const randomY = Math.random() * height;
      const randomDelay = Math.random() * 3000;
      const randomColor = starColors[Math.floor(Math.random() * starColors.length)];
      const randomDriftX = Math.random() * 10 + 2; // Small horizontal drift
      const randomDriftY = Math.random() * 10 + 2; // Small vertical drift
      const randomSize = Math.random() * 2.2 + 1.8;
      return (
        <MotiView
          key={`star-${index}`}
          from={{ opacity: 0.3, translateX: 0, translateY: 0 }}
          animate={{
            opacity: [0.3, 1, 0.3], // Pulsating effect
            translateX: [0, randomDriftX, 0], // Horizontal drift
            translateY: [0, randomDriftY, 0], // Vertical drift
            scale: [0.68, 1, 0.36], // Pulsating size
          }}
          transition={{
            type: "timing",
            duration: 3000,
            loop: true,
            delay: randomDelay,
            repeatReverse: true,
          }}
          style={[styles.star, { left: randomX, top: randomY, backgroundColor: randomColor, width: randomSize, height: randomSize, borderRadius: randomSize / 2 }]}
        />
      );
    })}
  </>
));

const SignUpMoreInfo = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // Gender state
  const [birthday, setBirthday] = useState(""); // Store birthday as a string
  const birthdayInputRef = useRef(null);

  const handleBirthdayChange = (text) => {
    // Remove all non-numeric characters
    let cleaned = text.replace(/\D/g, "");

    // Prevent more than 8 characters
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }

    // Format the date dynamically as user types (DD-MM-YYYY)
    let formatted = "";
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length > 2) formatted += "-" + cleaned.slice(2, 4);
    if (cleaned.length > 4) formatted += "-" + cleaned.slice(4, 8);

    // Update state without blocking backspace
    setBirthday(formatted);

    // When full date is entered, validate it immediately
    if (formatted.length === 10) {
      if (validateBirthday(formatted)) {
        if (birthdayInputRef.current) {
          birthdayInputRef.current.blur();
        }
      }
    }
  };

  // Ensures the date is valid once fully entered
  const validateBirthday = (dateString) => {
    if (dateString.length !== 10) return false;

    const parts = dateString.split("-");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const today = new Date();
    const birthDate = new Date(year, month - 1, day); // JS months are 0-indexed

    if (
      isNaN(day) ||
      isNaN(month) ||
      isNaN(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > new Date(year, month, 0).getDate() || // Check if day is valid for the month
      birthDate > today
    ) {
      Alert.alert("Invalid Date", "Please enter a valid date of birth.");
      setBirthday(""); // Clear input on invalid date
      return false;
    }
    return true;
  };

  // Shared values for animations
  const titleOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const { setupProfile, user } = useAuth();

  // Animated styles
  const titleStyle = useAnimatedStyle(() => ({
    opacity: withTiming(titleOpacity.value, { duration: 800 }),
  }));

  const inputStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(inputTranslateY.value, {
          duration: 1000,
          easing: Easing.out(Easing.exp),
        }),
      },
    ],
    opacity: withTiming(titleOpacity.value, { duration: 1000 }),
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: withTiming(buttonOpacity.value, { duration: 800, delay: 300 }),
  }));

  // Trigger animations on mount
  useEffect(() => {
    titleOpacity.value = 1;
    inputTranslateY.value = 0;
    buttonOpacity.value = 1;
  }, []);

  // Compute form validity
  const isFormValid =
    name.trim() !== "" &&
    gender.trim() !== "" &&
    birthday.length === 10; // Birthday is considered valid if it's fully entered

  const handleUpateProfileInfo = async () => {
    if (!isFormValid) {
      Alert.alert("Sign Up", "Please fill all the fields correctly.");
      return;
    }
    // Log collected data
    console.log({
      name,
      birthday,
      gender,
    });

    setLoading(true);

    // Convert DD-MM-YYYY string representation to date object
    const [day, month, year] = birthday.split("-").map((part) => parseInt(part, 10));
    // JS months are 0-indexed
    const birthdayDate = new Date(year, month - 1, day);
    let response = await setupProfile(user.email, name, birthdayDate, gender);
    setLoading(false);

    // Assuming response is defined when register is called
    if (!response.success) {
      Alert.alert("Error", response.message);
      return;
    }

    router.replace("home");
  };

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <StatusBar style="light" />
          <View style={styles.particlesContainer} pointerEvents="none">
            <BackgroundStars />
          </View>
          <View
            className="flex-1 gap-12"
            style={{ paddingHorizontal: wp(3), paddingTop: hp(2) }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              {/* Top back button */}
              <View style={{ position: "absolute", left: 0 }}>
                <BackButton router={router} />
              </View>

              <Image
                contentFit="contain"
                style={{
                  height: hp(8),
                  width: hp(8),
                  marginTop: -hp(1.8),
                }}
                source={require("../assets/images/staryn-logo.png")}
              />
            </View>

            <View className="flex-1 gap-12">
              {/* Animated Inputs */}
              <Animated.View style={[inputStyle, { gap: hp(2) }]}>
                <Text
                  style={{
                    fontWeight: theme.dark.typography.semiBold,
                    fontSize: hp(2.8),
                    color: "white",
                  }}
                >
                  Profile
                </Text>

                <Text style={styles.sectionTitle}>Nickname</Text>
                <Input
                  icon="person"
                  placeholder=""
                  iconColor="white"
                  containerStyles={{}}
                  onChangeText={(value) => setName(value)}
                />

                <Text style={styles.sectionTitle}>
                  Your birthday (Cannot be changed)
                </Text>
                <Input
                  icon="calendar"
                  placeholder="DD-MM-YYYY"
                  iconColor="white"
                  value={birthday}
                  keyboardType="numeric"
                  onChangeText={handleBirthdayChange}
                  inputRef={birthdayInputRef}
                />

                {/* Gender Selection */}
                <Text style={styles.sectionTitle}>Gender</Text>
                <View className="flex-row gap-4 mt-2">
                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      paddingVertical: hp(2),
                      borderRadius: 8,
                      backgroundColor:
                        gender === "male"
                          ? theme.dark.colors.primary
                          : theme.dark.colors.surface10,
                    }}
                    onPress={() => setGender("male")}
                  >
                    <Image
                      source={require("../assets/images/gender/male.png")}
                      style={{ height: 12, width: 12 }}
                    />
                    <Text
                      style={{
                        color:
                          gender === "male"
                            ? theme.dark.colors.textOnPrimary
                            : theme.dark.colors.text,
                        fontWeight: theme.dark.typography.bold,
                      }}
                    >
                      Male
                    </Text>
                  </Pressable>

                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      paddingVertical: hp(2),
                      borderRadius: 8,
                      backgroundColor:
                        gender === "female"
                          ? theme.dark.colors.primary
                          : theme.dark.colors.surface10,
                    }}
                    onPress={() => setGender("female")}
                  >
                    <Image
                      source={require("../assets/images/gender/female.png")}
                      style={{ height: 12, width: 12 }}
                    />
                    <Text
                      style={{
                        color:
                          gender === "female"
                            ? theme.dark.colors.textOnPrimary
                            : theme.dark.colors.text,
                        fontWeight: theme.dark.typography.bold,
                      }}
                    >
                      Female
                    </Text>
                  </Pressable>

                  <Pressable
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      paddingVertical: hp(2),
                      borderRadius: 8,
                      backgroundColor:
                        gender === "other"
                          ? theme.dark.colors.primary
                          : theme.dark.colors.surface10,
                    }}
                    onPress={() => setGender("other")}
                  >
                    <Image
                      source={require("../assets/images/gender/other.png")}
                      style={{ height: 12, width: 12 }}
                    />
                    <Text
                      style={{
                        color:
                          gender === "other"
                            ? theme.dark.colors.textOnPrimary
                            : theme.dark.colors.text,
                        fontWeight: theme.dark.typography.bold,
                      }}
                    >
                      Other
                    </Text>
                  </Pressable>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Why are we asking these?",
                      "Your date of birth is used for age validation. Your gender identity helps us enhance your app experience. Select 'Other' if you prefer not to disclose your gender identity.",
                      [
                        {
                          text: "OK",
                        },
                      ]
                    )
                  }
                >
                  <Text
                    className="text-right text-neutral-400 font-semibold"
                    style={{ fontSize: hp(1.6) }}
                  >
                    Why are we asking these?
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Animated Button */}
              <Animated.View style={buttonStyle}>
                <Button
                  title="Continue"
                  loading={loading}
                  onPress={handleUpateProfileInfo}
                  enabled={isFormValid} // Button is disabled until all fields are valid
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScreenWrapper>
  );
};

export default SignUpMoreInfo;

const styles = StyleSheet.create({
  sectionTitle: {
    color: "grey",
    fontWeight: theme.dark.typography.semiBold,
    fontSize: hp(2),
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: wp(4),
  },
  topOverlay: {
    position: "absolute",
    top: hp(6),
    width: "100%",
    alignItems: "baseline",
  },
  footer: {
    flex: "row",
    width: "100%",
    marginBottom: hp(12),
    gap: 48,
  },
  star: {
    position: "absolute",
    width: 3,
    height: 3,
    backgroundColor: "white",
    borderRadius: 1.5,
  },
});
