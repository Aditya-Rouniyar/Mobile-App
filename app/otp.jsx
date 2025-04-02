import {
    View,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    StyleSheet,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { wp, hp } from "../helpers/common";
import theme from "../constants/theme";
import ScreenWrapper from "../components/ScreenWrapper";
import BackButton from "../components/BackButton";
import { StatusBar } from "expo-status-bar";
import { TextInput } from "react-native-gesture-handler";
import { Image } from "expo-image";
import { useAuth } from "../context/authContext";
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

const OtpScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams(); // Get email from navigation params
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);

    const { requestOtp, verifyOtp } = useAuth();

    // Start countdown timer
    useEffect(() => {
        let countdown;
        if (timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(countdown);
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return; // Only allow numbers
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if a number is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        // Call verification function when all digits are entered
        if (newOtp.every((digit) => digit !== "")) {
            handleVerifyOtp(newOtp.join(""));
        }
    };

    const handleBackspace = (index, value) => {
        if (!value && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = ""; // Clear the previous input
            setOtp(newOtp);
            inputRefs.current[index - 1].focus(); // Move focus to previous input
        }
    };

    const handleFocus = () => {
        const firstEmptyIndex = otp.findIndex(digit => digit === "");
        if (firstEmptyIndex !== -1) {
            inputRefs.current[firstEmptyIndex].focus();
        } else {
            inputRefs.current[otp.length - 1].focus(); // Stay on the last one if all are filled
        }
    };

    const handleVerifyOtp = async (code) => {
        setLoading(true);
        try {
            const response = await verifyOtp(email, code); // Call verifyOtp with email and OTP code

            if (response.success) {
                if (response.isNewUser) {
                    router.dismissAll();
                    router.replace("/signUpMoreInfo"); // Navigate to additional sign-up details page
                } else {
                    router.dismissAll();
                    router.replace("/home"); // Navigate to home screen if existing user
                }
            } else {
                throw new Error("Invalid OTP");
            }
        } catch (error) {
            Alert.alert(
                "Failed to verify OTP",
                error.message || "Please try again or request a new code."
            );
            setOtp(["", "", "", "", "", ""]);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        requestOtp(email);
        setOtp(["", "", "", "", "", ""]);
        setTimer(60);
        Alert.alert("OTP Resent", `A new OTP has been sent to ${email}`);
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
                <View
                    className="flex-1 gap-12"
                    style={{ paddingHorizontal: wp(3), paddingTop: hp(2) }}
                >
                    {/* Header with Back Button */}
                    <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "flex-start" }}>
                        <View style={{ position: "absolute", left: 0 }}>
                            <BackButton router={router} />
                        </View>
                        <Image
                            contentFit="contain"
                            style={{ height: hp(8), width: hp(8), marginTop: -hp(1.8) }}
                            source={require("../assets/images/staryn-logo.png")}
                        />
                    </View>

                    {/* Title */}
                    <View className="gap-4">
                        <Text className="text-neutral-50" style={{ fontSize: hp(3.6), fontWeight: theme.dark.typography.bold }}>
                            Verification code
                        </Text>
                        <Text className="font-medium" style={{ color: 'grey', fontSize: hp(2.2) }}>
                            We have sent a 6-digit code to
                        </Text>
                        <Text style={{ color: theme.dark.colors.primary, fontSize: hp(2.2), fontWeight: theme.dark.typography.bold }}>
                            {email}
                        </Text>
                    </View>

                    {/* OTP Input Fields */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2) }}>
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                style={{
                                    width: hp(6),
                                    height: hp(6),
                                    borderRadius: 10,
                                    textAlign: "center",
                                    fontSize: hp(3),
                                    fontWeight: "bold",
                                    color: 'white',
                                    borderWidth: 1,
                                    borderColor: theme.dark.colors.primary,
                                    backgroundColor: digit ? theme.dark.colors.primary : 'transparent',
                                }}
                                autoFocus={index === 0 && otp.every(d => d === "")}
                                keyboardType="numeric"
                                maxLength={1}
                                onFocus={handleFocus}
                                selectionColor={theme.dark.colors.primary}
                                value={digit}
                                editable={!loading} // Prevent user input when verifying
                                onChangeText={(value) => handleOtpChange(index, value)}
                                onKeyPress={({ nativeEvent }) =>
                                    nativeEvent.key === "Backspace"
                                        ? handleBackspace(index, digit)
                                        : null
                                }
                            />
                        ))}
                    </View>

                    {/* Loading Indicator */}
                    {loading && (
                        <View style={{ alignItems: "center", marginBottom: hp(2) }}>
                            <ActivityIndicator size="large" color={theme.dark.colors.primary} />
                            <Text style={{ color: theme.dark.colors.text, fontSize: hp(2), marginTop: hp(1) }}>
                                Verifying OTP...
                            </Text>
                        </View>
                    )}

                    {/* Countdown Timer or Resend Button */}
                    {timer > 0 ? (
                        <Text style={{ color: theme.dark.colors.text, textAlign: "center", fontSize: hp(2) }}>
                            Resend in {timer} seconds
                        </Text>
                    ) : (
                        <TouchableOpacity disabled={loading} onPress={handleResend}>
                            <Text style={{ color: theme.dark.colors.primary, textAlign: "center", fontSize: hp(2), fontWeight: theme.dark.typography.bold }}>
                                Resend Code
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
};

export default OtpScreen;

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