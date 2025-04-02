import {
  Image,
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import Button from "../components/Button";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { wp, hp } from "../helpers/common";
import theme from "../constants/theme";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Linking } from 'react-native';

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

const Welcome = () => {
  const router = useRouter();
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const footerOpacity = useSharedValue(0);

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: withTiming(titleTranslateY.value, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      }),
    }],
    opacity: withTiming(logoOpacity.value, { duration: 1000 }),
  }));

  const footerStyle = useAnimatedStyle(() => ({
    opacity: withTiming(footerOpacity.value, { duration: 800, delay: 300 }),
  }));

  useEffect(() => {
    logoOpacity.value = 1;
    titleTranslateY.value = 0;
    footerOpacity.value = 1;
  }, []);

  return (
    <ScreenWrapper bg={theme.dark.colors.surface}>
      <StatusBar style="light" />
      <LinearGradient colors={["#0D0035", "#1A0640", "#320D5B"]} style={styles.background} />
      <View style={styles.particlesContainer} pointerEvents="none">
        <BackgroundStars />
      </View>
      <View style={styles.container}>
        <Animated.View style={[styles.topOverlay, titleStyle]}>
          <Image
            contentFit="contain"
            style={{ alignSelf: "center", height: hp(8), width: hp(8), marginTop: -hp(1.8) }}
            source={require("../assets/images/staryn-logo.png")}
          />
          <Text className="font-extrabold" style={{ fontSize: hp(3.6), color: theme.dark.colors.primary, alignSelf: "center", height: hp(6) }}>
            Staryn
          </Text>
        </Animated.View>
      </View>
      <Animated.View style={[styles.footer, footerStyle]}>
        <Button
          iconName="email-outline"
          title="Continue with email"
          buttonStyle={{ marginHorizontal: wp(3) }}
          onPress={() => router.push({ pathname: "signIn", params: { isSignUp: true } })}
        />
        <View className="flex-row justify-center items-center gap-2 p-4 flex-wrap">
          <Text className="text-center font-normal text-neutral-300" fontSize={hp(1.6)}>
            By continuing, you've read and agree to our
          </Text>
          <Pressable onPress={() => Linking.openURL('https://staryn.com/terms')}>
            <Text className="text-center font-bold" style={{ color: theme.dark.colors.primary }} fontSize={hp(1.6)}>
              Terms and Conditions
            </Text>
          </Pressable>
          <Text className="text-center font-normal text-neutral-300" fontSize={hp(1.6)}>
            and
          </Text>
          <Pressable onPress={() => Linking.openURL('https://staryn.com/privacy')}>
            <Text className="text-center font-bold" style={{ color: theme.dark.colors.primary }} fontSize={hp(1.6)}>
              Privacy Statement
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </ScreenWrapper>
  );
};

export default Welcome;

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
