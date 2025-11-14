// App.tsx
import React from "react";
import { ClerkProvider } from "@clerk/clerk-react";
import RootStackNavigator from "./src/navigation/RootStackNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_600SemiBold,
} from "@expo-google-fonts/josefin-sans";
import { Staatliches_400Regular } from "@expo-google-fonts/staatliches";
import Constants from "expo-constants";

const CLERK_PUBLISHABLE_KEY =
  (Constants.expoConfig?.extra?.CLERK_PUBLISHABLE_KEY ??
    Constants.manifest?.extra?.CLERK_PUBLISHABLE_KEY ??
    process.env.CLERK_PUBLISHABLE_KEY ??
    "");
export default function App() {
  const _ = useFonts({
    JosefinSans_400Regular,
    Staatliches_400Regular,
    JosefinSans_600SemiBold,
  });

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <GestureHandlerRootView>
        <RootStackNavigator />
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
