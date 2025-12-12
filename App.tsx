// App.tsx
import React, { useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo"; // Changed to clerk-expo
import RootStackNavigator from "./src/navigation/RootStackNavigator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  JosefinSans_400Regular,
  JosefinSans_600SemiBold,
} from "@expo-google-fonts/josefin-sans";
import { Staatliches_400Regular } from "@expo-google-fonts/staatliches";
import Constants from "expo-constants";
import { tokenCache } from "./src/TokenCache"; // Import token cache


const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function App() {
  const [fontsLoaded] = useFonts({
    JosefinSans_400Regular,
    Staatliches_400Regular,
    JosefinSans_600SemiBold,
  });

  if (!fontsLoaded) {
    // Had a bug where default fonts loads instead of custom
    // fonts unless something was touched, so avoid rendering
    // anything until fonts are ready
    return null;
  }


  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache} // Add token cache here
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootStackNavigator />
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
