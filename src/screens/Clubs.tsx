import React, { useState, useMemo } from "react"; // ✅ ADDED
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList, 
} from "react-native"; 

import { useNavigation } from "@react-navigation/native";
import HeaderBanner from "../components/HeaderBanner";
import ClubCard from "../components/ClubCard"; 
import theme from "../theme";
import { useAuth, useUser } from "@clerk/clerk-expo";

export default function Clubs() {

  const navigation = useNavigation();

  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");


  const clubs = useMemo(() => {
    return [];
  }, [sortBy]);

  return (
    <View style={styles.container}>
      <HeaderBanner
          title="CLUBS"
        />

      <View style={styles.topRow}>
        <Text style={styles.countText}>{clubs.length} Clubs</Text>}

        <TouchableOpacity style={styles.sortButtons}>
          
          <Text>Recently Followed</Text>
        </TouchableOpacity>
      </View>

      
      <FlatList
        data={clubs}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item }) => <ClubCard />}
        contentContainerStyle={{ paddingHorizontal: 18 }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors?.background ?? '#F7F2E8'}, 
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  countText: {fontsize: 16, color: "#9C9C9C" },
  sortButtons: {
    borderwidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  }
});

