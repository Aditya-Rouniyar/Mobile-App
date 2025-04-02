import React, { createContext, useRef } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  ImageBackground,
  Image,
} from "react-native";
import theme from "../../constants/theme";
import { Icon } from "react-native-eva-icons";
import Header from "../../components/Header";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import UploadImageBottomSheet from "../../components/UploadImageBottomSheet";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export const BottomSheetContext = createContext(null);

const Layout = () => {

  const bottomSheetRef = useRef(null);
  return (
    <GestureHandlerRootView>
      <BottomSheetModalProvider>
        <BottomSheetContext.Provider value={bottomSheetRef}>
          <Tabs
            screenOptions={({ route }) => ({
              header: () => <Header routeName={route.name} />,
              tabBarShowLabel: false,
              tabBarStyle: styles.tabBarStyle,
              tabBarIcon: ({ focused }) => {
                let iconName;
                switch (route.name) {
                  case "home":
                    iconName = focused ? "home" : "home-outline";
                    break;
                  case "discovery":
                    iconName = focused ? "compass" : "compass-outline";
                    break;
                  case "chat":
                    iconName = focused ? "message-circle" : "message-circle-outline";
                    break;
                  case "profile":
                    iconName = focused ? "person" : "person-outline";
                    break;
                  default:
                    iconName = focused
                      ? "radio-button-on"
                      : "radio-button-off-outline";
                }

                return (
                  <View style={styles.iconContainer}>
                    <Icon
                      name={iconName}
                      width={26} // width of the icon
                      height={26} // height of the icon
                      fill={focused ? "white" : "#888888"}
                      style={{ alignSelf: "center" }}
                    />
                    {focused && <View style={styles.underline} />}
                  </View>
                );
              },
              tabBarLabel: ({ focused, color }) => (
                <Text
                  style={[styles.tabLabel, { color: focused ? "white" : "#888888" }]}
                >
                  {route.name.charAt(0).toUpperCase() + route.name.slice(1)}
                </Text>
              ),
            })}
          >
            <Tabs.Screen name="home" options={{ title: "Home" }} />
            <Tabs.Screen name="discovery" options={{ title: "Discovery" }} />
            <Tabs.Screen
              name="noct"
              options={{
                headerShown: false,
                title: "",
                tabBarButton: (props) => (
                  <View style={styles.noctContainer}>
                    <TouchableOpacity
                      {...props}
                      style={[props.style, styles.nocturneButtonContainer]} // Merge styles to preserve default layout
                    >
                      <ImageBackground
                        source={require("../../assets/images/circular-bubble.png")} // Path to your image
                        style={styles.nocturneButton}
                      >
                        <Image
                          style={styles.noctIcon}
                          resizeMode="center"
                          source={require("../../assets/images/Staryn.png")}
                        />
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>
                ),
              }}
            />

            <Tabs.Screen name="chat" options={{ title: "Chat" }} />
            <Tabs.Screen name="profile" options={{ title: "Profile" }} />
          </Tabs>
          <UploadImageBottomSheet ref={bottomSheetRef} />
        </BottomSheetContext.Provider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default Layout;
const styles = StyleSheet.create({
  tabBarStyle: {
    borderTopWidth: 0.2,
    borderTopColor: theme.dark.colors.surface20,
    height: 80,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: theme.dark.colors.surface,
    shadowColor: theme.dark.colors.surface,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
  },
  noctContainer: {
    alignSelf: "center",
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.dark.colors.surface,
  },
  nocturneButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  nocturneButton: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.dark.colors.primaryBlur,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  noctIcon: {
    width: 68,
    height: 60,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  blurredEffect: {
    shadowColor: theme.dark.colors.primary,
    shadowOpacity: 1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
  underline: {
    position: "absolute",
    bottom: -5,
    height: 4,
    width: 25,
    backgroundColor: theme.dark.colors.primary,
    borderRadius: 2,
    shadowColor: theme.dark.colors.primary,
    shadowOpacity: 1,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 0 },
  },
});
