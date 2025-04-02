import { View, Text, StatusBar } from "react-native";
import React, { createContext, useEffect, useRef } from "react";
import { useRouter, Slot, useSegments, Stack } from "expo-router";
import "../global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import LocationPickerBottomSheet from "../components/LocationPickerBottomSheet";
import 'react-native-get-random-values';

export const BottomSheetContext = createContext(null);

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === "undefined") return;

    const inApp = segments[0] === "(app)";
    const inRegistration = segments[0] == 'signUpMoreInfo';

    // We want to take user next to profile config page after registration
    // to set profile pics and in future apply tags, etc
    if (isAuthenticated && !inApp && !inRegistration && user?.name) {
      // Redirect to home
      router.replace("home");
    } else if (isAuthenticated === false) {
      // Redirect to signin
      router.replace("welcome");
    }
  }, [isAuthenticated, user]);

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default function RootLayout() {
  const locationSheetRef = useRef(null);

  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <BottomSheetContext.Provider value={locationSheetRef}>
          <AuthContextProvider>
            <StatusBar style="light" />
            <MainLayout />
          </AuthContextProvider>
          <LocationPickerBottomSheet ref = {locationSheetRef}/>
        </BottomSheetContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
