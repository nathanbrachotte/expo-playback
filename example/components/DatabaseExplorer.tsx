import { useLiveQuery, drizzle } from "drizzle-orm/expo-sqlite";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as FileSystem from "expo-file-system";
import { openDatabaseSync } from "expo-sqlite";
import React from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";

import * as schema from "../db/schema";
import migrations from "../drizzle/migrations";

const dbPath = FileSystem.documentDirectory;
const expo = openDatabaseSync(
  "purecast_main_db.sqlite",
  {
    enableChangeListener: true,
  },
  dbPath!
);

const db = drizzle(expo);

export function DatabaseExplorer() {
  const { data: podcasts } = useLiveQuery(db.select().from(schema.podcasts));
  const { data: episodes } = useLiveQuery(db.select().from(schema.episodes));
  const { data: episodeMetadata } = useLiveQuery(
    db.select().from(schema.episodeMetadata)
  );

  const { success, error } = useMigrations(db, migrations);

  const addMockPodcast = async () => {
    await db.insert(schema.podcasts).values({
      title: "Test Podcast " + Math.random().toString(36).substring(7),
      description: "This is a test podcast description",
      image: "https://example.com/test-image.jpg",
      downloadUrl: "https://example.com/test-audio.mp3",
    });
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
      duration: Math.floor(Math.random() * 3600), // Random duration up to 1 hour
    });
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
        <Text style={styles.dataText}>
          {JSON.stringify(episodeMetadata, null, 2)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});
