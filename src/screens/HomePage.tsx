import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";
import theme from "../theme";
import HeaderBanner from "../components/HeaderBanner";
import PosterCard from "../components/PosterCard";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { boilerbuzzApi } from "../api/boilerbuzzApi";

type HomePosterCard = {
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

const carouselColors = ["#EDECDD", "#F5D6C6", "#C8E1E7", "#DDEED1", "#FBE2E5"];

const buildClubLogo = (clubId: number) =>
  `https://ui-avatars.com/api/?name=Club+${clubId}&background=feb210&color=07112a`;

const toHomePosterCard = (poster: {
  id: number;
  club_id: number;
  location: string;
  date: string;
  img_path: string;
}): HomePosterCard => ({
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

export default function HomePage() {
  const [events, setEvents] = React.useState<HomePosterCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadFeed = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const posters = await boilerbuzzApi.getPosters();
      const cards = posters
        .slice()
        .sort((a, b) => b.id - a.id)
        .map((poster) => toHomePosterCard(poster));

      setEvents(cards);
    } catch (err) {
      console.error("Failed to load feed", err);
      setError("Could not load events from backend.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const carouselItems = React.useMemo(() => {
    return carouselColors.map((color, index) => ({
      id: index + 1,
      title: `Featured ${index + 1}`,
      color,
    }));
  }, []);

  return (
    <View style={styles.container}>
      <HeaderBanner title="Home" />

      {isLoading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={theme.colors.navyBlue} />
          <Text style={theme.h2}>Loading posters...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.statusContainer}>
          <Text style={[theme.h2, styles.errorText]}>{error}</Text>
          <TouchableOpacity onPress={loadFeed} style={styles.retryButton}>
            <Text style={theme.h2Bold}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PosterCard {...item} />}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <FeaturedCarousel items={carouselItems} />
          </>
        }
        ListEmptyComponent={
          !isLoading && !error ? (
            <Text style={[theme.h2, styles.emptyState]}>
              No posters found yet.
            </Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusContainer: {
    alignItems: "center",
    gap: 10,
    marginVertical: 12,
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
