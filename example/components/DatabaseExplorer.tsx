import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import React, { useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { db, schema } from "../db/client";
import migrations from "../drizzle/migrations";

interface iTunesPodcast {
  collectionId: number;
  collectionName: string;
  artistName: string;
  description: string;
  artworkUrl600: string;
  feedUrl: string;
}

export function DatabaseExplorer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<iTunesPodcast[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: podcasts } = useLiveQuery(db.select().from(schema.podcasts));
  const { data: episodes } = useLiveQuery(db.select().from(schema.episodes));
  const { data: episodeMetadata } = useLiveQuery(db.select().from(schema.episodeMetadata));

  const { success, error } = useMigrations(db, migrations);

  const searchPodcasts = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(
          searchTerm
        )}&country=DE`
      );
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error("Error searching podcasts:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const addPodcastFromSearch = async (podcast: iTunesPodcast) => {
    await db.insert(schema.podcasts).values({
      title: podcast.collectionName,
      description: podcast.description || "No description available",
      image: podcast.artworkUrl600,
    } satisfies typeof schema.podcasts.$inferInsert);
  };

  const addMockPodcast = async () => {
    await db.insert(schema.podcasts).values({
      title: "Test Podcast " + Math.random().toString(36).substring(7),
      description: "This is a test podcast description",
      image: "https://example.com/test-image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies typeof schema.podcasts.$inferInsert);
  };

  const addMockEpisode = async () => {
    if (!podcasts?.length) {
      console.log("No podcasts available to link episode to");
      return;
    }
    const randomPodcast = podcasts[Math.floor(Math.random() * podcasts.length)];

    await db.insert(schema.episodes).values({
      id: Math.floor(Math.random() * 1000000), // Random ID since it's not auto-increment
      podcastId: randomPodcast.id,
      title: "Test Episode " + Math.random().toString(36).substring(7),
      description: "This is a test episode description",
      image: "https://example.com/test-episode-image.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      duration: Math.floor(Math.random() * 3600), // Random duration up to 1 hour
      downloadUrl: "https://example.com/test-audio.mp3",
    } satisfies typeof schema.episodes.$inferInsert);
  };

  const addMockEpisodeMetadata = async () => {
    if (!episodes?.length) {
      console.log("No episodes available to add metadata to");
      return;
    }
    const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)];

    await db.insert(schema.episodeMetadata).values({
      episodeId: randomEpisode.id,
      playback: Math.floor(Math.random() * 100),
      isFinished: Math.random() > 0.5,
      downloadProgress: Math.floor(Math.random() * 100),
      fileSize: Math.floor(Math.random() * 10000000), // Random file size up to 10MB
    });
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }
  if (!success) {
    return (
      <View style={styles.container}>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search podcasts..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={searchPodcasts}
        />
        <Button
          title={isSearching ? "Searching..." : "Search"}
          onPress={searchPodcasts}
          disabled={isSearching}
        />
      </View>

      {searchResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search Results</Text>
          {searchResults.map((podcast) => (
            <View key={podcast.collectionId} style={styles.searchResult}>
              <Text style={styles.podcastTitle}>{podcast.collectionName}</Text>
              <Text style={styles.podcastArtist}>{podcast.artistName}</Text>
              <Button title="Add to Database" onPress={() => addPodcastFromSearch(podcast)} />
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Podcasts</Text>
        <Button title="Add Mock Podcast" onPress={addMockPodcast} />
        <Text style={styles.dataText}>{JSON.stringify(podcasts, null, 2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Episodes</Text>
        <Button title="Add Mock Episode" onPress={addMockEpisode} />
        <Text style={styles.dataText}>{JSON.stringify(episodes, null, 2)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Episode Metadata</Text>
        <Button title="Add Mock Metadata" onPress={addMockEpisodeMetadata} />
        <Text style={styles.dataText}>{JSON.stringify(episodeMetadata, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  dataText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: "monospace",
  },
  searchResult: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  podcastArtist: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
});

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
