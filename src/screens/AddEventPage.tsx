// src/screens/AddEventPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  type AlertButton,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import HeaderBanner from "../components/HeaderBanner";
import MyButton from "../components/MyButton";
import theme from "../theme";
import * as DocumentPicker from "expo-document-picker";
import { boilerbuzzApi } from "../api/boilerbuzzApi";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "AddEvent">;

const { width: screenWidth } = Dimensions.get("window");
const CONTAINER_MAX = 520;
const HORIZONTAL_PADDING = 24;
const containerWidth = Math.min(
  screenWidth - HORIZONTAL_PADDING * 2,
  CONTAINER_MAX,
);

export default function AddEventPage({ navigation }: Props) {
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [clubs, setClubs] = useState<Array<{ id: number }>>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadClubs = async () => {
      try {
        const clubResponse = await boilerbuzzApi.getClubs();
        setClubs(clubResponse.map((club) => ({ id: club.id })));
      } catch (err) {
        console.error("Unable to load clubs", err);
      }
    };

    loadClubs();
  }, []);

  const displayYear = useMemo(() => {
    return String(new Date().getFullYear());
  }, []);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const selectedFile = result.assets[0];
        setFileName(selectedFile.name ?? "Selected file");
        setFileUri(selectedFile.uri ?? "");
        Alert.alert("File selected", selectedFile.name ?? "Selected file");
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document.");
    }
  };

  const onSelectClub = () => {
    if (!clubs.length) {
      Alert.alert(
        "No clubs available",
        "Create a club first, then add an event.",
      );
      return;
    }

    const buttons: AlertButton[] = clubs.slice(0, 8).map((club) => ({
      text: `Club #${club.id}`,
      onPress: () => setSelectedClubId(club.id),
    }));
    buttons.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Select club", undefined, buttons);
  };

  const onSubmit = async () => {
    if (!eventName.trim()) return Alert.alert("Please enter an event name");
    if (!location.trim()) return Alert.alert("Please enter a location");
    if (!selectedClubId) return Alert.alert("Please select a club");

    const numericMonth = Number(month);
    const numericDay = Number(day);

    if (
      Number.isNaN(numericMonth) ||
      Number.isNaN(numericDay) ||
      numericMonth < 1 ||
      numericMonth > 12 ||
      numericDay < 1 ||
      numericDay > 31
    ) {
      return Alert.alert("Please enter a valid month/day");
    }

    const eventDate = new Date(
      Number(displayYear),
      numericMonth - 1,
      numericDay,
      12,
      0,
      0,
    );

    try {
      setIsSubmitting(true);
      await boilerbuzzApi.createPoster({
        club_id: selectedClubId,
        user_id: 1,
        location,
        position: "(0,0)",
        img_path: fileUri,
        date: eventDate.toISOString(),
      });

      Alert.alert("Event added", `${eventName} has been posted.`);
      navigation.goBack();
    } catch (err) {
      console.error("Failed to create event", err);
      Alert.alert("Error", "Failed to add event to backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.safe}>
      <HeaderBanner title="ADD EVENT" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.inner, { width: containerWidth }]}>
          {/* Event Name */}
          <Text style={styles.label}>
            Event Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={eventName}
            onChangeText={setEventName}
            placeholder="Event name"
            placeholderTextColor={theme.colors.darkGrey}
            style={styles.input}
          />

          {/* Flyer upload */}
          <Text style={[styles.label, { marginTop: 20 }]}>Flyer</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={pickDocument}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadPlus}>+</Text>
            <Text style={styles.uploadText}>
              {fileName ? fileName : "Upload File"}
            </Text>
          </TouchableOpacity>

          {/* Location */}
          <Text style={[styles.label, { marginTop: 20 }]}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor={theme.colors.darkGrey}
            style={styles.input}
          />

          {/* Date row */}
          <Text style={[styles.label, { marginTop: 20 }]}>Date</Text>
          <View style={styles.dateRow}>
            <View style={styles.smallCol}>
              <Text style={styles.smallLabel}>Month</Text>
              <TextInput
                value={month}
                onChangeText={setMonth}
                placeholder="MM"
                placeholderTextColor={theme.colors.darkGrey}
                style={styles.smallInput}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Text style={styles.slash}>/</Text>

            <View style={styles.smallCol}>
              <Text style={styles.smallLabel}>Day</Text>
              <TextInput
                value={day}
                onChangeText={setDay}
                placeholder="DD"
                placeholderTextColor={theme.colors.darkGrey}
                style={styles.smallInput}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>

            <Text style={styles.slash}>/</Text>

            <View style={styles.yearCol}>
              <Text style={styles.smallLabel}>Year</Text>
              <Text style={styles.yearText}>{displayYear}</Text>
            </View>

            {/* optional calendar icon - replace with your SVG/PNG */}
            {/* <Image source={require('../../assets/calendar.png')} style={styles.calendarIcon} /> */}
          </View>

          {/* Club picker (simple touchable for now) */}
          <Text style={[styles.label, { marginTop: 20 }]}>
            Club <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.input} onPress={onSelectClub}>
            <Text
              style={[
                styles.inputText,
                { color: selectedClubId ? "#000" : theme.colors.darkGrey },
              ]}
            >
              {selectedClubId ? `Club #${selectedClubId}` : "Select a club"}
            </Text>
            <Text style={styles.chev}>▾</Text>
          </TouchableOpacity>

          <Text style={[theme.h3, styles.clubCountText]}>
            {clubs.length} club(s) available from backend
          </Text>

          <View style={{ height: 28 }} />

          <MyButton
            title={isSubmitting ? "Adding Event..." : "Add Event"}
            onPress={onSubmit}
            style={styles.addButton}
            textStyle={styles.addButtonText}
          />

          {/* Spacer so content isn't hidden by tab bar */}
          <View style={{ height: TAB_BAR_SAFE }} />
        </View>
      </ScrollView>
    </View>
  );
}

