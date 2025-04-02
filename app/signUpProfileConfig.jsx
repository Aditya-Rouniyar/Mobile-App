import {
  Alert,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
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
import { DatePicker } from "../components/nativewindui/DatePicker";
import Checkbox from "../components/Checkbox";
import { useLocalSearchParams, useSearchParams } from "expo-router/build/hooks";
import { useNavigation } from "@react-navigation/native";
import ProfileImageEdit from "../components/ProfileImageEdit";

const SignUpProfileConfig = () => {
  const router = useRouter();
  const navigation = useNavigation();

  // Shared values for animations
  const titleOpacity = useSharedValue(0);
  const inputTranslateY = useSharedValue(20);
  const buttonOpacity = useSharedValue(0);
  const [isTOSAgreed, setIsTOSAgreed] = useState(false);
  const { register } = useAuth();
  const handleTOSChange = (isChecked) => {
    setIsTOSAgreed(isChecked);
  };
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
    navigation.setOptions({
      gestureEnabled: false,
    });
    return () => {
      // Re-enable gestures when leaving the screen
      navigation.setOptions({
        gestureEnabled: true,
      });
    };
  }, []);

  const handleRegister = async () => {
    if (!gender) {
      Alert.alert("Sign Up", "Please fill all the fields.");
      return;
    }

    if (!isTOSAgreed) {
      Alert.alert(
        "Sign Up",
        "Must accept the terms and conditions to continue."
      );
      return;
    }

    setLoading(true);
    let response = await register(email, password, name, birthday, gender);
    setLoading(false);

    console.log("register response: ", response);

    if (!response.success) {
      Alert.alert("Sign Up", response.msg);
    }
  };

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <StatusBar style="auto" />

      <View
        className="flex-1 gap-24"
        style={{ paddingHorizontal: wp(3), paddingTop: hp(2) }}
      >
        <ProfileImageEdit></ProfileImageEdit>
      </View>
    </ScreenWrapper>
  );
};

export default SignUpProfileConfig;
