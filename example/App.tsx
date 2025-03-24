import * as FileSystem from "expo-file-system";
import * as ExpoPlayback from "expo-playback";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { DatabaseExplorer } from "./components/DatabaseExplorer";
import { resetDatabase } from "./db/utils";

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    // Example podcast URL and skip segments
    const podcastUrl =
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3";
    const audioDirectory = FileSystem.documentDirectory + "audio/";

    const ensureAudioDirectory = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(audioDirectory);

        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(audioDirectory, {
            intermediates: true,
          });
          console.log("Folder created successfully");
        } else {
          console.log("Folder already exists");
        }
      } catch (error) {
        console.log("Error creating folder:", error);
      }
    };

    const audioFile = audioDirectory + "podcast_1";

    const run = async () => {
      await ensureAudioDirectory();
      console.log(await FileSystem.readDirectoryAsync(audioDirectory));
      await FileSystem.downloadAsync(podcastUrl, audioFile);
      console.log(await FileSystem.readDirectoryAsync(audioDirectory));
    };
    run();

    const skipSegments = [
      { startTime: 10, endTime: 20 }, // Skip 30-45 seconds
      { startTime: 30, endTime: 40 }, // Skip 30-45 seconds
      { startTime: 120, endTime: 180 }, // Skip 2-3 minutes
    ];

    // Initialize player
    ExpoPlayback.initializePlayer(audioFile, skipSegments);

    // Listen for playback status updates
    const statusSubscription = ExpoPlayback.addPlaybackStatusListener(
      (status) => {
        setIsPlaying(status.isPlaying);
        setCurrentTime(status.currentTime);
        setDuration(status.duration);
      }
    );

    // Listen for skip segment events
    const skipSubscription = ExpoPlayback.addSkipSegmentListener((event) => {
      console.log(
        `Skipping segment from ${event.startTime} to ${event.endTime}`
      );
    });

    // Cleanup
    return () => {
      statusSubscription.remove();
      skipSubscription.remove();
      ExpoPlayback.cleanup();
    };
  }, []);

  const togglePlayback = async () => {
    if (isPlaying) {
      await ExpoPlayback.pause();
    } else {
      await ExpoPlayback.play();
    }
  };

  const handleResetDatabase = async () => {
    try {
      setIsResetting(true);
      await resetDatabase();
      console.log("Database reset successfully");
    } catch (error) {
      console.error("Failed to reset database:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purecast Player</Text>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
      <View style={styles.controls}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayback} />
        <Button
          title={isResetting ? "Resetting..." : "Reset DB"}
          onPress={handleResetDatabase}
          disabled={isResetting}
        />
      </View>
      <View style={styles.databaseSection}>
        <Text style={styles.sectionTitle}>Database Explorer</Text>
        <DatabaseExplorer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timeContainer: {
    marginVertical: 20,
  },
  timeText: {
    fontSize: 18,
  },
  controls: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  databaseSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