const TAB_BAR_SAFE = TAB_BAR_SAFE_CONST();

function TAB_BAR_SAFE_CONST() {
  return 100 + (Platform.OS === "ios" ? 18 : 8);
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 0,
    paddingBottom: 24,
    alignItems: "center",
  },
  inner: {
    paddingTop: 14,
    alignSelf: "center",
  },
  label: {
    fontFamily: theme.fonts.body,
    color: theme.colors.darkGrey,
    fontSize: theme.h1.fontSize,
    marginBottom: 8,
  },
  required: {
    color: "#D9534F",
  },
  input: {
    backgroundColor: theme.colors.highlight,
    borderRadius: 12,
    borderWidth: 1.25,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
    fontFamily: theme.fonts.body,
    fontSize: 16,
    color: "#000",
    flexDirection: "row",
    alignItems: "center",
  },
  inputText: {
    fontFamily: theme.fonts.body,
    fontSize: 16,
  },

  uploadBox: {
    backgroundColor: theme.colors.highlight,
    borderRadius: 12,
    borderWidth: 1.25,
    borderColor: theme.colors.lightGrey,
    minHeight: 140,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadPlus: {
    fontSize: 42,
    color: theme.colors.darkGrey,
    marginBottom: 8,
    fontFamily: theme.fonts.heading,
  },
  uploadText: {
    fontFamily: theme.fonts.body,
    color: theme.colors.darkGrey,
    fontSize: 16,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  smallCol: {
    alignItems: "flex-start",
    marginRight: 6,
  },
  smallLabel: {
    fontFamily: theme.fonts.body,
    color: theme.colors.darkGrey,
    fontSize: theme.h3.fontSize,
    marginBottom: 6,
  },
  smallInput: {
    backgroundColor: theme.colors.highlight,
    borderRadius: 10,
    borderWidth: 1.25,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: "center",
    fontFamily: theme.fonts.body,
    color: "#000",
  },
  slash: {
    marginHorizontal: 6,
    fontSize: 20,
    color: theme.colors.darkGrey,
  },
  yearCol: {
    marginLeft: 6,
    alignItems: "flex-start",
  },
  yearText: {
    fontFamily: theme.fonts.body,
    fontSize: 18,
    color: theme.colors.darkGrey,
  },
  clubCountText: {
    marginTop: 10,
    color: theme.colors.darkGrey,
  },

  // Add button (large orange pill)
  addButton: {
    marginHorizontal: 6,
    alignSelf: "center",
    width: "100%",
    // make button tall and pill shaped
    borderRadius: 999,
  },
  addButtonText: {
    fontSize: 22,
    color: "#000",
  },

  calendarIcon: {
    width: 36,
    height: 36,
    marginLeft: 12,
    resizeMode: "contain",
  },

  chev: {
    position: "absolute",
    right: 14,
    color: theme.colors.darkGrey,
    fontSize: 18,
  },
});
