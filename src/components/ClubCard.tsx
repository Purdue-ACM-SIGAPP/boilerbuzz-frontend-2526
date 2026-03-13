import React from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import theme from "../theme";

type ClubCardProps = {
  name: string;
  description?: string;
  imageSource?: ImageSourcePropType;
  followed?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function ClubCard({
  name,
  description = "",
  imageSource,
  followed = false,
  onPress,
  style,
}: ClubCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : "none"}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        followed && styles.followedCard,
        style,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.textBlock}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 112,
    borderWidth: 1,
    borderColor: "#A9A9A9",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginBottom: 18,
    backgroundColor: theme.colors.background,
  },
  followedCard: {
    backgroundColor: "#F8F5EC",
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    backgroundColor: "#D9D9D9",
  },
  textBlock: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    lineHeight: 22,
    color: "#111111",
    fontFamily: "JosefinSans_700Bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    color: theme.colors.darkGrey,
    fontFamily: theme.fonts.body,
    paddingRight: 6,
  },
});
