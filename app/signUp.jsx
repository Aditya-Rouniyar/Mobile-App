import { Alert, View, Text, Pressable, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { wp, hp } from "../helpers/common";
import { StatusBar } from "expo-status-bar";
import theme from "../constants/theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import Input from "../components/Input";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Checkbox from "../components/Checkbox";
import KeyboardView from "../components/KeyboardView";
const SignUp = () => {
  const router = useRouter();
  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  // Submit Handler
  const OnSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Please fill all the fields.");
      return;
    }

    if (!emailRegex.test(emailRef.current)) {
      Alert.alert("Sign Up", "Please enter a valid email address.");
      return;
    }

    // Go to next info page
    router.push({
      pathname: "signUpMoreInfo",
      params: {
        name: nameRef.current,
        email: emailRef.current,
        password: passwordRef.current,
      },
    });
  };

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <KeyboardView>
        <StatusBar style="light" />

        <View
          className="flex-1 gap-12"
          style={{ paddingHorizontal: wp(3), paddingTop: hp(2) }}
        >
          {/* Top back button */}
          <BackButton router={router} />

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
                  Hi👋 ,
                </Text>
                <Text
                  style={{
                    color: theme.dark.colors.text,
                    fontSize: hp(5),
                    textAlign: "left",
                    fontWeight: theme.dark.typography.bold,
                  }}
                >
                  Let's Start!
                </Text>
              </View>
            </Animated.View>

            {/* Animated Inputs */}
            <Animated.View style={[inputStyle, { gap: hp(2) }]}>
              
              <Input
                icon="mail"
                placeholder="Email"
                iconColor="white"
                containerStyles={{}}
                onChangeText={(value) => (emailRef.current = value)}
              />
            </Animated.View>

            {/* Animated Button */}
            <Animated.View style={buttonStyle}>
              <Button title="Continue" loading={loading} onPress={OnSubmit} />
            </Animated.View>

            {/* Footer */}
            <View className="flex-row justify-center items-center gap-2">
              <Text className="text-neutral-300 text-center">
                Have an account already?
              </Text>
              <Pressable onPress={() => router.push("signIn")}>
                <Text
                  className="text-center font-bold"
                  style={{ color: theme.dark.colors.primary }}
                  fontSize={hp(1.6)}
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
            <View className="flex-row justify-center items-center gap-2">
              <Checkbox
                textSize={hp(1.6)}
                fontWeight={theme.dark.typography.small}
                size={wp(4)}
                label="Opt out of marketing email."
              />
            </View>
          </View>
        </View>
      </KeyboardView>
    </ScreenWrapper>
  );
};

export default SignUp;
