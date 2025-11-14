// src/navigation/RootStackNavigator.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SignIn, SignUp } from "@clerk/clerk-react";
import BottomTabsNavigator from "./BottomTabsNavigator";
import LoginPage from "../screens/LoginPage";
import RegisterPage from "../screens/RegisterPage";
import SettingsPage from "../screens/SettingsPage";
import ProfilePage from "../screens/ProfilePage";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Tabs" component={BottomTabsNavigator} />
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterPage} />
        <Stack.Screen name="Settings" component={SettingsPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        {/* Add other screens here as needed, e.g.: */}
        {/* <Stack.Screen name="Details" component={DetailsScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
