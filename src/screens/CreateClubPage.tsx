// src/screens/CreateClubPage.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderBanner from "../components/HeaderBanner";
import theme from "../theme";
import MyButton from "../components/MyButton";
import { boilerbuzzApi } from "../api/boilerbuzzApi";

// Adjust this if your HeaderBanner has a different height
const HEADER_HEIGHT = 142;

export default function CreateClubPage() {
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  const [primaryAdvisor, setPrimaryAdvisor] = useState("");
  const [members, setMembers] = useState("");
  const [allowMemberPosts, setAllowMemberPosts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission required",
            "Please allow photo access to choose a club logo.",
          );
        }
      }
    })();
  }, []);

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      // @ts-ignore
      const uri = result?.assets?.[0]?.uri ?? (result as any).uri;
      if (!result.canceled && uri) {
        setLogoUri(uri);
      }
    } catch (err) {
      console.warn("Image picker error", err);
      Alert.alert("Image error", "Could not pick an image.");
    }
  };

  const handleCreate = async () => {
    const memberList = members
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (!clubName.trim()) {
      Alert.alert("Validation", "Please enter a Club Name.");
      return;
    }
    if (!primaryAdvisor.trim()) {
      Alert.alert("Validation", "Please enter a Primary Advisor.");
      return;
    }

    try {
      setIsSubmitting(true);
      const createdClub = await boilerbuzzApi.createClub({
        member_post_permissions: allowMemberPosts,
      });

      const createdId = createdClub[0]?.id;
      console.log({
        clubName,
        primaryAdvisor,
        members: memberList,
        logoUri,
        createdId,
      });
      Alert.alert(
        "Club created",
        `${clubName} has been created as Club #${createdId ?? "new"}.`,
      );
    } catch (err) {
      console.error("Failed to create club", err);
      Alert.alert("Error", "Could not create club on backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      {/* Header - absolutely positioned at top so it is flush to bezel/status area */}
      <View style={styles.headerAbsolute}>
        <HeaderBanner title="CREATE CLUB" />
      </View>

      {/* Body - give paddingTop equal to header height so content sits *under* banner */}
      <SafeAreaView edges={["bottom"]} style={styles.bodySafe}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inner}>
              <Text style={styles.label}>Logo</Text>
              <TouchableOpacity
                style={styles.logoContainer}
                onPress={pickLogo}
                activeOpacity={0.8}
              >
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logoImage} />
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <Text style={styles.plus}>+</Text>
                  </View>
                )}
              </TouchableOpacity>

              <Text style={[styles.label, { marginTop: 24 }]}>
                Club Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter club name"
                placeholderTextColor={theme.colors.darkGrey}
                value={clubName}
                onChangeText={setClubName}
                returnKeyType="done"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>
                Primary Advisor <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Advisor name"
                placeholderTextColor={theme.colors.darkGrey}
                value={primaryAdvisor}
                onChangeText={setPrimaryAdvisor}
                returnKeyType="done"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>
                Add Members{" "}
              </Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Add member emails or names, separated by commas"
                placeholderTextColor={theme.colors.darkGrey}
                value={members}
                onChangeText={setMembers}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <View style={{ height: 28 }} />

              <TouchableOpacity
                style={styles.permissionRow}
                onPress={() => setAllowMemberPosts((prev) => !prev)}
              >
                <Text style={styles.permissionLabel}>
                  Allow members to post
                </Text>
                <Text style={styles.permissionValue}>
                  {allowMemberPosts ? "Enabled" : "Disabled"}
                </Text>
              </TouchableOpacity>

              <View style={{ height: 16 }} />

              <MyButton
                title={isSubmitting ? "Creating Club..." : "Create Club"}
                onPress={handleCreate}
              />
            </View>

            {/* spacer to ensure content stays at top when not enough content */}
            <View style={styles.flexGrowSpacer} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const LOGO_SIZE = 120;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // absolutely place header to top so it's visually flush with bezel/statusbar
  headerAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    backgroundColor: theme.colors.navyBlue,
    zIndex: 20,
    overflow: "hidden",
  },

  // body starts under header; paddingTop must match header height
  bodySafe: {
    flex: 1,
    paddingTop: HEADER_HEIGHT,
    backgroundColor: theme.colors.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 6, // small padding only
    paddingBottom: 36,
    flexGrow: 1,
    justifyContent: "flex-start",
  },

  inner: {
    marginTop: 32,
    alignItems: "stretch",
  },

  flexGrowSpacer: {
    flex: 1,
  },

  label: {
    fontFamily: theme.fonts.body,
    color: theme.colors.darkGrey,
    fontSize: 18,
    marginBottom: 8,
  },
  required: {
    color: "#D9534F",
    fontSize: 16,
  },
  logoContainer: {
    alignSelf: "center",
    marginTop: 4,
  },
  logoPlaceholder: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    backgroundColor: theme.colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 36,
    color: theme.colors.darkGrey,
  },
  logoImage: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 10,
    resizeMode: "cover",
  },
  input: {
    backgroundColor: "transparent",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: theme.fonts.body,
  },
  multilineInput: {
    minHeight: 60,
    maxHeight: 120,
  },
  permissionRow: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  permissionLabel: {
    fontFamily: theme.fonts.body,
    color: "#000",
    fontSize: 16,
  },
  permissionValue: {
    fontFamily: theme.fonts.heading,
    color: theme.colors.navyBlue,
    fontSize: 16,
  },
});
