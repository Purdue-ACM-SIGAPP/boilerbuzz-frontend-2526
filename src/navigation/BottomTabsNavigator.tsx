// src/navigation/BottomTabsNavigator.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import {
  BottomTabBarButtonProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";

import FeedPage from "../screens/HomePage";
import BoardPage from "../screens/PinnedPage";
import SearchPage from "../screens/FindPage";
import ProfilePage from "../screens/ProfilePage";

// placeholder empty screen for the Add tab (it won't be navigated to)
const EmptyScreen = () => null;

import AddModals from "../components/AddModals";

import type { BottomTabsParamList } from "./types";
import Images from "../../assets";
import theme from "../theme";
import { TabIcon } from "../components/TabIcon";

const Tab = createBottomTabNavigator<BottomTabsParamList>();

export default function BottomTabsNavigator() {
  const [popupOpen, setPopupOpen] = useState(false);
  const navigation = useNavigation<any>();

  const openPopup = () => setPopupOpen(true);
  const closePopup = () => setPopupOpen(false);

  const handleAddEvent = () => {
    closePopup();
    navigation.navigate("AddEvent" as never); // ensure registered in root stack
  };

  const handleAddClub = () => {
    closePopup();
    navigation.navigate("CreateClub" as never); // ensure registered in root stack
  };

  return (
    <View style={styles.wrapper}>
      <AddModals
        visible={popupOpen}
        onClose={closePopup}
        onAddEvent={handleAddEvent}
        onAddClub={handleAddClub}
        leftIcon={Images.calendar} // optional, adjust keys to your assets
        rightIcon={Images.clubs} // optional, adjust keys to your assets
        size={120} // optional size for bubbles
      />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarShowLabel: false,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.lightGrey,
            height: 100,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={FeedPage}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                source={focused ? Images.home_pressed : Images.home}
                label="Home"
              />
            ),
          }}
        />

        <Tab.Screen
          name="Search"
          component={SearchPage}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                source={focused ? Images.search_pressed : Images.search}
                label="Find Events"
              />
            ),
          }}
        />

        {/* Add tab: override tabBarButton to toggle popup instead of navigating */}
        <Tab.Screen
          name="Add"
          component={EmptyScreen}
          options={{
            tabBarButton: (props: BottomTabBarButtonProps) => {
              // Render a normal tab slot (no absolute positioning).
              // props contains accessibility + onPress handlers; don't spread style because RN passes layout props
              return (
                <TouchableOpacity
                  accessibilityState={props.accessibilityState}
                  accessibilityLabel={props.accessibilityLabel}
                  testID={props.testID}
                  activeOpacity={0.9}
                  onPress={openPopup}
                  style={styles.tabItem} // same layout as other items
                >
                  {/* highlight background only when popupOpen */}
                  <View style={popupOpen ? styles.centerHighlight : undefined}>
                    <TabIcon
                      focused={popupOpen}
                      source={popupOpen ? Images.add_pressed : Images.add}
                      label="Add"
                    />
                  </View>
                </TouchableOpacity>
              );
            },
          }}
        />

        <Tab.Screen
          name="Pinned"
          component={BoardPage}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                source={focused ? Images.thumbtack_pressed : Images.thumbtack}
                label="Pinned"
              />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfilePage}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                source={focused ? Images.user_pressed : Images.user}
                label="Profile"
              />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Generic tab item layout so Add uses the same vertical alignment
  tabItem: {
    flex: 1,
    justifyContent: "center",
    bottom: 14,
  },

  centerHighlight: {
    borderRadius: 14,
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  // kept in case you still need absolute for something else (not used for Add)
  centerButtonWrapper: {
    // not used for vertical alignment anymore — left here for other usages if needed
    position: "absolute",
    alignSelf: "center",
    zIndex: 50,
  },
});
