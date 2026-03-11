// screens/PinnedPage.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Images from "../../assets";
import { boilerbuzzApi } from "../api/boilerbuzzApi";
import BulletinPoster, { PosterData } from "../components/BulletinPoster";
import PackedScatterGrid, {
  ScatterItem,
} from "../components/PackedScatterGrid";
import PanBoard from "../components/PanBoard";

export default function PinnedPage() {
  const [allPosters, setAllPosters] = useState<PosterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPinnedPosters = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const posters = await boilerbuzzApi.getPosters();

      setAllPosters(
        posters.map((poster) => ({
          id: String(poster.id),
          title: `Poster ${poster.id}`,
          image: poster.img_path ? { uri: poster.img_path } : Images.icon,
          likes: 1,
          link: { type: "tab", name: "Home" },
        })),
      );
    } catch (err) {
      console.error("Failed to load pinned posters", err);
      setError("Unable to load posters.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPinnedPosters();
  }, [loadPinnedPosters]);

  // Making a hash map to get poster data from id
  const postersById = useMemo(
    () => Object.fromEntries(allPosters.map((poster) => [poster.id, poster])),
    [allPosters],
  );

  // Convert posters to items for scattergrid
  const items: ScatterItem[] = useMemo(
    () =>
      allPosters.map((poster) => ({
        id: poster.id,
        width: 170,
        height: 255,
      })),
    [allPosters],
  );

  const [canvas, setCanvas] = useState({ w: 2000, h: 2000 });
  const [viewport, setViewport] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [contentReady, setContentReady] = useState(false);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.statusText}>Loading pinned posters...</Text>
        </View>
      ) : null}

      {!isLoading && error ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{error}</Text>
        </View>
      ) : null}

      <PanBoard
        canvasWidth={canvas.w}
        canvasHeight={canvas.h}
        onViewportChange={setViewport}
        enabled={contentReady}
      >
        <PackedScatterGrid
          items={items}
          spacing={8}
          compactness={0.25}
          padding={80}
          visibleRect={viewport ?? undefined}
          renderDistance={300}
          onContentSize={(w, h) => {
            const nextW = Math.max(canvas.w, w);
            const nextH = Math.max(canvas.h, h);
            if (nextW !== canvas.w || nextH !== canvas.h) {
              setCanvas({ w: nextW, h: nextH });
            }
            if (!contentReady) {
              setContentReady(true);
            }
          }}
          renderItem={(node) => {
            const data = postersById[node.id];
            return (
              <BulletinPoster
                data={data}
                width={node.width}
                height={node.height}
              />
            );
          }}
        />
      </PanBoard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0b0c" },
  statusContainer: {
    position: "absolute",
    top: 24,
    alignSelf: "center",
    zIndex: 5,
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    color: "#FFFFFF",
  },
});
