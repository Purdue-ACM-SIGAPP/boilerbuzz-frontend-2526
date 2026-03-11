import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../theme";
import HeaderBanner from "../components/HeaderBanner";
import ClubBanner from "../components/ClubBanner";
import SearchBar from "../components/SearchBar";
import PosterCard from "../components/PosterCard";
import { boilerbuzzApi } from "../api/boilerbuzzApi";

type FindPosterCard = {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  description: string;
  clubName: string;
  clubLogo: string;
  attendees: [];
  comments: [];
  posterImageUri: string;
  likeCount: number;
};

const buildClubLogo = (clubId: number) =>
  `https://ui-avatars.com/api/?name=Club+${clubId}&background=feb210&color=07112a`;

const toFindPosterCard = (poster: {
  id: number;
  club_id: number;
  location: string;
  date: string;
  img_path: string;
}): FindPosterCard => ({
  id: String(poster.id),
  eventTitle: `Poster ${poster.id}`,
  eventDate: new Date(poster.date).toLocaleDateString(),
  eventLocation: poster.location,
  description: poster.location,
  clubName: `Club #${poster.club_id}`,
  clubLogo: buildClubLogo(poster.club_id),
  attendees: [],
  comments: [],
  posterImageUri: poster.img_path,
  likeCount: 0,
});

export default function FindPage() {
  const [query, setQuery] = React.useState("");
  const [clubsCount, setClubsCount] = React.useState(0);
  const [posters, setPosters] = React.useState<FindPosterCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [postersResponse, clubsResponse] = await Promise.all([
        boilerbuzzApi.getPosters(),
        boilerbuzzApi.getClubs(),
      ]);

      setPosters(
        postersResponse
          .slice()
          .sort((a, b) => b.id - a.id)
          .map((poster) => toFindPosterCard(poster)),
      );
      setClubsCount(clubsResponse.length);
    } catch (err) {
      console.error("Failed to load find page data", err);
      setError("Could not load backend data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const runBackendSearch = React.useCallback(async () => {
    const cleanedQuery = query.trim();
    if (!cleanedQuery) {
      loadData();
      return;
    }

    try {
      setIsLoading(true);
      const response = await boilerbuzzApi.searchPosters(cleanedQuery);
      setPosters(response.posters.map((poster) => toFindPosterCard(poster)));
      setError(null);
    } catch (err) {
      console.error("Search failed", err);
      setError("Search failed. Please try another term.");
    } finally {
      setIsLoading(false);
    }
  }, [loadData, query]);

  const localFilteredPosters = React.useMemo(() => {
    const cleanedQuery = query.trim().toLowerCase();
    if (!cleanedQuery) {
      return posters;
    }

    return posters.filter((poster) => {
      return (
        poster.eventLocation.toLowerCase().includes(cleanedQuery) ||
        poster.clubName.toLowerCase().includes(cleanedQuery) ||
        poster.description.toLowerCase().includes(cleanedQuery)
      );
    });
  }, [posters, query]);

  return (
    <View style={styles.container}>
      <HeaderBanner title="Find Events" />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onSubmit={runBackendSearch}
        placeholder="Search tags, clubs, or locations"
      />
      <ClubBanner title="Clubs" subtitle={`${clubsCount} total clubs`} />

      {isLoading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={theme.colors.navyBlue} />
          <Text style={theme.h2}>Loading results...</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.statusContainer}>
          <Text style={[theme.h2, styles.errorText]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={theme.h2Bold}>Reload</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={localFilteredPosters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PosterCard {...item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={[theme.h2, styles.emptyState]}>
              No posters matched your search.
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  listContent: {
    width: "100%",
    paddingBottom: 60,
  },
  statusContainer: {
    marginTop: 16,
    alignItems: "center",
    gap: 10,
  },
  retryButton: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: theme.colors.lightGrey,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.highlight,
  },
  errorText: {
    color: "#B33A3A",
  },
  emptyState: {
    textAlign: "center",
    marginTop: 24,
  },
});
