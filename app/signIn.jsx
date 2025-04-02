import {
  Alert,
  View,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Platform,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { wp, hp } from "../helpers/common";
import { StatusBar } from "expo-status-bar";
import theme from "../constants/theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import Input from "../components/Input";
import Button from "../components/Button";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useAuth } from "../context/authContext";
import { Image } from "expo-image";
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

const SignIn = () => {
  const router = useRouter();
  const { isSignUp } = useLocalSearchParams(); // Read the isSignUp param
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [email, setEmail] = useState("");

  const { requestOtp } = useAuth();

  // Shared values for animations
  const titleOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);

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

  const HandleOTP = async () => {
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const response = await requestOtp(email);
    setLoading(false);
    if (response.success) {
      router.push({
        pathname: "otp",
        params: { email },
      });
    } else {
      Alert.alert("Failed to request OTP", response.msg);
    }
  };

  const handleEmailChange = (value) => {
    setIsEmailValid(emailRegex.test(value));
    setEmail(value);
  };

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <StatusBar style="auto" />
      <View style={styles.particlesContainer} pointerEvents="none">
        <BackgroundStars />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
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
              {/* Animated title */}
              <Animated.View style={titleStyle}>
                <View className="gap-2">
                  <Text
                    style={{
                      color: theme.dark.colors.primary,
                      fontSize: hp(5),
                      textAlign: "left",
                      fontWeight: theme.dark.typography.bold,
                    }}
                  >
                    {"Hey Traveler🚀,"}
                    {/* {isSignUp === "true" ? "Hi👋," : "Traveler🚀,"} */}
                  </Text>
                  <Text
                    style={{
                      color: theme.dark.colors.text,
                      fontSize: hp(3),
                      textAlign: "left",
                      fontWeight: theme.dark.typography.bold,
                    }}
                  >
                    {"Your adventure awaits."}
                    {/* {isSignUp === "true" ? "Let's start your adventure!" : "Let's continue with email"} */}
                  </Text>
                </View>
              </Animated.View>

              {/* Animated Inputs */}
              <Animated.View style={[inputStyle, { gap: hp(2) }]}>
                <Input
                  icon="mail"
                  placeholder="Enter your email"
                  iconColor="white"
                  containerStyles={{}}
                  onChangeText={handleEmailChange}
                  onSubmitEditing={HandleOTP}
                  autoFocus
                />
              </Animated.View>
            </View>
          </View>
        </ScrollView>

        {/* Animated Button - Stays at Bottom */}
        <Animated.View style={[buttonStyle, { paddingBottom: hp(3), paddingHorizontal: wp(3) }]}>
          <Button enabled={isEmailValid} title="Continue" loading={loading} onPress={HandleOTP} />
        </Animated.View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SignIn;

const styles = StyleSheet.create({
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